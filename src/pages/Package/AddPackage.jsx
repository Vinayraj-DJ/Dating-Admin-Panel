// src/pages/Package/AddPackage.jsx
import React, { useEffect, useState } from "react";
import styles from "./AddPackage.module.css";
import { useParams, useNavigate } from "react-router-dom";
import HeadingAndData from "../../components/HeadingAndData/HeadingAndData";
import HeadingAndDropDown from "../../components/HeadingAndDropdown/HeadingAndDropdown";
import Button from "../../components/Button/Button";
import {
  addPackage,
  updatePackagePartial,
  getAllPackages,
} from "../../services/packageService";

export default function AddPackage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    totalCoin: "",
    amount: "",
    status: "UnPublish",
  });

  const [initial, setInitial] = useState({
    totalCoin: "",
    amount: "",
    status: "UnPublish",
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  // preload when editing
  useEffect(() => {
    if (!isEdit) return;
    const ctrl = new AbortController();
    let active = true;

    (async () => {
      try {
        const res = await getAllPackages({ signal: ctrl.signal });
        const items = Array.isArray(res?.data) ? res.data : [];
        const found = items.find((p) => p._id === id);
        if (!active) return;
        if (!found) {
          setErr("Item not found.");
          return;
        }
        const next = {
          totalCoin: String(found.totalCoin ?? ""),
          amount: String(found.amount ?? ""),
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

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setNotice("");

    // simple validation
    if (!form.totalCoin || isNaN(Number(form.totalCoin))) {
      return setErr("Total coin must be a number");
    }
    if (form.amount === "") return setErr("Amount is required");

    // CREATE
    if (!isEdit) {
      const ctrl = new AbortController();
      try {
        setSaving(true);
        await addPackage(
          {
            totalCoin: Number(form.totalCoin),
            amount: String(form.amount),
            status: form.status,
          },
          { signal: ctrl.signal }
        );
        navigate("/package/listpackage");
      } catch (e2) {
        setErr(e2?.response?.data?.message || e2?.message || "Save failed");
      } finally {
        setSaving(false);
      }
      return;
    }

    // EDIT — build patch of changed keys
    const patch = { id };
    let changed = false;
    if (String(form.totalCoin) !== String(initial.totalCoin)) {
      patch.totalCoin = Number(form.totalCoin);
      changed = true;
    }
    if (String(form.amount) !== String(initial.amount)) {
      patch.amount = String(form.amount);
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
      await updatePackagePartial(patch);
      // send a tiny delta for in-place list patch
      navigate("/package/listpackage", {
        state: { updated: { id, ...patch } },
      });
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Package Management</h2>

      <form className={styles.form} onSubmit={submit} noValidate>
        <HeadingAndData
          label="Total Coin"
          name="totalCoin"
          value={form.totalCoin}
          placeholder="Total coin"
          onChange={onChange}
          required
        />

        <HeadingAndData
          label="Amount"
          name="amount"
          value={form.amount}
          placeholder="e.g. 999.99"
          onChange={onChange}
          required
        />

        <HeadingAndDropDown
          label="Package Status"
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
          <Button backgroundColor="var(--Primary_Color)" textColor="#fff">
            {saving
              ? isEdit
                ? "Updating..."
                : "Saving..."
              : isEdit
              ? "Update Package"
              : "Add Package"}
          </Button>
        </div>
      </form>
    </div>
  );
}
