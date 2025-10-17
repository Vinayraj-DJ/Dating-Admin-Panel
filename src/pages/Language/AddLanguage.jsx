// // src/pages/Language/AddLanguage.jsx
// import React, { useEffect, useState } from "react";
// import styles from "./AddLanguage.module.css";
// import HeadingAndData from "../../components/HeadingAndData/HeadingAndData";
// import HeadingAndDropDown from "../../components/HeadingAndDropdown/HeadingAndDropdown";
// import Button from "../../components/Button/Button";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   addLanguage,
//   updateLanguage,
//   getAllLanguages,
// } from "../../services/languageService";
// import { API_BASE } from "../../config/apiConfig";

// const fixIconUrl = (icon) => {
//   if (!icon) return "";
//   if (/^https?:\/\//i.test(icon)) return icon;
//   if (!API_BASE) return icon;
//   return `${API_BASE}/${String(icon).replace(/^\/+/, "")}`;
// };

// export default function AddLanguage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const isEdit = Boolean(id);

//   const [form, setForm] = useState({
//     name: "",
//     status: "Unpublish",
//     iconFile: null,
//     previewUrl: "",
//   });

//   const [initial, setInitial] = useState({
//     name: "",
//     status: "Unpublish",
//     icon: "",
//   });

//   const [saving, setSaving] = useState(false);
//   const [err, setErr] = useState("");
//   const [notice, setNotice] = useState("");

//   // preload when editing
//   useEffect(() => {
//     if (!isEdit) return;
//     const ctrl = new AbortController();
//     let ignore = false;

//     (async () => {
//       try {
//         const res = await getAllLanguages({ signal: ctrl.signal });
//         const items = Array.isArray(res?.data) ? res.data : [];
//         const found = items.find((x) => x._id === id);
//         if (!ignore && found) {
//           const iconUrl = fixIconUrl(found.icon || "");
//           setInitial({
//             name: found.name || "",
//             status: found.status || "Unpublish",
//             icon: iconUrl,
//           });
//           setForm((p) => ({
//             ...p,
//             name: found.name || "",
//             status: found.status || "Unpublish",
//             iconFile: null,
//             previewUrl: iconUrl,
//           }));
//           setErr("");
//         } else if (!ignore) {
//           setErr("Item not found.");
//         }
//       } catch {
//         if (!ignore) setErr("Failed to load item for edit");
//       }
//     })();

//     return () => {
//       ignore = true;
//       ctrl.abort();
//     };
//   }, [id, isEdit]);

//   const onChange = (e) => {
//     const { name, value } = e.target;
//     setForm((p) => ({ ...p, [name]: value }));
//   };

//   const onFileChange = (e) => {
//     const file = e.target.files?.[0] || null;
//     if (!file) {
//       setForm((p) => ({ ...p, iconFile: null, previewUrl: initial.icon }));
//       return;
//     }
//     setForm((p) => ({
//       ...p,
//       iconFile: file,
//       previewUrl: URL.createObjectURL(file),
//     }));
//   };

//   const submit = async (e) => {
//     e.preventDefault();
//     setErr("");
//     setNotice("");

//     const name = form.name.trim();
//     if (!name) return setErr("Title is required");
//     if (!isEdit && !form.iconFile) return setErr("Please choose an image");
//     if (saving) return;

//     const ctrl = new AbortController();

//     try {
//       setSaving(true);

//       if (isEdit) {
//         // send only changed fields (plus id)
//         const patch = { id };
//         if (name !== initial.name) patch.name = name;
//         if (form.status !== initial.status) patch.status = form.status;
//         if (form.iconFile) patch.iconFile = form.iconFile;

//         if (
//           !("name" in patch) &&
//           !("status" in patch) &&
//           !("iconFile" in patch)
//         ) {
//           setNotice("No changes to save.");
//           return;
//         }

//         const res = await updateLanguage(patch, { signal: ctrl.signal });

//         const delta = { id };
//         if ("name" in patch) delta.name = patch.name;
//         if ("status" in patch) delta.status = patch.status;
//         // prefer the server's icon path if returned
//         if (form.iconFile) {
//           const updated = res?.data || {};
//           delta.icon = updated.icon || updated.path || updated.file || null;
//         }

//         navigate("/language/listlanguage", { state: { updated: delta } });
//       } else {
//         await addLanguage(
//           { name, status: form.status, iconFile: form.iconFile },
//           { signal: ctrl.signal }
//         );
//         navigate("/language/listlanguage");
//       }
//     } catch (e2) {
//       if (e2?.name === "CanceledError" || e2?.code === "ERR_CANCELED") return;
//       const msg =
//         e2?.response?.data?.message ||
//         (e2?.response?.data?.errors &&
//           JSON.stringify(e2.response.data.errors)) ||
//         e2?.message ||
//         "Save failed";
//       setErr(msg);
//       console.log("Save error:", e2?.response?.status, e2?.response?.data);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <h2 className={styles.heading}>Language Management</h2>

//       <form className={styles.form} onSubmit={submit} noValidate>
//         <div className={styles.block}>
//           <label className={styles.label}>Language Image</label>
//           <input type="file" accept="image/*" onChange={onFileChange} />
//           {form.previewUrl && (
//             <img
//               src={form.previewUrl}
//               alt="preview"
//               style={{
//                 marginTop: 12,
//                 width: 120,
//                 height: 80,
//                 objectFit: "cover",
//                 borderRadius: 8,
//               }}
//               onError={(e) => (e.currentTarget.style.display = "none")}
//             />
//           )}
//         </div>

//         <HeadingAndData
//           label="Language Title"
//           name="name"
//           value={form.name}
//           placeholder="Enter language title"
//           onChange={onChange}
//           required
//         />

//         <HeadingAndDropDown
//           label="Language Status"
//           name="status"
//           value={form.status}
//           onChange={onChange}
//           options={[
//             { value: "Publish", label: "Publish" },
//             { value: "Unpublish", label: "Unpublish" },
//           ]}
//           placeholder="Select Status"
//           required
//         />

//         {!!err && <div className={styles.error}>{err}</div>}
//         {!!notice && <div className={styles.notice}>{notice}</div>}

//         <div className={styles.buttonContainer}>
//           <Button
//             backgroundColor="var(--Primary_Color)"
//             textColor="#fff"
//             disabled={saving}
//           >
//             {saving
//               ? isEdit
//                 ? "Updating..."
//                 : "Saving..."
//               : isEdit
//               ? "Edit Language"
//               : "Add Language"}
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }



// src/pages/Language/AddLanguage.jsx
import React, { useEffect, useState } from "react";
import styles from "./AddLanguage.module.css";
import HeadingAndData from "../../components/HeadingAndData/HeadingAndData";
import HeadingAndDropDown from "../../components/HeadingAndDropdown/HeadingAndDropdown";
import Button from "../../components/Button/Button";
import { useNavigate, useParams } from "react-router-dom";
import {
  addLanguage,
  updateLanguage,
  getAllLanguages,
} from "../../services/languageService";
import { API_BASE } from "../../config/apiConfig";

const fixIconUrl = (icon) => {
  if (!icon) return "";
  if (/^https?:\/\//i.test(icon)) return icon;
  if (!API_BASE) return icon;
  return `${API_BASE}/${String(icon).replace(/^\/+/, "")}`;
};

export default function AddLanguage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    status: "Unpublish",
    iconFile: null,
    previewUrl: "",
  });

  const [initial, setInitial] = useState({
    name: "",
    status: "Unpublish",
    icon: "",
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  // preload when editing
  useEffect(() => {
    if (!isEdit) return;
    const ctrl = new AbortController();
    let ignore = false;

    (async () => {
      try {
        const res = await getAllLanguages({ signal: ctrl.signal });
        const items = Array.isArray(res?.data) ? res.data : [];
        const found = items.find((x) => x._id === id);
        if (!ignore && found) {
          // backend may use 'title' or 'name' for the text field
          const title = found.title ?? found.name ?? "";
          // backend may use 'image' or 'icon' or 'path' etc for file field
          const iconField = found.image ?? found.icon ?? found.path ?? found.file ?? "";
          const iconUrl = fixIconUrl(iconField);

          setInitial({
            name: title,
            status: found.status || "Unpublish",
            icon: iconUrl,
          });

          setForm((p) => ({
            ...p,
            name: title,
            status: found.status || "Unpublish",
            iconFile: null,
            previewUrl: iconUrl,
          }));
          setErr("");
        } else if (!ignore) {
          setErr("Item not found.");
        }
      } catch {
        if (!ignore) setErr("Failed to load item for edit");
      }
    })();

    return () => {
      ignore = true;
      ctrl.abort();
    };
  }, [id, isEdit]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setForm((p) => ({ ...p, iconFile: null, previewUrl: initial.icon }));
      return;
    }
    setForm((p) => ({
      ...p,
      iconFile: file,
      previewUrl: URL.createObjectURL(file),
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setNotice("");

    const name = form.name.trim();
    if (!name) return setErr("Title is required");
    if (!isEdit && !form.iconFile) return setErr("Please choose an image");
    if (saving) return;

    const ctrl = new AbortController();

    try {
      setSaving(true);

      if (isEdit) {
        // send only changed fields (plus id)
        const patch = { id };
        if (name !== initial.name) patch.name = name;
        if (form.status !== initial.status) patch.status = form.status;
        if (form.iconFile) patch.iconFile = form.iconFile;

        if (
          !("name" in patch) &&
          !("status" in patch) &&
          !("iconFile" in patch)
        ) {
          setNotice("No changes to save.");
          setSaving(false);
          return;
        }

        const res = await updateLanguage(patch, { signal: ctrl.signal });

        const delta = { id };
        if ("name" in patch) delta.name = patch.name;
        if ("status" in patch) delta.status = patch.status;
        if (form.iconFile) {
          const updated = res?.data || {};
          delta.icon = updated.image || updated.icon || updated.path || null;
        }

        navigate("/language/listlanguage", { state: { updated: delta } });
      } else {
        await addLanguage(
          { name, status: form.status, iconFile: form.iconFile },
          { signal: ctrl.signal }
        );
        navigate("/language/listlanguage");
      }
    } catch (e2) {
      if (e2?.name === "CanceledError" || e2?.code === "ERR_CANCELED") return;
      const msg =
        e2?.response?.data?.message ||
        (e2?.response?.data?.errors &&
          JSON.stringify(e2.response.data.errors)) ||
        e2?.message ||
        "Save failed";
      setErr(msg);
      console.log("Save error:", e2?.response?.status, e2?.response?.data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Language Management</h2>

      <form className={styles.form} onSubmit={submit} noValidate>
        <div className={styles.block}>
          <label className={styles.label}>Language Image</label>
          <input type="file" accept="image/*" onChange={onFileChange} />
          {form.previewUrl && (
            <img
              src={form.previewUrl}
              alt="preview"
              style={{
                marginTop: 12,
                width: 120,
                height: 80,
                objectFit: "cover",
                borderRadius: 8,
              }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
        </div>

        <HeadingAndData
          label="Language Title"
          name="name"
          value={form.name}
          placeholder="Enter language title"
          onChange={onChange}
          required
        />

        <HeadingAndDropDown
          label="Language Status"
          name="status"
          value={form.status}
          onChange={onChange}
          options={[
            { value: "Publish", label: "Publish" },
            { value: "Unpublish", label: "Unpublish" },
          ]}
          placeholder="Select Status"
          required
        />

        {!!err && <div className={styles.error}>{err}</div>}
        {!!notice && <div className={styles.notice}>{notice}</div>}

        <div className={styles.buttonContainer}>
          <Button
            backgroundColor="var(--Primary_Color)"
            textColor="#fff"
            disabled={saving}
          >
            {saving
              ? isEdit
                ? "Updating..."
                : "Saving..."
              : isEdit
              ? "Edit Language"
              : "Add Language"}
          </Button>
        </div>
      </form>
    </div>
  );
}
