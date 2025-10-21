// src/pages/Interest/AddInterest.jsx
import React, { useEffect, useState } from "react";
import styles from "./AddInterest.module.css";
import HeadingAndDropDown from "../../components/HeadingAndDropdown/HeadingAndDropdown";
import Button from "../../components/Button/Button";
import { useNavigate, useParams } from "react-router-dom";
import {
  addInterest,
  updateInterestPartial,
  getAllInterests,
} from "../../services/interestService";
import { API_BASE } from "../../config/apiConfig";

// Import the reusable toast
import { showCustomToast, ToastContainerCustom } from "../../components/CustomToast/CustomToast";

const fixIconUrl = (icon) => {
  if (!icon) return "";
  if (typeof icon !== "string") return "";
  if (/^https?:\/\//i.test(icon)) return icon;
  if (!API_BASE) return icon;
  return `${API_BASE}/${String(icon).replace(/^\/+/, "")}`;
};

export default function AddInterest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    status: "unpublish", // backend expects lowercase publish|unpublish
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

  // preload for edit
  useEffect(() => {
    if (!isEdit) return;
    const ctrl = new AbortController();
    let ignore = false;

    (async () => {
      try {
        const res = await getAllInterests({ signal: ctrl.signal });
        // res is expected shape: { success, data: [...] }
        const items = Array.isArray(res?.data) ? res.data : [];
        const found = items.find((x) => x._id === id);
        if (!ignore && found) {
          const imageUrl = fixIconUrl(found.imageUrl || "");
          setInitial({
            title: found.title || "",
            status: (found.status || "unpublish").toLowerCase(),
            imageUrl,
          });
          setForm((p) => ({
            ...p,
            title: found.title || "",
            status: (found.status || "unpublish").toLowerCase(),
            iconFile: null,
            previewUrl: imageUrl,
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

  // Controlled input onChange
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

    if (saving) return; // guard double click
    const ctrl = new AbortController();

    try {
      setSaving(true);

      if (isEdit) {
        // Build a partial payload (only changed keys) — backend needs "id"
        const patch = { id };
        if (title !== initial.title) patch.name = title; // service expects "title" but we'll pass name/title to service as arg
        if (form.status !== initial.status) patch.status = form.status;
        if (form.iconFile) patch.iconFile = form.iconFile;

        // If nothing changed
        if (
          !("name" in patch) &&
          !("status" in patch) &&
          !("iconFile" in patch)
        ) {
          setNotice("No changes to save.");
          return;
        }

        // Note: updateInterestPartial accepts { id, name, status, iconFile }
        await updateInterestPartial(patch, { signal: ctrl.signal });

        // Show toast and navigate after toast closes
        showCustomToast("Interest Updated Successfully!!", () =>
          navigate("/interest/listinterest")
        );
      } else {
        // addInterest expects { name, status, iconFile } but backend expects title->handled by service
        await addInterest(
          { name: title, status: form.status, iconFile: form.iconFile },
          { signal: ctrl.signal }
        );

        // Show toast and navigate after toast closes
        showCustomToast("Interest Add Successfully!!", () =>
          navigate("/interest/listinterest")
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
      console.log("Save error:", e2?.response?.status, e2?.response?.data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Interest Management</h2>

      <form className={styles.form} onSubmit={submit} noValidate>
        <div className={styles.block}>
          <label className={styles.label}>Interest Image</label>
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
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className={styles.previewPlaceholder}>No image</div>
          )}
        </div>

        {/* Controlled Title input */}
        <div className={styles.block}>
          <label className={styles.label}>Interest Title</label>
          <input
            name="title"
            value={form.title}
            placeholder="Enter interest title"
            onChange={onChangeInput}
            required
            className={styles.textInput}
          />
        </div>

        <HeadingAndDropDown
          label="Interest Status"
          name="status"
          value={form.status}
          onChange={(e) => {
            // support both event-style and direct value
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
              ? "Edit Interest"
              : "Add Interest"}
          </Button>
        </div>
      </form>

      {/* Toast container (renders toasts). Put it once per page or globally in App.jsx */}
      <ToastContainerCustom />
    </div>
  );
}
