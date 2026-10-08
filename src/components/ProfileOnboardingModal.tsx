import { useState } from "react";
import { UserProfile, Role } from "../types";
import { signInWithGoogle } from "../lib/firebase";

interface ProfileOnboardingModalProps {
  user: UserProfile;
  isOpen: boolean;
  currentRole?: Role;
  onSave: (updated: Partial<UserProfile>) => void;
  onClose: () => void;
  onQuickSwitch?: (role: "CUSTOMER" | "VENDOR_OWNER" | "ADMIN") => void;
}

export function ProfileOnboardingModal({
  user,
  isOpen,
  currentRole = "customer",
  onSave,
  onClose,
  onQuickSwitch,
}: ProfileOnboardingModalProps) {
  const isAdmin = currentRole === "admin" || user.role === "ADMIN";
  const isVendor = currentRole === "vendor" || user.role === "VENDOR_OWNER";

  // Common and student state
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "+91 98765 43210");
  const [hostel, setHostel] = useState(user.hostel || "Maple Hostel");
  const [roomNumber, setRoomNumber] = useState(user.roomNumber || "B-204");

  // Admin-specific state
  const [adminName, setAdminName] = useState(user.name || "System Admin");
  const [adminPhone, setAdminPhone] = useState(user.phone || "+91 98000 00000");
  const [adminEmail, setAdminEmail] = useState(user.email || "admin@campuscommerce.in");
  const [adminDepartment, setAdminDepartment] = useState(user.hostel || "Administration Center");
  const [adminRoom, setAdminRoom] = useState(user.roomNumber || "Room 101");

  // Vendor-specific state
  const [vendorOwnerName, setVendorOwnerName] = useState(user.name || "Rahul Verma");
  const [vendorPhone, setVendorPhone] = useState(user.phone || "+91 98222 33445");
  const [vendorShopLocation, setVendorShopLocation] = useState(user.hostel || "Vendor Annex");

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  if (!isOpen) return null;

  // Google OAuth Handler
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setFeedbackMsg("");
    try {
      const googleUser = await signInWithGoogle();
      const updatedName = googleUser.displayName || name;
      setName(updatedName);
      onSave({
        id: googleUser.uid,
        name: updatedName,
        email: googleUser.email || user.email,
        authProvider: "google",
      });
      setFeedbackMsg(`✓ Signed in with Google as ${googleUser.email}! You can confirm details below.`);
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        setFeedbackMsg("Google popup closed. You can edit your profile details below.");
      } else if (err.code === "auth/popup-blocked") {
        setFeedbackMsg("Popup blocked by browser. Please allow popups or enter your details below.");
      } else {
        setFeedbackMsg(`Notice: ${err.message || "Could not complete popup sign-in."}`);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Student submit
  const handleSubmitStudent = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      phone: phone.trim(),
      hostel: hostel.trim(),
      roomNumber: roomNumber.trim(),
      isProfileComplete: true,
    });
    onClose();
  };

  // Admin submit
  const handleSubmitAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: adminName.trim(),
      phone: adminPhone.trim(),
      email: adminEmail.trim(),
      hostel: adminDepartment.trim(),
      roomNumber: adminRoom.trim(),
      isProfileComplete: true,
    });
    onClose();
  };

  // Vendor submit
  const handleSubmitVendor = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: vendorOwnerName.trim(),
      phone: vendorPhone.trim(),
      hostel: vendorShopLocation.trim(),
      isProfileComplete: true,
    });
    onClose();
  };

  const hostels = [
    "Maple Hostel",
    "Oak Hostel",
    "Pine Hostel",
    "Rose Hostel",
    "Hostel A",
    "Hostel B",
    "Postgraduate Block",
  ];

  const adminInitials = adminName ? adminName.slice(0, 2).toUpperCase() : "SA";
  const initials = name ? name.slice(0, 2).toUpperCase() : "ST";

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div
        className={`modal profile-modal ${isAdmin ? "admin-modal" : isVendor ? "vendor-modal" : ""}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* ========================================================
            ADMIN VIEW: SYSTEM ADMINISTRATOR PROFILE
            ======================================================== */}
        {isAdmin ? (
          <>
            <div className="profile-modal-header admin-header">
              <button className="profile-close-btn" onClick={onClose} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
              <div className="profile-modal-avatar admin-avatar">
                {adminInitials}
              </div>
              <div className="profile-modal-heading">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h2>System Administrator</h2>
                  <span className="admin-badge-pill">🛡️ SUPER-ADMIN</span>
                </div>
                <p>Campus Operations & Platform Control Unit</p>
              </div>
            </div>

            <div className="profile-modal-body">
              {/* Security and Session Credentials */}
              <div className="admin-uid-card">
                <div>
                  <small style={{ color: "#94a3b8", display: "block", fontSize: 10 }}>FIREBASE CREDENTIALS</small>
                  <code>{user.id}</code>
                </div>
                <span className="admin-verified-tag">● ACTIVE SESSION</span>
              </div>

              {/* Admin Details Form */}
              <form onSubmit={handleSubmitAdmin} className="profile-form">
                <div className="profile-form-section">
                  <label className="profile-field">
                    <span>Administrator Full Name</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vinay Tilada"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                    />
                  </label>

                  <div className="profile-form-row">
                    <label className="profile-field">
                      <span>Operations Support Phone</span>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98000 00000"
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                      />
                    </label>

                    <label className="profile-field">
                      <span>Official Admin Email</span>
                      <input
                        type="email"
                        required
                        placeholder="admin@campuscommerce.in"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                      />
                    </label>
                  </div>

                  <div className="profile-form-row">
                    <label className="profile-field">
                      <span>Department / Building</span>
                      <input
                        type="text"
                        required
                        placeholder="Administration Center"
                        value={adminDepartment}
                        onChange={(e) => setAdminDepartment(e.target.value)}
                      />
                    </label>

                    <label className="profile-field">
                      <span>Operations Room</span>
                      <input
                        type="text"
                        required
                        placeholder="Room 101"
                        value={adminRoom}
                        onChange={(e) => setAdminRoom(e.target.value)}
                      />
                    </label>
                  </div>
                </div>

                {/* Administrator Privileges Matrix */}
                <div className="admin-privileges-card">
                  <div style={{ fontWeight: 800, fontSize: 11, color: "#1e293b", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>⚡</span> PLATFORM PRIVILEGES & SECURITY CLEARANCE
                  </div>
                  <div className="admin-privilege-item">
                    <span>Dispute Mediation & Trust Audit</span>
                    <strong style={{ color: "#167051" }}>Level 3 (Authoritative)</strong>
                  </div>
                  <div className="admin-privilege-item">
                    <span>Vendor Onboarding & Verification</span>
                    <strong style={{ color: "#167051" }}>Full Authority</strong>
                  </div>
                  <div className="admin-privilege-item">
                    <span>Campus Transaction & Rate Oversight</span>
                    <strong style={{ color: "#167051" }}>Unrestricted</strong>
                  </div>
                  <div className="admin-privilege-item">
                    <span>Service Matrix & Category Controls</span>
                    <strong style={{ color: "#167051" }}>Super-Admin</strong>
                  </div>
                </div>

                <button type="submit" className="profile-save-btn admin-save-btn">
                  Save Administrator Profile & Update Session
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </form>

              {/* Quick Persona Switcher */}
              {onQuickSwitch && (
                <div className="profile-switch-section">
                  <div className="profile-switch-label">SWITCH ACTIVE WORKSPACE</div>
                  <div className="profile-switch-grid">
                    <button
                      type="button"
                      className="profile-switch-card"
                      onClick={() => onQuickSwitch("CUSTOMER")}
                    >
                      <span className="profile-switch-emoji">🎓</span>
                      <strong>Student View</strong>
                      <small>Campus Marketplace</small>
                    </button>
                    <button
                      type="button"
                      className="profile-switch-card"
                      onClick={() => onQuickSwitch("VENDOR_OWNER")}
                    >
                      <span className="profile-switch-emoji">🧺</span>
                      <strong>Pilot Vendor</strong>
                      <small>FreshFold Laundry</small>
                    </button>
                    <button
                      type="button"
                      className="profile-switch-card active-role"
                      onClick={() => onQuickSwitch("ADMIN")}
                    >
                      <span className="profile-switch-emoji">🛡️</span>
                      <strong>Admin Portal</strong>
                      <small>Operations Center</small>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : isVendor ? (
          /* ========================================================
             VENDOR VIEW: CAMPUS PARTNER PROFILE
             ======================================================== */
          <>
            <div className="profile-modal-header vendor-header">
              <button className="profile-close-btn" onClick={onClose} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
              <div className="profile-modal-avatar vendor-avatar">
                🧺
              </div>
              <div className="profile-modal-heading">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h2>{user.vendorName || "FreshFold Laundry"}</h2>
                  <span className="vendor-badge-pill">✓ VERIFIED PARTNER</span>
                </div>
                <p>Campus Business Partner Workspace</p>
              </div>
            </div>

            <div className="profile-modal-body">
              <form onSubmit={handleSubmitVendor} className="profile-form">
                <div className="profile-form-section">
                  <label className="profile-field">
                    <span>Business Operator Name</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Verma"
                      value={vendorOwnerName}
                      onChange={(e) => setVendorOwnerName(e.target.value)}
                    />
                  </label>

                  <label className="profile-field">
                    <span>Contact Phone (For Student Orders)</span>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98222 33445"
                      value={vendorPhone}
                      onChange={(e) => setVendorPhone(e.target.value)}
                    />
                  </label>

                  <label className="profile-field">
                    <span>Campus Location / Workshop</span>
                    <input
                      type="text"
                      required
                      placeholder="Vendor Annex - V-12"
                      value={vendorShopLocation}
                      onChange={(e) => setVendorShopLocation(e.target.value)}
                    />
                  </label>
                </div>

                <div className="admin-privileges-card">
                  <div style={{ fontWeight: 800, fontSize: 11, color: "#1e293b", marginBottom: 6 }}>
                    PARTNERSHIP SUMMARY
                  </div>
                  <div className="admin-privilege-item">
                    <span>Subscription Plan</span>
                    <strong>Partner Plan (₹1,500/mo)</strong>
                  </div>
                  <div className="admin-privilege-item">
                    <span>Status</span>
                    <strong style={{ color: "#167051" }}>Admin Verified & Active</strong>
                  </div>
                  <div className="admin-privilege-item">
                    <span>Negotiation Feature</span>
                    <strong style={{ color: "#167051" }}>Enabled (Direct Chat)</strong>
                  </div>
                </div>

                <button type="submit" className="profile-save-btn">
                  Save Vendor Profile & Continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </form>

              {onQuickSwitch && (
                <div className="profile-switch-section">
                  <div className="profile-switch-label">SWITCH ACTIVE WORKSPACE</div>
                  <div className="profile-switch-grid">
                    <button
                      type="button"
                      className="profile-switch-card"
                      onClick={() => onQuickSwitch("CUSTOMER")}
                    >
                      <span className="profile-switch-emoji">🎓</span>
                      <strong>Student View</strong>
                      <small>Marketplace</small>
                    </button>
                    <button
                      type="button"
                      className="profile-switch-card active-role"
                      onClick={() => onQuickSwitch("VENDOR_OWNER")}
                    >
                      <span className="profile-switch-emoji">🧺</span>
                      <strong>Pilot Vendor</strong>
                      <small>FreshFold</small>
                    </button>
                    <button
                      type="button"
                      className="profile-switch-card"
                      onClick={() => onQuickSwitch("ADMIN")}
                    >
                      <span className="profile-switch-emoji">🛡️</span>
                      <strong>Admin Portal</strong>
                      <small>Operations</small>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ========================================================
             STUDENT VIEW: STUDENT PROFILE & SIGN IN
             ======================================================== */
          <>
            <div className="profile-modal-header">
              <button className="profile-close-btn" onClick={onClose} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
              <div className="profile-modal-avatar">
                {initials}
              </div>
              <div className="profile-modal-heading">
                <h2>Student Profile</h2>
                <p>Campus Commerce Student Account</p>
              </div>
            </div>

            <div className="profile-modal-body">
              <div className="profile-auth-card">
                <div className="profile-auth-icon">🔐</div>
                <div className="profile-auth-info">
                  <strong>Firebase Authentication</strong>
                  <small>{user.email || `Session UID: ${user.id.slice(0, 16)}...`}</small>
                </div>
                <button
                  type="button"
                  className="profile-google-btn"
                  disabled={isSigningIn}
                  onClick={handleGoogleSignIn}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  {isSigningIn ? "Connecting..." : "Google Login"}
                </button>
              </div>

              {feedbackMsg && (
                <div className="profile-msg-banner">
                  {feedbackMsg}
                </div>
              )}

              <form onSubmit={handleSubmitStudent} className="profile-form">
                <div className="profile-form-section">
                  <label className="profile-field">
                    <span>Full Name</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vinay Tilada"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>

                  <label className="profile-field">
                    <span>Contact Phone</span>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <small>Profile contact for delivery riders and laundry partners</small>
                  </label>
                </div>

                <div className="profile-form-divider">
                  <span>Hostel & Delivery Location</span>
                </div>

                <div className="profile-form-row">
                  <label className="profile-field">
                    <span>Hostel Block</span>
                    <select
                      value={hostel}
                      onChange={(e) => setHostel(e.target.value)}
                    >
                      {hostels.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </label>

                  <label className="profile-field">
                    <span>Room Number</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. B-204"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                    />
                  </label>
                </div>

                <div className="profile-autofill-note">
                  <span className="profile-autofill-icon">🏠</span>
                  <div>
                    <strong>Campus Profile Auto-Fill:</strong>
                    <small>All booking forms, chats, and billing records will automatically use this name and hostel address.</small>
                  </div>
                </div>

                <button type="submit" className="profile-save-btn">
                  Save Profile & Update Session
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </form>

              {onQuickSwitch && (
                <div className="profile-switch-section">
                  <div className="profile-switch-label">OR SWITCH DEMO PERSONA</div>
                  <div className="profile-switch-grid">
                    <button
                      type="button"
                      className="profile-switch-card active-role"
                      onClick={() => onQuickSwitch("CUSTOMER")}
                    >
                      <span className="profile-switch-emoji">🎓</span>
                      <strong>Student</strong>
                      <small>{name || "Student User"}</small>
                    </button>
                    <button
                      type="button"
                      className="profile-switch-card"
                      onClick={() => onQuickSwitch("VENDOR_OWNER")}
                    >
                      <span className="profile-switch-emoji">🧺</span>
                      <strong>Pilot Vendor</strong>
                      <small>FreshFold Laundry</small>
                    </button>
                    <button
                      type="button"
                      className="profile-switch-card"
                      onClick={() => onQuickSwitch("ADMIN")}
                    >
                      <span className="profile-switch-emoji">🛡️</span>
                      <strong>Platform Admin</strong>
                      <small>Operations Center</small>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
