// src/pages/FAQ/AddFaq.jsx
import React, { useEffect, useState } from "react";
import styles from "./AddFaq.module.css";
import HeadingAndData from "../../components/HeadingAndData/HeadingAndData";
import HeadingAndDropDown from "../../components/HeadingAndDropdown/HeadingAndDropdown";
import Button from "../../components/Button/Button";
import { useNavigate, useParams } from "react-router-dom";
import {
  addFaq,
  updateFaqPartial,
  getAllFaqs,
} from "../../services/faqService";

// ✅ Reusable purple toast
import { showCustomToast, ToastContainerCustom } from "../../components/CustomToast/CustomToast";

export default function AddFAQ() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    question: "",
    answer: "",
    status: "Publish",
  });

  // snapshot from server to diff
  const [initial, setInitial] = useState({
    question: "",
    answer: "",
    status: "Publish",
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  // Preload record on edit
  useEffect(() => {
    if (!isEdit) return;
    const ctrl = new AbortController();
    let ignore = false;

    (async () => {
      try {
        const res = await getAllFaqs({ signal: ctrl.signal });
        const items = Array.isArray(res?.data) ? res.data : [];
        const found = items.find((x) => x._id === id);
        if (!ignore && found) {
          const q = found.question || "";
          const a = found.answer || "";
          const s = found.status || "Publish";
          setInitial({ question: q, answer: a, status: s });
          setForm({ question: q, answer: a, status: s });
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

    if (!form.question.trim()) return setErr("Question is required");
    if (!form.answer.trim()) return setErr("Answer is required");

    // CREATE
    if (!isEdit) {
      const ctrl = new AbortController();
      try {
        setSaving(true);
        await addFaq(
          {
            question: form.question.trim(),
            answer: form.answer.trim(),
            status: form.status,
          },
          { signal: ctrl.signal }
        );

        // ✅ show toast then navigate after toast closes
        showCustomToast("FAQ Added Successfully!", () =>
          navigate("/faq/listfaq")
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

    // EDIT — build patch from changed fields
    const patch = { id };
    let changed = false;
    if (form.question.trim() !== initial.question) {
      patch.question = form.question.trim();
      changed = true;
    }
    if (form.answer.trim() !== initial.answer) {
      patch.answer = form.answer.trim();
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

    try {
      setSaving(true);
      await updateFaqPartial(patch);

      // Send minimal delta to list for in-place cell flash
      const delta = { id };
      if ("question" in patch) delta.question = patch.question;
      if ("answer" in patch) delta.answer = patch.answer;
      if ("status" in patch) delta.status = patch.status;

      // ✅ show toast then navigate after toast closes
      showCustomToast("FAQ Updated Successfully!", () =>
        navigate("/faq/listfaq", { state: { updated: delta } })
      );
    } catch (e2) {
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
      <h2 className={styles.heading}>FAQ Management</h2>

      <form className={styles.form} onSubmit={submit} noValidate>
        <HeadingAndData
          label="Enter Question"
          name="question"
          value={form.question}
          placeholder="Enter Question"
          onChange={onChange}
          required
        />

        <HeadingAndData
          label="Enter Answer"
          name="answer"
          value={form.answer}
          placeholder="Enter Answer"
          onChange={onChange}
          required
        />

        <HeadingAndDropDown
          label="FAQ Status"
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
              ? "Edit FAQ"
              : "Add FAQ"}
          </Button>
        </div>
      </form>

      {/* ✅ Toast container for notifications */}
      <ToastContainerCustom />
    </div>
  );
}
