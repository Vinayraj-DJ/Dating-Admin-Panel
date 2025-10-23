// src/pages/Plan/AddPlan.jsx
import React, { useEffect, useState } from "react";
import styles from "./AddPlan.module.css";
import HeadingAndData from "../../components/HeadingAndData/HeadingAndData";
import HeadingAndDropDown from "../../components/HeadingAndDropdown/HeadingAndDropdown";
import Button from "../../components/Button/Button";
import CustomToggle from "../../components/CustomToggle/CustomToggle";
import { useParams, useNavigate } from "react-router-dom";
import {
  addPlan,
  updatePlanPartial,
  getAllPlans,
} from "../../services/planService";

// Reusable toast
import { showCustomToast, ToastContainerCustom } from "../../components/CustomToast/CustomToast";

export default function AddPlan() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // form values
  const [form, setForm] = useState({
    title: "",
    amount: "",
    dayLimit: "",
    description: "",
    filterInclude: false,
    audioVideo: false,
    directChat: false,
    chat: false,
    likeMenu: false,
    status: "UnPublish",
  });

  // original values to compute diff
  const [initial, setInitial] = useState({
    title: "",
    amount: "",
    dayLimit: "",
    description: "",
    filterInclude: false,
    audioVideo: false,
    directChat: false,
    chat: false,
    likeMenu: false,
    status: "UnPublish",
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  // helper to safely read booleans from toggleButtons
  const bool = (v) => !!v;

  // preload when editing
  useEffect(() => {
    if (!isEdit) return;
    const ctrl = new AbortController();
    let active = true;
    (async () => {
      try {
        const res = await getAllPlans({ signal: ctrl.signal });
        // support responses where server wraps data in `data` or returns array directly
        const payload = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : res?.data || res;
        const items = Array.isArray(payload) ? payload : [];
        const found = items.find((p) => p._id === id);
        if (!active) return;
        if (!found) {
          setErr("Item not found.");
          return;
        }

        // read toggleButtons -> map to top-level booleans
        const tb = found.toggleButtons || {};
        const next = {
          title: found.title || "",
          amount: String(found.amount ?? ""),
          dayLimit: String(found.dayLimit ?? ""),
          description: found.description || "",
          filterInclude: bool(tb.filterInclude),
          audioVideo: bool(tb.audioVideo),
          directChat: bool(tb.directChat),
          chat: bool(tb.chat),
          likeMenu: bool(tb.likeMenu),
          status: found.status || "UnPublish",
        };
        setInitial(next);
        setForm(next);
      } catch {
        if (active) setErr("Failed to load item for edit");
      }
    })();
    return () => {
      active = false;
      ctrl.abort();
    };
  }, [id, isEdit]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };
  const onToggle = (name) => (e) =>
    setForm((p) => ({ ...p, [name]: e.target.checked }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setNotice("");

    if (!form.title.trim()) return setErr("Plan title is required");
    if (!form.amount.toString().trim()) return setErr("Amount is required");
    if (!form.dayLimit.toString().trim()) return setErr("Day limit is required");

    // CREATE
    if (!isEdit) {
      const ctrl = new AbortController();
      try {
        setSaving(true);
        await addPlan(
          {
            title: form.title.trim(),
            amount: form.amount,
            dayLimit: form.dayLimit,
            description: form.description,
            filterInclude: form.filterInclude,
            audioVideo: form.audioVideo,
            directChat: form.directChat,
            chat: form.chat,
            likeMenu: form.likeMenu,
            status: form.status,
          },
          { signal: ctrl.signal }
        );

        // show toast then navigate after toast closes
        showCustomToast("Plan Added Successfully!", () => navigate("/plan/listplan"));
      } catch (e2) {
        setErr(e2?.response?.data?.message || e2?.message || "Save failed");
      } finally {
        setSaving(false);
      }
      return;
    }

    // EDIT — build patch of changed fields only
    const patch = { id };
    let changed = false;
    const keys = Object.keys(initial);
    keys.forEach((k) => {
      if (form[k] !== initial[k]) {
        patch[k] = form[k];
        changed = true;
      }
    });
    if (!changed) {
      setNotice("No changes to save.");
      return;
    }

    try {
      setSaving(true);
      await updatePlanPartial(patch);

      // delta used by the list page to patch the row in-place
      const delta = { id, ...patch };

      // show toast then navigate after toast closes (pass state)
      showCustomToast("Plan Updated Successfully!", () =>
        navigate("/plan/listplan", { state: { updated: delta } })
      );
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Plan Management</h2>

      <form className={styles.form} onSubmit={submit} noValidate>
        <div className={styles.row}>
          <HeadingAndData
            label="Plan Title"
            name="title"
            value={form.title}
            placeholder="Enter plan title"
            onChange={onChange}
            required
          />
          <HeadingAndData
            label="Plan Amount"
            name="amount"
            value={form.amount}
            placeholder="e.g. 49.99"
            onChange={onChange}
            required
          />
          <HeadingAndData
            label="Day Limit"
            name="dayLimit"
            value={form.dayLimit}
            placeholder="e.g. 30"
            onChange={onChange}
            required
          />
        </div>

        <HeadingAndData
          label="Plan Description"
          name="description"
          value={form.description}
          placeholder="Enter plan description"
          onChange={onChange}
          isTextarea
        />

        <div className={styles.toggleRow}>
          <CustomToggle
            label="Filter Include ?"
            checked={form.filterInclude}
            onChange={onToggle("filterInclude")}
          />
          <CustomToggle
            label="Audio Video ?"
            checked={form.audioVideo}
            onChange={onToggle("audioVideo")}
          />
          <CustomToggle
            label="Direct Chat ?"
            checked={form.directChat}
            onChange={onToggle("directChat")}
          />
          <CustomToggle
            label="Chat ?"
            checked={form.chat}
            onChange={onToggle("chat")}
          />
          <CustomToggle
            label="Like Menu ?"
            checked={form.likeMenu}
            onChange={onToggle("likeMenu")}
          />
        </div>

        <HeadingAndDropDown
          label="Plan Status"
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
              ? "Edit Plan"
              : "Add Plan"}
          </Button>
        </div>
      </form>

      {/* Toast container (renders toast notifications) */}
      <ToastContainerCustom />
    </div>
  );
}
