// import React, { useEffect, useMemo, useState } from "react";
// import styles from "./AddPage.module.css";
// import { useParams, useNavigate } from "react-router-dom";
// import { Editor } from "react-draft-wysiwyg";
// import {
//   EditorState,
//   convertToRaw,
//   ContentState,
//   convertFromHTML,
// } from "draft-js";
// import draftToHtml from "draftjs-to-html";
// import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// import { addPage, updatePage, getAllPages } from "../../services/pageService";

// export default function AddPage() {
//   const { id } = useParams();
//   const isEdit = Boolean(id);
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     title: "",
//     status: "Publish", // default matches backend casing
//   });
//   const [initial, setInitial] = useState({
//     title: "",
//     status: "Publish",
//     description: "",
//   });

//   const [editorState, setEditorState] = useState(EditorState.createEmpty());
//   const [saving, setSaving] = useState(false);
//   const [err, setErr] = useState("");
//   const [notice, setNotice] = useState("");

//   // Load page for editing (API only has GET all => find by id)
//   useEffect(() => {
//     if (!isEdit) return;
//     const ctrl = new AbortController();
//     let active = true;

//     (async () => {
//       try {
//         const res = await getAllPages({ signal: ctrl.signal });
//         const items = Array.isArray(res?.data) ? res.data : [];
//         const found = items.find((p) => p._id === id);
//         if (!active) return;
//         if (!found) {
//           setErr("Page not found.");
//           return;
//         }

//         const desc = String(found.description || "");
//         const blocks = convertFromHTML(desc);
//         const content = ContentState.createFromBlockArray(
//           blocks.contentBlocks,
//           blocks.entityMap
//         );

//         setInitial({
//           title: found.title || "",
//           status: found.status || "Publish",
//           description: desc,
//         });
//         setForm({
//           title: found.title || "",
//           status: found.status || "Publish",
//         });
//         setEditorState(EditorState.createWithContent(content));
//         setErr("");
//       } catch (e) {
//         if (e?.name !== "CanceledError" && e?.code !== "ERR_CANCELED") {
//           setErr(
//             e?.response?.data?.message || e?.message || "Failed to load page"
//           );
//         }
//       }
//     })();

//     return () => {
//       active = false;
//       ctrl.abort();
//     };
//   }, [id, isEdit]);

//   const htmlDescription = useMemo(
//     () => draftToHtml(convertToRaw(editorState.getCurrentContent())),
//     [editorState]
//   );

//   // Cheap “empty editor” check
//   const isDescriptionEmpty = useMemo(() => {
//     const stripped = htmlDescription.replace(/<[^>]*>/g, "").trim();
//     return stripped.length === 0;
//   }, [htmlDescription]);

//   const onChange = (e) => {
//     const { name, value } = e.target;
//     setForm((p) => ({ ...p, [name]: value }));
//   };

//   const submit = async (e) => {
//     e.preventDefault();
//     setErr("");
//     setNotice("");

//     if (!form.title.trim()) return setErr("Title is required");
//     if (isDescriptionEmpty) return setErr("Description is required");

//     const ctrl = new AbortController();

//     try {
//       setSaving(true);

//       if (!isEdit) {
//         await addPage(
//           {
//             title: form.title.trim(),
//             description: htmlDescription,
//             status: form.status,
//           },
//           { signal: ctrl.signal }
//         );
//         navigate("/page/listpage");
//         return;
//       }

//       // if nothing changed, do nothing
//       const noChange =
//         form.title.trim() === initial.title &&
//         form.status === initial.status &&
//         htmlDescription === initial.description;

//       if (noChange) {
//         setNotice("No changes to save.");
//         return;
//       }

//       await updatePage(
//         {
//           id,
//           title: form.title.trim(),
//           description: htmlDescription,
//           status: form.status,
//         },
//         { signal: ctrl.signal }
//       );

//       // Patch the list view on return
//       navigate("/page/listpage", {
//         state: {
//           updated: { id, title: form.title.trim(), status: form.status },
//         },
//       });
//     } catch (e2) {
//       setErr(
//         e2?.response?.data?.message ||
//           (e2?.response?.data?.errors &&
//             JSON.stringify(e2.response.data.errors)) ||
//           e2?.message ||
//           "Server error"
//       );
//       console.log("Save error:", e2?.response?.status, e2?.response?.data);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <h2 className={styles.heading}>{isEdit ? "Edit Page" : "Add Page"}</h2>

//       <form className={styles.formCard} onSubmit={submit} noValidate>
//         <label>Enter Page Title</label>
//         <input
//           type="text"
//           name="title"
//           value={form.title}
//           onChange={onChange}
//           placeholder="Page title"
//           required
//         />

//         <label>Page Status</label>
//         <select name="status" value={form.status} onChange={onChange} required>
//           <option value="Publish">Publish</option>
//           <option value="UnPublish">UnPublish</option>
//         </select>

//         <label>Page Description</label>
//         <div className={styles.editorWrapper}>
//           <Editor
//             editorState={editorState}
//             onEditorStateChange={setEditorState}
//             toolbar={{
//               options: [
//                 "inline",
//                 "blockType",
//                 "list",
//                 "textAlign",
//                 "link",
//                 "history",
//               ],
//               inline: {
//                 inDropdown: false,
//                 options: [
//                   "bold",
//                   "italic",
//                   "underline",
//                   "monospace",
//                   "strikethrough",
//                   "superscript",
//                   "subscript",
//                 ],
//               },
//               blockType: {
//                 inDropdown: true,
//                 options: ["Normal", "H1", "H2", "H3", "Blockquote"],
//               },
//             }}
//             wrapperClassName={styles.editorWrapper}
//             editorClassName={styles.editor}
//             toolbarClassName={styles.toolbar}
//           />
//         </div>

//         {!!err && <div className={styles.error}>{err}</div>}
//         {!!notice && <div className={styles.notice}>{notice}</div>}

//         <button type="submit" className={styles.submitBtn}>
//           {saving
//             ? isEdit
//               ? "Updating..."
//               : "Saving..."
//             : isEdit
//             ? "Update Page"
//             : "Add Page"}
//         </button>
//       </form>
//     </div>
//   );
// }



// src/pages/Pages/AddPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "./AddPage.module.css";
import { useParams, useNavigate } from "react-router-dom";
import { Editor } from "react-draft-wysiwyg";
import {
  EditorState,
  convertToRaw,
  ContentState,
  convertFromHTML,
} from "draft-js";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import { addPage, updatePage, getAllPages } from "../../services/pageService";

const slugify = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function AddPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    status: "publish", // default lowercase to match backend
  });
  const [initial, setInitial] = useState({
    title: "",
    slug: "",
    status: "publish",
    description: "",
  });

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  // Load page for editing (API only has GET all => find by id)
  useEffect(() => {
    if (!isEdit) return;
    const ctrl = new AbortController();
    let active = true;

    (async () => {
      try {
        const res = await getAllPages({ signal: ctrl.signal });
        const items = Array.isArray(res?.data) ? res.data : [];
        const found = items.find((p) => p._id === id || p.id === id);
        if (!active) return;
        if (!found) {
          setErr("Page not found.");
          return;
        }

        const desc = String(found.description || "");
        const blocks = convertFromHTML(desc);
        const content = ContentState.createFromBlockArray(
          blocks.contentBlocks,
          blocks.entityMap
        );

        // normalize status to lowercase (backend uses 'publish'|'unpublish')
        const normalizedStatus =
          found.status && String(found.status).toLowerCase() === "publish"
            ? "publish"
            : "unpublish";

        const computedSlug = found.slug ?? slugify(found.title ?? "");

        setInitial({
          title: found.title || "",
          slug: computedSlug,
          status: normalizedStatus,
          description: desc,
        });
        setForm({
          title: found.title || "",
          slug: computedSlug,
          status: normalizedStatus,
        });
        setEditorState(EditorState.createWithContent(content));
        setErr("");
      } catch (e) {
        if (e?.name !== "CanceledError" && e?.code !== "ERR_CANCELED") {
          setErr(e?.response?.data?.message || e?.message || "Failed to load page");
        }
      }
    })();

    return () => {
      active = false;
      ctrl.abort();
    };
  }, [id, isEdit]);

  const htmlDescription = useMemo(
    () => draftToHtml(convertToRaw(editorState.getCurrentContent())),
    [editorState]
  );

  // Cheap “empty editor” check
  const isDescriptionEmpty = useMemo(() => {
    const stripped = htmlDescription.replace(/<[^>]*>/g, "").trim();
    return stripped.length === 0;
  }, [htmlDescription]);

  const onChange = (e) => {
    const { name, value } = e.target;

    // auto-generate slug when changing title if slug is empty or matches old auto-slug
    if (name === "title") {
      setForm((p) => {
        const previousAuto = slugify(p.title || "");
        const shouldAuto = !p.slug || p.slug === previousAuto;
        return {
          ...p,
          title: value,
          slug: shouldAuto ? slugify(value) : p.slug,
        };
      });
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setNotice("");

    if (!form.title.trim()) return setErr("Title is required");
    if (isDescriptionEmpty) return setErr("Description is required");

    const ctrl = new AbortController();

    try {
      setSaving(true);

      if (!isEdit) {
        await addPage(
          {
            title: form.title.trim(),
            slug: form.slug ? form.slug.trim() : slugify(form.title),
            description: htmlDescription,
            status: form.status,
          },
          { signal: ctrl.signal }
        );
        navigate("/page/listpage");
        return;
      }

      // if nothing changed, do nothing
      const noChange =
        form.title.trim() === initial.title &&
        (form.slug ? form.slug.trim() : slugify(form.title)) === initial.slug &&
        form.status === initial.status &&
        htmlDescription === initial.description;

      if (noChange) {
        setNotice("No changes to save.");
        setSaving(false);
        return;
      }

      await updatePage(
        {
          id,
          title: form.title.trim(),
          slug: form.slug ? form.slug.trim() : slugify(form.title),
          description: htmlDescription,
          status: form.status,
        },
        { signal: ctrl.signal }
      );

      // Patch the list view on return
      navigate("/page/listpage", {
        state: {
          updated: {
            id,
            title: form.title.trim(),
            slug: form.slug ? form.slug.trim() : slugify(form.title),
            status: form.status,
          },
        },
      });
    } catch (e2) {
      setErr(
        e2?.response?.data?.message ||
          (e2?.response?.data?.errors && JSON.stringify(e2.response.data.errors)) ||
          e2?.message ||
          "Server error"
      );
      console.log("Save error:", e2?.response?.status, e2?.response?.data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>{isEdit ? "Edit Page" : "Add Page"}</h2>

      <form className={styles.formCard} onSubmit={submit} noValidate>
        <label>Enter Page Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={onChange}
          placeholder="Page title"
          required
        />

        <label>Slug</label>
        <input
          type="text"
          name="slug"
          value={form.slug}
          onChange={onChange}
          placeholder="page-slug (auto generated)"
        />

        <label>Page Status</label>
        <select name="status" value={form.status} onChange={onChange} required>
          <option value="publish">Publish</option>
          <option value="unpublish">Unpublish</option>
        </select>

        <label>Page Description</label>
        <div className={styles.editorWrapper}>
          <Editor
            editorState={editorState}
            onEditorStateChange={setEditorState}
            toolbar={{
              options: [
                "inline",
                "blockType",
                "list",
                "textAlign",
                "link",
                "history",
              ],
              inline: {
                inDropdown: false,
                options: [
                  "bold",
                  "italic",
                  "underline",
                  "monospace",
                  "strikethrough",
                  "superscript",
                  "subscript",
                ],
              },
              blockType: {
                inDropdown: true,
                options: ["Normal", "H1", "H2", "H3", "Blockquote"],
              },
            }}
            wrapperClassName={styles.editorWrapper}
            editorClassName={styles.editor}
            toolbarClassName={styles.toolbar}
          />
        </div>

        {!!err && <div className={styles.error}>{err}</div>}
        {!!notice && <div className={styles.notice}>{notice}</div>}

        <button type="submit" className={styles.submitBtn} disabled={saving}>
          {saving ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Update Page" : "Add Page"}
        </button>
      </form>
    </div>
  );
}
