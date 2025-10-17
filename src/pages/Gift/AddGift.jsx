// // src/pages/Gift/AddGift.jsx
// import React, { useEffect, useState } from "react";
// import styles from "./AddGift.module.css";
// import HeadingAndData from "../../components/HeadingAndData/HeadingAndData";
// import HeadingAndDropDown from "../../components/HeadingAndDropdown/HeadingAndDropdown";
// import Button from "../../components/Button/Button";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   addGift,
//   updateGiftPartial,
//   getAllGifts,
// } from "../../services/giftService";
// import { API_BASE } from "../../config/apiConfig";

// const fixIconUrl = (icon) =>
//   !icon
//     ? ""
//     : /^https?:\/\//i.test(icon)
//     ? icon
//     : `${API_BASE}/${String(icon).replace(/^\/+/, "")}`;

// export default function AddGift() {
//   const { id } = useParams();
//   const isEdit = Boolean(id);
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     coin: "",
//     status: "UnPublish",
//     iconFile: null,
//     previewUrl: "",
//   });

//   const [initial, setInitial] = useState({
//     coin: "",
//     status: "UnPublish",
//     icon: "",
//   });

//   const [saving, setSaving] = useState(false);
//   const [err, setErr] = useState("");
//   const [notice, setNotice] = useState("");

//   // Preload when editing
//   useEffect(() => {
//     if (!isEdit) return;
//     const ctrl = new AbortController();
//     let ignore = false;

//     (async () => {
//       try {
//         const res = await getAllGifts({ signal: ctrl.signal });
//         const list = Array.isArray(res?.data) ? res.data : [];
//         const found = list.find((x) => x._id === id);
//         if (!ignore && found) {
//           const iconUrl = fixIconUrl(found.icon || "");
//           const coin = String(found.price ?? found.coin ?? "");
//           const status = found.status || "UnPublish";

//           setInitial({ coin, status, icon: iconUrl });
//           setForm({
//             coin,
//             status,
//             iconFile: null,
//             previewUrl: iconUrl,
//           });
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

//     if (!form.coin || isNaN(Number(form.coin))) {
//       return setErr("Gift coin must be a number");
//     }
//     if (!isEdit && !form.iconFile) return setErr("Please choose an image");

//     // CREATE
//     if (!isEdit) {
//       const ctrl = new AbortController();
//       try {
//         setSaving(true);
//         await addGift(
//           {
//             coin: String(form.coin),
//             status: form.status,
//             iconFile: form.iconFile,
//           },
//           { signal: ctrl.signal }
//         );
//         navigate("/gift/listgift");
//       } catch (e2) {
//         if (e2?.name !== "CanceledError" && e2?.code !== "ERR_CANCELED") {
//           setErr(e2?.response?.data?.message || e2?.message || "Save failed");
//         }
//       } finally {
//         setSaving(false);
//       }
//       return;
//     }

//     // EDIT — compute minimal patch
//     const patch = { id };
//     let changed = false;

//     if (String(form.coin) !== String(initial.coin)) {
//       patch.coin = String(form.coin); // service maps coin -> price
//       changed = true;
//     }
//     if (form.status !== initial.status) {
//       patch.status = form.status;
//       changed = true;
//     }
//     if (form.iconFile) {
//       patch.iconFile = form.iconFile;
//       changed = true;
//     }

//     if (!changed) {
//       setNotice("No changes to save.");
//       return;
//     }

//     // UPDATE (real PUT)
//     const ctrl = new AbortController();
//     try {
//       setSaving(true);
//       const res = await updateGiftPartial(patch, { signal: ctrl.signal });

//       // Delta to patch the list
//       const delta = { id };
//       if ("coin" in patch) delta.coin = patch.coin;
//       if ("status" in patch) delta.status = patch.status;

//       const updated = res?.data || {};
//       if (form.iconFile)
//         delta.icon = updated.icon || updated.path || updated.file || null;

//       navigate("/gift/listgift", { state: { updated: delta } });
//     } catch (e2) {
//       if (e2?.name === "CanceledError" || e2?.code === "ERR_CANCELED") return;
//       setErr(
//         e2?.response?.data?.message ||
//           (e2?.response?.data?.errors &&
//             JSON.stringify(e2.response.data.errors)) ||
//           e2?.message ||
//           "Update failed"
//       );
//       console.log("Update error:", e2?.response?.status, e2?.response?.data);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <h2 className={styles.heading}>Gift Management</h2>

//       <form className={styles.form} onSubmit={submit} noValidate>
//         {/* Image */}
//         <div className={styles.block}>
//           <label className={styles.label}>Gift Image</label>
//           <input type="file" accept="image/*" onChange={onFileChange} />
//           {form.previewUrl ? (
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
//           ) : null}
//         </div>

//         {/* Coin */}
//         <HeadingAndData
//           label="Gift Coin"
//           name="coin"
//           value={form.coin}
//           placeholder="Enter gift coin"
//           onChange={onChange}
//           required
//         />

//         {/* Status */}
//         <HeadingAndDropDown
//           label="Gift Status"
//           name="status"
//           value={form.status}
//           onChange={onChange}
//           options={[
//             { value: "Publish", label: "Publish" },
//             { value: "UnPublish", label: "UnPublish" }, // exact casing
//           ]}
//           placeholder="Select Status"
//           required
//         />

//         {!!err && <div className={styles.error}>{err}</div>}
//         {!!notice && <div className={styles.notice}>{notice}</div>}

//         <div className={styles.buttonContainer}>
//           <Button backgroundColor="var(--Primary_Color)" textColor="#fff">
//             {saving
//               ? isEdit
//                 ? "Updating..."
//                 : "Saving..."
//               : isEdit
//               ? "Edit Gift"
//               : "Add Gift"}
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }



// // src/pages/Gift/AddGift.jsx
// import React, { useEffect, useState } from "react";
// import styles from "./AddGift.module.css";
// import HeadingAndData from "../../components/HeadingAndData/HeadingAndData";
// import HeadingAndDropDown from "../../components/HeadingAndDropdown/HeadingAndDropdown";
// import Button from "../../components/Button/Button";
// import { useParams, useNavigate } from "react-router-dom";
// import { addGift, updateGiftPartial, getAllGifts } from "../../services/giftService";
// import { API_BASE } from "../../config/apiConfig";

// const fixIconUrl = (icon) =>
//   !icon ? "" : /^https?:\/\//i.test(icon) ? icon : `${API_BASE}/${String(icon).replace(/^\/+/, "")}`;

// export default function AddGift() {
//   const { id } = useParams();
//   const isEdit = Boolean(id);
//   const navigate = useNavigate();

//   const [form, setForm] = useState({ coin: "", status: "UnPublish", iconFile: null, previewUrl: "" });
//   const [initial, setInitial] = useState({ coin: "", status: "UnPublish", icon: "" });
//   const [saving, setSaving] = useState(false);
//   const [err, setErr] = useState("");
//   const [notice, setNotice] = useState("");

//   useEffect(() => {
//     if (!isEdit) return;
//     const ctrl = new AbortController();
//     let ignore = false;
//     (async () => {
//       try {
//         const res = await getAllGifts({ signal: ctrl.signal });
//         const list = Array.isArray(res) ? res : (res?.data ?? res ?? []);
//         const found = list.find((x) => x._id === id || x.id === id);
//         if (!ignore && found) {
//           const iconUrl = fixIconUrl(found.icon || found.image || found.path || "");
//           const coin = String(found.price ?? found.coin ?? "");
//           const status = found.status || "UnPublish";
//           setInitial({ coin, status, icon: iconUrl });
//           setForm({ coin, status, iconFile: null, previewUrl: iconUrl });
//         } else if (!ignore) {
//           setErr("Item not found.");
//         }
//       } catch {
//         if (!ignore) setErr("Failed to load item for edit");
//       }
//     })();
//     return () => { ignore = true; ctrl.abort(); };
//   }, [id, isEdit]);

//   const onChange = (e) => { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })); };
//   const onFileChange = (e) => {
//     const file = e.target.files?.[0] || null;
//     if (!file) { setForm(p => ({ ...p, iconFile: null, previewUrl: initial.icon })); return; }
//     setForm(p => ({ ...p, iconFile: file, previewUrl: URL.createObjectURL(file) }));
//   };

//   const submit = async (e) => {
//     e.preventDefault();
//     setErr(""); setNotice("");
//     if (!form.coin || isNaN(Number(form.coin))) return setErr("Gift coin must be a number");
//     if (!isEdit && !form.iconFile) return setErr("Please choose an image");

//     if (!isEdit) {
//       const ctrl = new AbortController();
//       try {
//         setSaving(true);
//         await addGift({ coin: String(form.coin), status: form.status, iconFile: form.iconFile }, { signal: ctrl.signal });
//         navigate("/gift/listgift");
//       } catch (e2) {
//         console.error("Create Gift Error:", e2);
//         setErr(e2?.response?.data?.message || e2?.message || "Save failed");
//       } finally { setSaving(false); }
//       return;
//     }

//     // EDIT
//     const patch = { id }; let changed = false;
//     if (String(form.coin) !== String(initial.coin)) { patch.coin = String(form.coin); changed = true; }
//     if (form.status !== initial.status) { patch.status = form.status; changed = true; }
//     if (form.iconFile) { patch.iconFile = form.iconFile; changed = true; }
//     if (!changed) { setNotice("No changes to save."); return; }

//     const ctrl = new AbortController();
//     try {
//       setSaving(true);
//       const res = await updateGiftPartial(patch, { signal: ctrl.signal });
//       const updated = res || {};
//       const delta = { id };
//       if ("coin" in patch) delta.coin = patch.coin;
//       if ("status" in patch) delta.status = patch.status;
//       if (form.iconFile) delta.icon = updated.icon || updated.path || updated.file || null;
//       navigate("/gift/listgift", { state: { updated: delta } });
//     } catch (e2) {
//       console.error("Update error:", e2);
//       setErr(e2?.response?.data?.message || e2?.message || "Update failed");
//     } finally { setSaving(false); }
//   };

//   return (
//     <div className={styles.container}>
//       <h2 className={styles.heading}>Gift Management</h2>
//       <form className={styles.form} onSubmit={submit} noValidate>
//         <div className={styles.block}>
//           <label className={styles.label}>Gift Image</label>
//           <input type="file" accept="image/*" onChange={onFileChange} />
//           {form.previewUrl ? (
//             <img src={form.previewUrl} alt="preview" style={{ marginTop: 12, width: 120, height: 80, objectFit: "cover", borderRadius: 8 }} onError={(e) => (e.currentTarget.style.display = "none")} />
//           ) : null}
//         </div>

//         <HeadingAndData label="Gift Coin" name="coin" value={form.coin} placeholder="Enter gift coin" onChange={onChange} required />
//         <HeadingAndDropDown label="Gift Status" name="status" value={form.status} onChange={onChange}
//           options={[{ value: "Publish", label: "Publish" }, { value: "UnPublish", label: "UnPublish" }]} placeholder="Select Status" required />

//         {!!err && <div className={styles.error}>{err}</div>}
//         {!!notice && <div className={styles.notice}>{notice}</div>}

//         <div className={styles.buttonContainer}>
//           <Button backgroundColor="var(--Primary_Color)" textColor="#fff">
//             {saving ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Edit Gift" : "Add Gift"}
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }


// src/pages/Gift/AddGift.jsx
import React, { useEffect, useState } from "react";
import styles from "./AddGift.module.css";
import HeadingAndData from "../../components/HeadingAndData/HeadingAndData";
import HeadingAndDropDown from "../../components/HeadingAndDropdown/HeadingAndDropdown";
import Button from "../../components/Button/Button";
import { useParams, useNavigate } from "react-router-dom";
import { addGift, updateGift, getAllGifts } from "../../services/giftService";
import { API_BASE } from "../../config/apiConfig";

const fixIconUrl = (icon) =>
  !icon ? "" : /^https?:\/\//i.test(icon) ? icon : `${API_BASE}/${String(icon).replace(/^\/+/, "")}`;

export default function AddGift() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({ coin: "", status: "UnPublish", iconFile: null, previewUrl: "" });
  const [initial, setInitial] = useState({ coin: "", status: "UnPublish", icon: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    const ctrl = new AbortController();
    let ignore = false;
    (async () => {
      try {
        const res = await getAllGifts({ signal: ctrl.signal });
        const list = Array.isArray(res) ? res : (res?.data ?? res ?? []);
        const found = list.find((x) => x._id === id || x.id === id);
        if (!ignore && found) {
          const iconUrl = fixIconUrl(found.icon || found.image || found.path || "");
          const coin = String(found.price ?? found.coin ?? "");
          const status = found.status || "UnPublish";
          setInitial({ coin, status, icon: iconUrl });
          setForm({ coin, status, iconFile: null, previewUrl: iconUrl });
        } else if (!ignore) {
          setErr("Item not found.");
        }
      } catch {
        if (!ignore) setErr("Failed to load item for edit");
      }
    })();
    return () => { ignore = true; ctrl.abort(); };
  }, [id, isEdit]);

  const onChange = (e) => { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })); };
  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) { setForm(p => ({ ...p, iconFile: null, previewUrl: initial.icon })); return; }
    setForm(p => ({ ...p, iconFile: file, previewUrl: URL.createObjectURL(file) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setNotice("");
    if (!form.coin || isNaN(Number(form.coin))) return setErr("Gift coin must be a number");
    if (!isEdit && !form.iconFile) return setErr("Please choose an image");

    if (!isEdit) {
      const ctrl = new AbortController();
      try {
        setSaving(true);
        await addGift({ coin: String(form.coin), status: form.status, iconFile: form.iconFile }, { signal: ctrl.signal });
        navigate("/gift/listgift");
      } catch (e2) {
        console.error("Create Gift Error:", e2);
        setErr(e2?.response?.data?.message || e2?.message || "Save failed");
      } finally { setSaving(false); }
      return;
    }

    // EDIT
    const patch = { id }; let changed = false;
    if (String(form.coin) !== String(initial.coin)) { patch.coin = String(form.coin); changed = true; }
    if (form.status !== initial.status) { patch.status = form.status; changed = true; }
    if (form.iconFile) { patch.iconFile = form.iconFile; changed = true; }
    if (!changed) { setNotice("No changes to save."); return; }

    const ctrl = new AbortController();
    try {
      setSaving(true);
      // <-- changed to updateGift
      const res = await updateGift(patch, { signal: ctrl.signal });
      const updated = res || {};
      const delta = { id };
      if ("coin" in patch) delta.coin = patch.coin;
      if ("status" in patch) delta.status = patch.status;
      if (form.iconFile) delta.icon = updated.icon || updated.path || updated.file || null;
      navigate("/gift/listgift", { state: { updated: delta } });
    } catch (e2) {
      console.error("Update error:", e2);
      setErr(e2?.response?.data?.message || e2?.message || "Update failed");
    } finally { setSaving(false); }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Gift Management</h2>
      <form className={styles.form} onSubmit={submit} noValidate>
        <div className={styles.block}>
          <label className={styles.label}>Gift Image</label>
          <input type="file" accept="image/*" onChange={onFileChange} />
          {form.previewUrl ? (
            <img src={form.previewUrl} alt="preview" style={{ marginTop: 12, width: 120, height: 80, objectFit: "cover", borderRadius: 8 }} onError={(e) => (e.currentTarget.style.display = "none")} />
          ) : null}
        </div>

        <HeadingAndData label="Gift Coin" name="coin" value={form.coin} placeholder="Enter gift coin" onChange={onChange} required />
        <HeadingAndDropDown label="Gift Status" name="status" value={form.status} onChange={onChange}
          options={[{ value: "Publish", label: "Publish" }, { value: "UnPublish", label: "UnPublish" }]} placeholder="Select Status" required />

        {!!err && <div className={styles.error}>{err}</div>}
        {!!notice && <div className={styles.notice}>{notice}</div>}

        <div className={styles.buttonContainer}>
          <Button backgroundColor="var(--Primary_Color)" textColor="#fff">
            {saving ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Edit Gift" : "Add Gift"}
          </Button>
        </div>
      </form>
    </div>
  );
}
