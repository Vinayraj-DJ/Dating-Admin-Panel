import React, { useEffect, useState } from "react";
import styles from "./AdminProfile.module.css";
import Button from "../../components/Button/Button";
import { getAdminProfile, updateAdminProfile } from "../../services/adminService";

export default function AdminProfile() {
  const [form, setForm] = useState({ name: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setErr("");
    getAdminProfile({ signal: ctrl.signal })
      .then((res) => {
        const p = res?.data || {};
        setForm({ name: p.name || p.fullName || p.email || "", password: "" });
      })
      .catch((e) => setErr(e?.response?.data?.message || e?.message || "Failed to load profile"))
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setErr("");
    setNotice("");
    if (saving) return;
    try {
      setSaving(true);
      const payload = {};
      if (form.name) payload.name = form.name;
      if (form.password) payload.password = form.password;
      if (!Object.keys(payload).length) {
        setNotice("Nothing to update.");
        return;
      }
      await updateAdminProfile(payload);
      setNotice("Profile updated.");
      setForm((p) => ({ ...p, password: "" }));
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Admin Profile</h2>
      <div className={styles.card}>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <form onSubmit={onSave}>
            <div className={styles.row}>
              <label className={styles.label}>Name</label>
              <input className={styles.input} name="name" value={form.name} onChange={onChange} placeholder="Admin name" />
            </div>
            <div className={styles.row}>
              <label className={styles.label}>New Password</label>
              <input className={styles.input} name="password" type="password" value={form.password} onChange={onChange} placeholder="Leave blank to keep current" />
            </div>
            {!!err && <div className={styles.error}>{err}</div>}
            {!!notice && <div className={styles.notice}>{notice}</div>}
            <div className={styles.actions}>
              <Button backgroundColor="var(--Primary_Color)" textColor="#fff" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


