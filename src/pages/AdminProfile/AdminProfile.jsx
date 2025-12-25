
import React, { useEffect, useMemo, useState } from "react";
import styles from "./AdminProfile.module.css";
import Button from "../../components/Button/Button";
import { getAdminProfile, updateAdminProfile } from "../../services/adminService";

export default function AdminProfile() {
  const [form, setForm] = useState({ name: "", password: "" });

  const [meta, setMeta] = useState({
    email: "",
    phone: "",
    lastLogin: null,
    createdAt: null,
    updatedAt: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    []
  );

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setErr("");
    setNotice("");

    (async () => {
      try {
        const res = await getAdminProfile({ signal: ctrl.signal });
        const ok = !!res?.success;
        const p = (ok ? res?.data : res) || {};

        // ✅ Only take `name` from API (no fallback)
        setForm({ name: p.name || "", password: "" });

        setMeta({
          email: p.email || "",
          phone: p.phone || "",
          lastLogin: p.lastLogin || null,
          createdAt: p.createdAt || p.created_at || null,
          updatedAt: p.updatedAt || p.updated_at || null,
        });

        if (!ok && res?.message) setNotice(res.message);
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load admin profile";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErr("");
    setNotice("");
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (saving) return;

    const body = {};
    if (typeof form.name === "string") body.name = form.name.trim();
    if (form.password?.trim()) body.password = form.password;

    // remove empty strings so backend doesn't overwrite with ""
    if (body.name === "") delete body.name;

    if (!Object.keys(body).length) {
      setNotice("Nothing to update.");
      return;
    }

    try {
      setSaving(true);
      setErr("");
      setNotice("");

      const res = await updateAdminProfile(body);
      const ok = !!res?.success;
      const p = (ok ? res?.data : res) || {};

      if (ok) {
        setNotice(res?.message || "Profile updated.");
        setForm((prev) => ({ ...prev, password: "" }));
        setMeta((m) => ({
          ...m,
          updatedAt: p.updatedAt || new Date().toISOString(),
        }));
      } else {
        setErr(res?.message || "Update failed");
      }
    } catch (e2) {
      const msg =
        e2?.response?.data?.message ||
        e2?.message ||
        "Update failed";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Admin Profile</h2>

      <div className={styles.grid}>
        <div className={styles.card}>
          {loading ? (
            <div className={styles.skeleton}>
              <div className={styles.skelRow} />
              <div className={styles.skelRow} />
              <div className={styles.skelBtn} />
            </div>
          ) : (
            <form onSubmit={onSave}>
              <div className={styles.row}>
                <label className={styles.label}>Name</label>
                <input
                  className={styles.input}
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Admin name"
                  autoComplete="name"
                />
              </div>

              <div className={styles.row}>
                <label className={styles.label}>New Password</label>
                <input
                  className={styles.input}
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="Leave blank to keep current"
                  autoComplete="new-password"
                />
                <div className={styles.hint}>
                  Minimum 6 characters recommended.
                </div>
              </div>

              {!!err && <div className={styles.error}>{err}</div>}
              {!!notice && <div className={styles.notice}>{notice}</div>}

              <div className={styles.actions}>
                <Button
                  backgroundColor="var(--Primary_Color)"
                  textColor="#fff"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </div>

        {!loading && (
          <div className={styles.metaCard}>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Email</span>
              <span className={styles.metaVal}>{meta.email || "—"}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Phone</span>
              <span className={styles.metaVal}>{meta.phone || "—"}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Last login</span>
              <span className={styles.metaVal}>
                {meta.lastLogin ? fmt.format(new Date(meta.lastLogin)) : "—"}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Created</span>
              <span className={styles.metaVal}>
                {meta.createdAt ? fmt.format(new Date(meta.createdAt)) : "—"}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Updated</span>
              <span className={styles.metaVal}>
                {meta.updatedAt ? fmt.format(new Date(meta.updatedAt)) : "—"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
