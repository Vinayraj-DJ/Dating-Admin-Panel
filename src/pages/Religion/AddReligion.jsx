// src/pages/Religion/AddReligion.jsx
import React, { useEffect, useState } from "react";
import styles from "./AddReligion.module.css";
import HeadingAndData from "../../components/HeadingAndData/HeadingAndData";
import HeadingAndDropDown from "../../components/HeadingAndDropdown/HeadingAndDropdown";
import Button from "../../components/Button/Button";
import { useNavigate, useParams } from "react-router-dom";
import {
  addReligion,
  updateReligion,
  getAllReligions,
} from "../../services/religionService";

export default function AddReligion() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    status: "UnPublish", // backend expects Publish | UnPublish
  });

  const [initial, setInitial] = useState({
    name: "",
    status: "UnPublish",
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
          setInitial({
            name: found.name || "",
            status: found.status || "UnPublish",
          });
          setForm({
            name: found.name || "",
            status: found.status || "UnPublish",
          });
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

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setNotice("");

    const name = form.name.trim();
    if (!name) return setErr("Title is required");
    if (saving) return;

    const ctrl = new AbortController();
    try {
      setSaving(true);

      if (isEdit) {
        // build partial payload (only changed fields)
        const patch = { id };
        if (name !== initial.name) patch.name = name;
        if (form.status !== initial.status) patch.status = form.status;

        if (!("name" in patch) && !("status" in patch)) {
          setNotice("No changes to save.");
          return;
        }

        await updateReligion(patch, { signal: ctrl.signal });
        // send minimal info back for in-place patch
        const delta = { id };
        if ("name" in patch) delta.name = patch.name;
        if ("status" in patch) delta.status = patch.status;

        navigate("/religion/listreligion", { state: { updated: delta } });
      } else {
        await addReligion(
          { name, status: form.status },
          { signal: ctrl.signal }
        );
        navigate("/religion/listreligion");
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
      <h2 className={styles.heading}>Religion Management</h2>

      <form className={styles.form} onSubmit={submit} noValidate>
        <HeadingAndData
          label="Religion Title"
          name="name"
          value={form.name}
          placeholder="Enter religion title"
          onChange={onChange}
          required
        />

        <HeadingAndDropDown
          label="Religion Status"
          name="status"
          value={form.status}
          onChange={onChange}
          options={[
            { value: "Publish", label: "Publish" },
            { value: "UnPublish", label: "UnPublish" }, // keep exact casing for backend
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
              ? "Edit Religion"
              : "Add Religion"}
          </Button>
        </div>
      </form>
    </div>
  );
}
