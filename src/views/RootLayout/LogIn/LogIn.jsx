// import { useRef, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import InputField from "../../../components/InputField/InputField";
// import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
// import styles from "./LogIn.module.css";
// import { adminLogin } from "../../../services/api";
// import { setAuth } from "../../../utils/auth"; // ← use helper

// export default function LogIn() {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({ emailOrUser: "", password: "", userType: "admin" });
//   const [showPwd, setShowPwd] = useState(false);
//   const [busy, setBusy] = useState(false);
//   const [err, setErr] = useState({ emailOrUser: "", password: "", userType: "", global: "" });

//   const ctrlRef = useRef(null);
//   useEffect(() => () => ctrlRef.current?.abort(), []);

//   const onChange = ({ target: { name, value } }) => {
//     setForm((p) => ({ ...p, [name]: value }));
//     setErr((p) => ({ ...p, [name]: "", global: "" }));
//   };

//   const validate = () => {
//     const e = {};
//     if (!form.emailOrUser.trim()) e.emailOrUser = "Username or email required";
//     if (!form.password.trim()) e.password = "Password required";
//     if (!form.userType.trim()) e.userType = "User type required";
//     setErr((p) => ({ ...p, ...e }));
//     return Object.keys(e).length === 0;
//   };

//   const submit = async (e) => {
//     e.preventDefault();
//     if (!validate() || busy) return;

//     ctrlRef.current?.abort();
//     ctrlRef.current = new AbortController();

//     try {
//       setBusy(true);

//       const id = form.emailOrUser.trim();
//       const isEmail = id.includes("@");
//       const payload = {
//         ...(isEmail ? { email: id } : { username: id }),
//         password: form.password.trim(),
//         userType: form.userType.trim(),
//       };

//       const token = await adminLogin(payload, {
//         signal: ctrlRef.current.signal,
//       });
//       if (!token) {
//         setErr((p) => ({ ...p, global: "Invalid credentials." }));
//         return;
//       }

//       // 🔐 store token + mark logged in
//       setAuth(token);

//       // (optional) store minimal user context for UI
//       localStorage.setItem(
//         "me",
//         JSON.stringify({
//           username: isEmail ? undefined : id,
//           email: isEmail ? id : undefined,
//         })
//       );

//       navigate("/dashboard", { replace: true });
//     } catch (e2) {
//       if (e2.name === "CanceledError" || e2.name === "AbortError") return;
//       const msg =
//         e2?.response?.data?.message ||
//         (e2?.response?.status === 401 ? "Invalid credentials." : "") ||
//         e2?.message ||
//         "Login failed.";
//       setErr((p) => ({ ...p, global: msg }));
//     } finally {
//       setBusy(false);
//       ctrlRef.current = null;
//     }
//   };

//   return (
//     <div className={styles.screen}>
//       <div className={styles.cardShadow} />
//       <form className={styles.card} onSubmit={submit} noValidate>
//         <h1 className={styles.title}>Log In</h1>

//         {!!err.global && <div className={styles.error}>{err.global}</div>}

//         <div className={styles.row}>
//           <InputField
//             name="emailOrUser"
//             placeholder="Email or Username"
//             value={form.emailOrUser}
//             error={err.emailOrUser}
//             onChange={onChange}
//             icon={<FaUser />}
//           />
//         </div>

//         <div className={styles.row}>
//           <InputField
//             name="password"
//             placeholder="Password"
//             type={showPwd ? "text" : "password"}
//             value={form.password}
//             error={err.password}
//             onChange={onChange}
//             icon={
//               showPwd ? (
//                 <FaEyeSlash
//                   style={{ cursor: "pointer" }}
//                   onClick={() => setShowPwd(false)}
//                 />
//               ) : (
//                 <FaEye
//                   style={{ cursor: "pointer" }}
//                   onClick={() => setShowPwd(true)}
//                 />
//               )
//             }
//           />
//         </div>

//         <div className={styles.row}>
//           <div className={styles.selectContainer}>
//             <select
//               name="userType"
//               value={form.userType}
//               onChange={onChange}
//               className={styles.select}
//             >
//               <option value="admin">Admin</option>
//               <option value="staff">Staff</option>
//             </select>
//             {!!err.userType && <div className={styles.fieldError}>{err.userType}</div>}
//           </div>
//         </div>

//         <button className={styles.submit} disabled={busy}>
//           {busy ? "Logging in..." : "Log In"}
//         </button>
//       </form>
//     </div>
//   );
// }




import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../../../components/InputField/InputField";
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./LogIn.module.css";
import { adminLogin } from "../../../services/api";
import { setAuth } from "../../../utils/auth";

// ✅ Import your custom toast helpers
import {
  showCustomToast,
  ToastContainerCustom,
} from "../../../components/CustomToast/CustomToast";

export default function LogIn() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    emailOrUser: "",
    password: "",
    userType: "admin",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState({
    emailOrUser: "",
    password: "",
    userType: "",
    global: "",
  });

  const ctrlRef = useRef(null);
  useEffect(() => () => ctrlRef.current?.abort(), []);

  const onChange = ({ target: { name, value } }) => {
    setForm((p) => ({ ...p, [name]: value }));
    setErr((p) => ({ ...p, [name]: "", global: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.emailOrUser.trim()) e.emailOrUser = "Username or email required";
    if (!form.password.trim()) e.password = "Password required";
    if (!form.userType.trim()) e.userType = "User type required";
    setErr((p) => ({ ...p, ...e }));
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate() || busy) return;

    ctrlRef.current?.abort();
    ctrlRef.current = new AbortController();

    try {
      setBusy(true);

      const id = form.emailOrUser.trim();
      const isEmail = id.includes("@");
      const payload = {
        ...(isEmail ? { email: id } : { username: id }),
        password: form.password.trim(),
        userType: form.userType.trim(),
      };

      const token = await adminLogin(payload, {
        signal: ctrlRef.current.signal,
      });

      if (!token) {
        setErr((p) => ({ ...p, global: "Invalid credentials." }));
        showCustomToast("Invalid credentials!");
        return;
      }

      // 🔐 store token + mark logged in
      setAuth(token);

      // optional: store minimal user context for UI
      localStorage.setItem(
        "me",
        JSON.stringify({
          username: isEmail ? undefined : id,
          email: isEmail ? id : undefined,
        })
      );

      showCustomToast("Login successful!", () =>
        navigate("/dashboard", { replace: true })
      );
    } catch (e2) {
      if (e2.name === "CanceledError" || e2.name === "AbortError") return;

      const msg =
        e2?.response?.data?.message ||
        (e2?.response?.status === 401 ? "Invalid credentials." : "") ||
        e2?.message ||
        "Login failed.";

      setErr((p) => ({ ...p, global: msg }));
      showCustomToast(msg);
    } finally {
      setBusy(false);
      ctrlRef.current = null;
    }
  };

  return (
    <div className={styles.screen}>
      {/* ✅ Add your reusable toast container (only once per page) */}
      <ToastContainerCustom />

      <div className={styles.cardShadow} />
      <form className={styles.card} onSubmit={submit} noValidate>
        <h1 className={styles.title}>Log In</h1>

        {!!err.global && <div className={styles.error}>{err.global}</div>}

        <div className={styles.row}>
          <InputField
            name="emailOrUser"
            placeholder="Email or Username"
            value={form.emailOrUser}
            error={err.emailOrUser}
            onChange={onChange}
            icon={<FaUser />}
          />
        </div>

        <div className={styles.row}>
          <InputField
            name="password"
            placeholder="Password"
            type={showPwd ? "text" : "password"}
            value={form.password}
            error={err.password}
            onChange={onChange}
            icon={
              showPwd ? (
                <FaEyeSlash
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPwd(false)}
                />
              ) : (
                <FaEye
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPwd(true)}
                />
              )
            }
          />
        </div>

        <div className={styles.row}>
          <div className={styles.selectContainer}>
            <select
              name="userType"
              value={form.userType}
              onChange={onChange}
              className={styles.select}
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
            {!!err.userType && (
              <div className={styles.fieldError}>{err.userType}</div>
            )}
          </div>
        </div>

        <button className={styles.submit} disabled={busy}>
          {busy ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}
