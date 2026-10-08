// Customer safety: file a report against a vendor or booking for admin audit.
import { useState } from "react";
import { ReportItem } from "../types";

interface ReportModalProps {
  targetType: "VENDOR" | "BOOKING";
  targetId: string;
  targetName: string;
  reporterName: string;
  onSubmit: (report: Omit<ReportItem, "id" | "createdAt" | "status">) => void;
  onClose: () => void;
}

export function ReportModal({
  targetType,
  targetId,
  targetName,
  reporterName,
  onSubmit,
  onClose,
}: ReportModalProps) {
  const [reason, setReason] = useState("Price discrepancy");
  const [details, setDetails] = useState("");

  const reasons = [
    "Price discrepancy / Overcharging",
    "Restricted items issue",
    "Unresponsive vendor / Delay",
    "Service quality issue",
    "Misleading information",
    "Other",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;
    onSubmit({
      reporterId: "current_user",
      reporterName,
      targetType,
      targetId,
      targetName,
      reason,
      details: details.trim(),
    });
    onClose();
  };

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="modal report-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Report Issue to Campus Admin</div>
            <p className="modal-subtitle">
              Reporting: <strong>{targetName}</strong> ({targetType})
            </p>
          </div>
          <button className="icon-button close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label className="field">
            <span>Primary Reason</span>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="select-field"
            >
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Details of the Issue</span>
            <textarea
              required
              rows={4}
              placeholder="Describe what occurred with as much detail as possible..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="textarea-field"
            />
          </label>

          <div className="info-note">
            🛡️ <strong>Trust & Accountability:</strong> Reports are directly audited by the Campus Marketplace Administrator to resolve disputes and verify vendor compliance.
          </div>

          <div className="button-pair">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button danger-button">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
