import React, { useEffect, useState } from "react";
import { FaCog, FaBullhorn, FaSms, FaAd, FaMapMarkedAlt, FaCoins, FaKey, FaLock } from "react-icons/fa";
import FormSection from "../../components/FormSection/FormSection";
import FormGridLayout from "../../components/FormGridLayout/FormGridLayout";
import FileInputWithPreview from "../../components/FileInputWithPreview/FileInputWithPreview";
import FormActions from "../../components/FormActions/FormActions";
import HeadingAndData from "../../components/HeadingAndData/HeadingAndData";
import HeadingAndDropdown from "../../components/HeadingAndDropdown/HeadingAndDropdown";
import MaskedInput from "../../components/MaskedInput/MaskedInput"; // optional
import { getSettings, updateSettings, uploadImage } from "../../services/settingsService";
import styles from "./settingManagement.module.css";

export default function SettingsManagement() {
  const [form, setForm] = useState({
    websiteName: "",
    siteImageUrl: "",
    timezone: "Asia/Kolkata",
    currency: "",
    onesignalAppId: "",
    onesignalRestKey: "",
    smsType: "",
    msg91AuthKey: "",
    msg91OtpTemplateId: "",
    twilioSid: "",
    twilioAuthToken: "",
    twilioPhone: "",
    admobBannerId: "",
    admobInterstitialId: "",
    admobIosBannerId: "",
    admobIosInterstitialId: "",
    googleMapKey: "",
    perCoinPrice: "",
    coinWithdrawLimit: "",
    giftFunction: "",
    otpAuthSignup: "",
    agoraApiId: "",
    admobEnable: "No",
    maintenanceMode: "No",
    freeMode: "No",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    const ctrl = new AbortController();
    getSettings({ signal: ctrl.signal })
      .then((res) => {
        const data = res?.data || res || {};
        // Map your API response fields to form keys (adjust if needed)
        setForm((p) => ({
          ...p,
          websiteName: data.websiteName || data.siteName || p.websiteName,
          siteImageUrl: data.siteImageUrl || data.siteImage || p.siteImageUrl,
          timezone: data.timezone || p.timezone,
          currency: data.currency || p.currency,
          onesignalAppId: data.onesignalAppId || p.onesignalAppId,
          onesignalRestKey: data.onesignalRestKey || p.onesignalRestKey,
          smsType: data.smsType || p.smsType,
          msg91AuthKey: data.msg91AuthKey || p.msg91AuthKey,
          msg91OtpTemplateId: data.msg91OtpTemplateId || p.msg91OtpTemplateId,
          twilioSid: data.twilioSid || p.twilioSid,
          twilioAuthToken: data.twilioAuthToken || p.twilioAuthToken,
          twilioPhone: data.twilioPhone || p.twilioPhone,
          admobBannerId: data.admobBannerId || p.admobBannerId,
          admobInterstitialId: data.admobInterstitialId || p.admobInterstitialId,
          admobIosBannerId: data.admobIosBannerId || p.admobIosBannerId,
          admobIosInterstitialId: data.admobIosInterstitialId || p.admobIosInterstitialId,
          googleMapKey: data.googleMapKey || p.googleMapKey,
          perCoinPrice: data.perCoinPrice || p.perCoinPrice,
          coinWithdrawLimit: data.coinWithdrawLimit || p.coinWithdrawLimit,
          giftFunction: data.giftFunction || p.giftFunction,
          otpAuthSignup: data.otpAuthSignup || p.otpAuthSignup,
          agoraApiId: data.agoraApiId || p.agoraApiId,
          admobEnable: data.admobEnable ?? p.admobEnable,
          maintenanceMode: data.maintenanceMode ?? p.maintenanceMode,
          freeMode: data.freeMode ?? p.freeMode,
        }));
      })
      .catch((e) => {
        if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;
        setError(e?.message || "Failed to load settings");
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onFileSelect = (file) => {
    if (!file) return;
    // preview locally
    setImgFile(file);
    setForm((p) => ({ ...p, siteImageUrl: URL.createObjectURL(file) }));
  };

  const onRemoveImage = () => {
    setImgFile(null);
    setForm((p) => ({ ...p, siteImageUrl: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form };

      // If image file exists, upload first (if your backend uses file endpoint)
      if (imgFile) {
        const fd = new FormData();
        fd.append("file", imgFile);
        // uploadImage should return uploaded image URL in response (adjust as backend)
        const uploaded = await uploadImage(fd);
        payload.siteImageUrl = uploaded?.url || uploaded?.data?.url || payload.siteImageUrl;
      }

      // Note: if your backend expects multipart for everything, send FormData instead.
      await updateSettings(payload);
      alert("Settings updated");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Setting Management</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormSection icon={<FaCog />} title="General Information">
          <FormGridLayout columns={4}>
            <HeadingAndData label="Website Name" name="websiteName" value={form.websiteName} onChange={handleChange} placeholder="Website name" required />
            <FileInputWithPreview label="Website Image" imageUrl={form.siteImageUrl} onFileSelect={onFileSelect} onRemove={onRemoveImage} hint="Choose Website Image" />
            <HeadingAndDropdown label="Select Timezone" name="timezone" value={form.timezone} onChange={handleChange} options={[{value:"Asia/Kolkata",label:"Asia/Kolkata"},{value:"UTC",label:"UTC"}]} />
            <HeadingAndData label="Enter Currency" name="currency" value={form.currency} onChange={handleChange} placeholder="₹" required />
          </FormGridLayout>
        </FormSection>

        <FormSection icon={<FaBullhorn />} title="Onesignal Information">
          <FormGridLayout columns={3}>
            <HeadingAndData label="Enter User App Onesignal App Id" name="onesignalAppId" value={form.onesignalAppId} onChange={handleChange} />
            <HeadingAndData label="Enter User App Onesignal Rest Api Key" name="onesignalRestKey" value={form.onesignalRestKey} onChange={handleChange} />
            <HeadingAndData label="SMS Type" name="smsType" value={form.smsType} onChange={handleChange} />
          </FormGridLayout>
        </FormSection>

        <FormSection icon={<FaSms />} title="Msg91 Sms Configurations">
          <FormGridLayout columns={2}>
            <MaskedInput label="Msg91 Auth Key" name="msg91AuthKey" value={form.msg91AuthKey} onChange={handleChange} />
            <MaskedInput label="Msg91 Otp Template Id" name="msg91OtpTemplateId" value={form.msg91OtpTemplateId} onChange={handleChange} />
          </FormGridLayout>
        </FormSection>

        <FormSection icon={<FaSms />} title="Twilio Sms Configurations">
          <FormGridLayout columns={3}>
            <HeadingAndData label="Twilio Account SID" name="twilioSid" value={form.twilioSid} onChange={handleChange} />
            <MaskedInput label="Twilio Auth Token" name="twilioAuthToken" value={form.twilioAuthToken} onChange={handleChange} />
            <HeadingAndData label="Twilio Phone Number" name="twilioPhone" value={form.twilioPhone} onChange={handleChange} />
          </FormGridLayout>
        </FormSection>

        {/* Other settings / toggles row */}
        <FormSection title="Other Setting">
          <FormGridLayout columns={3}>
            <HeadingAndDropdown label="Admob Enable?" name="admobEnable" value={form.admobEnable} onChange={handleChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
            <HeadingAndDropdown label="Maintenance Mode?" name="maintenanceMode" value={form.maintenanceMode} onChange={handleChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
            <HeadingAndDropdown label="Free Mode? (use all premium features as free)" name="freeMode" value={form.freeMode} onChange={handleChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          </FormGridLayout>
        </FormSection>

        <FormSection icon={<FaAd />} title="Admob Configurations">
          <FormGridLayout columns={3}>
            <HeadingAndData label="Banner Ad Id" name="admobBannerId" value={form.admobBannerId} onChange={handleChange} />
            <HeadingAndData label="Interstitial Ad Id" name="admobInterstitialId" value={form.admobInterstitialId} onChange={handleChange} />
            <HeadingAndData label="Ios Banner Ad Id" name="admobIosBannerId" value={form.admobIosBannerId} onChange={handleChange} />
            <HeadingAndData label="Ios Interstitial Ad Id" name="admobIosInterstitialId" value={form.admobIosInterstitialId} onChange={handleChange} />
          </FormGridLayout>
        </FormSection>

        <FormSection icon={<FaMapMarkedAlt />} title="Google Map Configurations">
          <FormGridLayout columns={1}>
            <HeadingAndData label="Google Map key" name="googleMapKey" value={form.googleMapKey} onChange={handleChange} />
          </FormGridLayout>
        </FormSection>

        <FormSection icon={<FaCoins />} title="Coin Configurations">
          <FormGridLayout columns={3}>
            <HeadingAndData label="Per Coin Price (1 coin price in currency)" name="perCoinPrice" value={form.perCoinPrice} onChange={handleChange} />
            <HeadingAndData label="Coin Withdraw Limit" name="coinWithdrawLimit" value={form.coinWithdrawLimit} onChange={handleChange} />
            <HeadingAndDropdown label="Gift Function disable or enable?" name="giftFunction" value={form.giftFunction} onChange={handleChange} options={[{value:"Enabled",label:"Enabled"},{value:"Disabled",label:"Disabled"}]} />
          </FormGridLayout>
        </FormSection>

        <FormSection icon={<FaKey />} title="Otp Configurations">
          <FormGridLayout columns={1}>
            <HeadingAndDropdown label="Otp Auth In Sign up?" name="otpAuthSignup" value={form.otpAuthSignup} onChange={handleChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          </FormGridLayout>
        </FormSection>

        <FormSection icon={<FaLock />} title="Agora Configurations">
          <FormGridLayout columns={1}>
            <HeadingAndData label="Agora Api Id" name="agoraApiId" value={form.agoraApiId} onChange={handleChange} />
          </FormGridLayout>
        </FormSection>

        

        {error && <div className={styles.error}>{error}</div>}

        <FormActions onCancel={() => window.location.reload()} submitLabel="Edit Setting" loading={saving} />
      </form>
    </div>
  );
}
