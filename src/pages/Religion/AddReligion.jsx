// src/pages/Religion/AddReligion.jsx
import React, { useEffect, useState } from "react";
import styles from "./AddReligion.module.css";
import HeadingAndDropDown from "../../components/HeadingAndDropdown/HeadingAndDropdown";
import Button from "../../components/Button/Button";
import { useNavigate, useParams } from "react-router-dom";
import {
  addReligion,
  updateReligion,
  getAllReligions,
} from "../../services/religionService";

/**
 * Note:
 * - Backend returns `title` and `status` (lowercase 'publish'/'unpublish' in your Postman).
 * - Your service likely expects a `name` argument which it maps to `title` when sending to server.
 *   To keep things simple we use `title` in the UI and pass { name: title } into the service,
 *   preserving the service contract you already have.
 */

export default function AddReligion() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    status: "unpublish", // normalize to backend-friendly lowercase
  });

  const [initial, setInitial] = useState({
    title: "",
    status: "unpublish",
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  // preload existing row when editing
  useEffect(() => {
    if (!isEdit) return;
    const ctrl = new AbortController();
    let ignore = false;

    (async () => {
      try {
        const res = await getAllReligions({ signal: ctrl.signal });
        const items = Array.isArray(res?.data) ? res.data : [];
        const found = items.find((x) => x._id === id);
        if (!ignore && found) {
          // server uses `title` — fallback to name if any
          const title = found.title ?? found.name ?? "";
          const status = (found.status ?? "unpublish").toLowerCase();
          setInitial({
            title,
            status,
          });
          setForm({
            title,
            status,
          });
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

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setNotice("");

    const title = (form.title || "").trim();
    if (!title) return setErr("Title is required");
    if (saving) return;

    const ctrl = new AbortController();
    try {
      setSaving(true);

      if (isEdit) {
        // build partial payload (only changed fields)
        const patch = { id };
        if (title !== initial.title) patch.name = title; // service maps name -> title
        if (form.status !== initial.status) patch.status = form.status;

        if (!("name" in patch) && !("status" in patch)) {
          setNotice("No changes to save.");
          setSaving(false);
          return;
        }

        const res = await updateReligion(patch, { signal: ctrl.signal });

        // minimal info back for in-place patch in list
        const delta = { id };
        if ("name" in patch) delta.name = patch.name;
        if ("status" in patch) delta.status = patch.status;

        navigate("/religion/listreligion", { state: { updated: delta } });
      } else {
        // addReligion expects { name, status, ... } (it will send title->server)
        await addReligion({ name: title, status: form.status }, { signal: ctrl.signal });
        navigate("/religion/listreligion");
      }
    } catch (e2) {
      if (e2?.name === "CanceledError" || e2?.code === "ERR_CANCELED") return;
      const msg =
        e2?.response?.data?.message ||
        (e2?.response?.data?.errors && JSON.stringify(e2.response.data.errors)) ||
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
      <h2 className={styles.heading}>Religion Management</h2>

      <form className={styles.form} onSubmit={submit} noValidate>
        {/* Controlled Title input (replaced HeadingAndData to avoid event-shape mismatches) */}
        <div className={styles.block}>
          <label className={styles.label}>Religion Title</label>
          <input
            name="title"
            value={form.title}
            placeholder="Enter religion title"
            onChange={onChangeInput}
            required
            className={styles.textInput}
          />
        </div>

        <HeadingAndDropDown
          label="Religion Status"
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
            { value: "unpublish", label: "UnPublish" }, // label displays as needed; value is normalized
          ]}
          placeholder="Select Status"
          required
        />

        {!!err && <div className={styles.error}>{err}</div>}
        {!!notice && <div className={styles.notice}>{notice}</div>}

        <div className={styles.buttonContainer}>
          <Button backgroundColor="var(--Primary_Color)" textColor="#fff" disabled={saving}>
            {saving ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Edit Religion" : "Add Religion"}
          </Button>
        </div>
      </form>
    </div>
  );
}
