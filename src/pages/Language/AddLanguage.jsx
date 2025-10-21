// src/pages/Language/AddLanguage.jsx
import React, { useEffect, useState } from "react";
import styles from "./AddLanguage.module.css";
import HeadingAndDropDown from "../../components/HeadingAndDropdown/HeadingAndDropdown";
import Button from "../../components/Button/Button";
import { useNavigate, useParams } from "react-router-dom";
import {
  addLanguage,
  updateLanguage,
  getAllLanguages,
} from "../../services/languageService";
import { API_BASE } from "../../config/apiConfig";

// ✅ Import the reusable custom toast
import {
  showCustomToast,
  ToastContainerCustom,
} from "../../components/CustomToast/CustomToast";

const fixIconUrl = (icon) => {
  if (!icon) return "";
  if (typeof icon !== "string") return "";
  if (/^https?:\/\//i.test(icon)) return icon;
  if (!API_BASE) return icon;
  return `${API_BASE}/${String(icon).replace(/^\/+/, "")}`;
};

export default function AddLanguage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    status: "unpublish",
    iconFile: null,
    previewUrl: "",
  });

  const [initial, setInitial] = useState({
    title: "",
    status: "unpublish",
    imageUrl: "",
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

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
          const title = found.title ?? found.name ?? "";
          const iconField = found.imageUrl ?? found.image ?? found.icon ?? "";
          const iconUrl = fixIconUrl(iconField);
          const status = (found.status ?? "unpublish").toLowerCase();

          setInitial({
            title,
            status,
            imageUrl: iconUrl,
          });

          setForm((p) => ({
            ...p,
            title,
            status,
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

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setForm((p) => ({ ...p, iconFile: null, previewUrl: initial.imageUrl }));
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

    const title = (form.title || "").trim();
    if (!title) return setErr("Title is required");
    if (!isEdit && !form.iconFile) return setErr("Please choose an image");

    if (saving) return;
    const ctrl = new AbortController();

    try {
      setSaving(true);

      if (isEdit) {
        const patch = { id };
        if (title !== initial.title) patch.name = title;
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

        // Update successful → show toast + navigate
        showCustomToast("Language Updated Successfully!!", () =>
          navigate("/language/listlanguage")
        );
      } else {
        await addLanguage(
          { name: title, status: form.status, iconFile: form.iconFile },
          { signal: ctrl.signal }
        );

        // Add successful → show toast + navigate
        showCustomToast("Language Added Successfully!!", () =>
          navigate("/language/listlanguage")
        );
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
      console.error("Save error:", e2?.response?.status, e2?.response?.data);
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
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className={styles.fileInput}
          />
          {form.previewUrl ? (
            <img
              src={form.previewUrl}
              alt="preview"
              className={styles.previewImg}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className={styles.previewPlaceholder}>No image</div>
          )}
        </div>

        <div className={styles.block}>
          <label className={styles.label}>Language Title</label>
          <input
            name="title"
            value={form.title}
            placeholder="Enter language title"
            onChange={onChangeInput}
            required
            className={styles.textInput}
          />
        </div>

        <HeadingAndDropDown
          label="Language Status"
          name="status"
          value={form.status}
          onChange={(e) => {
            if (e && e.target && typeof e.target.name === "string") {
              onChangeInput(e);
            } else {
              setForm((p) => ({ ...p, status: e }));
            }
          }}
          options={[
            { value: "publish", label: "Publish" },
            { value: "unpublish", label: "Unpublish" },
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

      {/* Toast container — renders toasts */}
      <ToastContainerCustom />
    </div>
  );
}
