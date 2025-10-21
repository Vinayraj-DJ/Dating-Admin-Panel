// src/pages/RelationGoal/AddRelationGoal.jsx
import React, { useEffect, useState } from "react";
import styles from "./AddRelationGoal.module.css";
import HeadingAndData from "../../components/HeadingAndData/HeadingAndData";
import HeadingAndDropDown from "../../components/HeadingAndDropdown/HeadingAndDropdown";
import Button from "../../components/Button/Button";
import { useParams, useNavigate } from "react-router-dom";
import {
  addRelationGoal,
  updateRelationGoalPartial,
  getAllRelationGoals,
} from "../../services/relationGoalService";

// Reusable toast
import { showCustomToast, ToastContainerCustom } from "../../components/CustomToast/CustomToast";

export default function AddRelationGoal() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    status: "Publish",
  });

  // keep server's original for diffing
  const [initial, setInitial] = useState({
    title: "",
    subtitle: "",
    status: "Publish",
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
        const res = await getAllRelationGoals({ signal: ctrl.signal });
        const items = Array.isArray(res?.data) ? res.data : [];
        const found = items.find((x) => x._id === id);
        if (!ignore && found) {
          const data = {
            title: found.title || "",
            subtitle: found.subtitle || "",
            status: found.status || "Publish",
          };
          setInitial(data);
          setForm(data);
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

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setNotice("");

    if (!form.title.trim()) return setErr("Title is required");

    // create
    if (!isEdit) {
      const ctrl = new AbortController();
      try {
        setSaving(true);
        await addRelationGoal(
          {
            title: form.title.trim(),
            subtitle: form.subtitle.trim(),
            status: form.status,
          },
          { signal: ctrl.signal }
        );

        // show toast then navigate after toast closes
        showCustomToast("Relation Goal Added Successfully!", () =>
          navigate("/relation/listrelationgoal")
        );
      } catch (e2) {
        if (e2?.name !== "CanceledError" && e2?.code !== "ERR_CANCELED") {
          setErr(e2?.response?.data?.message || e2?.message || "Save failed");
        }
      } finally {
        setSaving(false);
      }
      return;
    }

    // compute minimal patch
    const patch = { id };
    let changed = false;

    if (form.title.trim() !== initial.title) {
      patch.title = form.title.trim();
      changed = true;
    }
    if (form.subtitle.trim() !== initial.subtitle) {
      patch.subtitle = form.subtitle.trim();
      changed = true;
    }
    if (form.status !== initial.status) {
      patch.status = form.status;
      changed = true;
    }

    if (!changed) {
      setNotice("No changes to save.");
      return;
    }

    // update
    const ctrl = new AbortController();
    try {
      setSaving(true);
      await updateRelationGoalPartial(patch, { signal: ctrl.signal });

      // send delta back for in-place patching in list
      const delta = { id };
      if ("title" in patch) delta.title = patch.title;
      if ("subtitle" in patch) delta.subtitle = patch.subtitle;
      if ("status" in patch) delta.status = patch.status;

      // show toast then navigate after toast closes (pass delta in state)
      showCustomToast("Relation Goal Updated Successfully!", () =>
        navigate("/relation/listrelationgoal", { state: { updated: delta } })
      );
    } catch (e2) {
      if (e2?.name === "CanceledError" || e2?.code === "ERR_CANCELED") return;
      setErr(
        e2?.response?.data?.message ||
          (e2?.response?.data?.errors &&
            JSON.stringify(e2.response.data.errors)) ||
          e2?.message ||
          "Update failed"
      );
      console.log("Update error:", e2?.response?.status, e2?.response?.data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Relation Goal Management</h2>

      <form className={styles.form} onSubmit={submit} noValidate>
        <HeadingAndData
          label="Relation Goal Title"
          name="title"
          value={form.title}
          placeholder="Enter relation goal title"
          onChange={onChange}
          required
        />

        <HeadingAndData
          label="Relation Goal Subtitle"
          name="subtitle"
          value={form.subtitle}
          placeholder="Enter relation goal subtitle"
          onChange={onChange}
        />

        <HeadingAndDropDown
          label="Relation Goal Status"
          name="status"
          value={form.status}
          onChange={onChange}
          options={[
            { value: "Publish", label: "Publish" },
            { value: "UnPublish", label: "UnPublish" },
          ]}
          placeholder="Select Status"
          required
        />

        {!!err && <div className={styles.error}>{err}</div>}
        {!!notice && <div className={styles.notice}>{notice}</div>}

        <div className={styles.buttonContainer}>
          <Button backgroundColor="var(--Primary_Color)" textColor="#fff" disabled={saving}>
            {saving
              ? isEdit
                ? "Updating..."
                : "Saving..."
              : isEdit
              ? "Edit Relation Goal"
              : "Add Relation Goal"}
          </Button>
        </div>
      </form>

      {/* Toast container (renders toast notifications) */}
      <ToastContainerCustom />
    </div>
  );
}
