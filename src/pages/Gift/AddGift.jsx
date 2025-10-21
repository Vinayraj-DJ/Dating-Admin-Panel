// src/pages/Gift/AddGift.jsx
import React, { useEffect, useState } from "react";
import styles from "./AddGift.module.css";
import HeadingAndData from "../../components/HeadingAndData/HeadingAndData";
import HeadingAndDropDown from "../../components/HeadingAndDropdown/HeadingAndDropdown";
import Button from "../../components/Button/Button";
import { useParams, useNavigate } from "react-router-dom";
import { addGift, updateGift, getAllGifts } from "../../services/giftService";
import { API_BASE } from "../../config/apiConfig";

// Reusable toast
import { showCustomToast, ToastContainerCustom } from "../../components/CustomToast/CustomToast";

const fixIconUrl = (icon) =>
  !icon ? "" : /^https?:\/\//i.test(icon) ? icon : `${API_BASE}/${String(icon).replace(/^\/+/, "")}`;

export default function AddGift() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({ coin: "", status: "unpublish", iconFile: null, previewUrl: "" });
  const [initial, setInitial] = useState({ coin: "", status: "unpublish", icon: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    const ctrl = new AbortController();
    let ignore = false;
    (async () => {
      try {
        const list = await getAllGifts({ signal: ctrl.signal });
        const found = Array.isArray(list) ? list.find((x) => x._id === id || x.id === id) : null;
        if (!ignore && found) {
          const iconUrl = fixIconUrl(found.icon || found.image || found.imageUrl || found.path || "");
          const coin = String(found.price ?? found.coin ?? "");
          const status = String(found.status || "unpublish").toLowerCase() === "publish" ? "publish" : "unpublish";
          setInitial({ coin, status, icon: iconUrl });
          setForm({ coin, status, iconFile: null, previewUrl: iconUrl });
        } else if (!ignore) {
          setErr("Item not found.");
        }
      } catch (e) {
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
    setForm((p) => ({ ...p, iconFile: file, previewUrl: URL.createObjectURL(file) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setNotice("");

    if (!form.coin || isNaN(Number(form.coin))) return setErr("Gift coin must be a number");
    if (!isEdit && !form.iconFile) return setErr("Please choose an image");

    if (!isEdit) {
      const ctrl = new AbortController();
      try {
        setSaving(true);
        await addGift({ coin: String(form.coin), status: form.status, iconFile: form.iconFile }, { signal: ctrl.signal });

        // show toast then navigate after toast closes
        showCustomToast("Gift Added Successfully!", () => navigate("/gift/listgift"));
      } catch (e2) {
        console.error("Create Gift Error:", e2);
        setErr(e2?.response?.data?.message || e2?.message || "Save failed");
      } finally {
        setSaving(false);
      }
      return;
    }

    // EDIT
    const patch = { id };
    let changed = false;
    if (String(form.coin) !== String(initial.coin)) {
      patch.coin = String(form.coin);
      changed = true;
    }
    if (form.status !== initial.status) {
      patch.status = form.status;
      changed = true;
    }
    if (form.iconFile) {
      patch.iconFile = form.iconFile;
      changed = true;
    }
    if (!changed) {
      setNotice("No changes to save.");
      return;
    }

    const ctrl = new AbortController();
    try {
      setSaving(true);
      const res = await updateGift(patch, { signal: ctrl.signal });
      // res might be { success:true, data: {...} } or data directly; attempt to extract
      const updated = res?.data ?? res ?? {};
      const delta = { id };
      if ("coin" in patch) delta.coin = patch.coin;
      if ("status" in patch) delta.status = patch.status;
      // get updated icon from response if present
      const returnedIcon = updated.icon ?? updated.image ?? updated.imageUrl ?? updated.path ?? null;
      if (patch.iconFile) delta.icon = returnedIcon;

      // show toast then navigate after toast closes (pass state)
      showCustomToast("Gift Updated Successfully!", () =>
        navigate("/gift/listgift", { state: { updated: delta } })
      );
    } catch (e2) {
      console.error("Update error:", e2);
      setErr(e2?.response?.data?.message || e2?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Gift Management</h2>
      <form className={styles.form} onSubmit={submit} noValidate>
        <div className={styles.block}>
          <label className={styles.label}>Gift Image</label>
          <input type="file" accept="image/*" onChange={onFileChange} />
          {form.previewUrl ? (
            <img
              src={form.previewUrl}
              alt="preview"
              style={{ marginTop: 12, width: 120, height: 80, objectFit: "cover", borderRadius: 8 }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : null}
        </div>

        <HeadingAndData label="Gift Coin" name="coin" value={form.coin} placeholder="Enter gift coin" onChange={onChange} required />
        <HeadingAndDropDown
          label="Gift Status"
          name="status"
          value={form.status}
          onChange={onChange}
          options={[
            { value: "publish", label: "Publish" },
            { value: "unpublish", label: "UnPublish" },
          ]}
          placeholder="Select Status"
          required
        />

        {!!err && <div className={styles.error}>{err}</div>}
        {!!notice && <div className={styles.notice}>{notice}</div>}

        <div className={styles.buttonContainer}>
          <Button backgroundColor="var(--Primary_Color)" textColor="#fff" type="submit" disabled={saving}>
            {saving ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Edit Gift" : "Add Gift"}
          </Button>
        </div>
      </form>

      {/* Toast container (renders toast notifications) */}
      <ToastContainerCustom />
    </div>
  );
}
