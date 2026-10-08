// Vendor tool: assign an available rider to a bike-ride booking.
import { useState } from "react";
import { Rider, BookingItem } from "../types";

interface AssignRiderModalProps {
  booking: BookingItem;
  availableRiders: Rider[];
  onAssign: (bookingId: string, rider: Rider) => void;
  onClose: () => void;
}

export function AssignRiderModal({
  booking,
  availableRiders,
  onAssign,
  onClose,
}: AssignRiderModalProps) {
  const [selectedRiderId, setSelectedRiderId] = useState(availableRiders[0]?.id || "");
  const [customName, setCustomName] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [customVehicle, setCustomVehicle] = useState("");
  const [isNewRider, setIsNewRider] = useState(false);

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNewRider) {
      if (!customName || !customPhone) return;
      const newRider: Rider = {
        id: `rd-custom-${Date.now()}`,
        name: customName,
        phone: customPhone,
        vehicleIdentifier: customVehicle || "Bike #Campus",
        active: true,
      };
      onAssign(booking.id, newRider);
    } else {
      const found = availableRiders.find((r) => r.id === selectedRiderId);
      if (found) {
        onAssign(booking.id, found);
      }
    }
    onClose();
  };

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="modal rider-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Assign Rider for Bike Ride</div>
            <p className="modal-subtitle">
              Booking: <strong>{booking.id}</strong> ({booking.summary})
            </p>
          </div>
          <button className="icon-button close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleAssign} className="modal-form">
          <div className="toggle-row">
            <span>
              <strong>{isNewRider ? "Adding New Rider" : "Select from Active Fleet"}</strong>
              <small>Choose an existing rider or enter details manually</small>
            </span>
            <button
              type="button"
              className="text-link"
              onClick={() => setIsNewRider(!isNewRider)}
            >
              {isNewRider ? "Use Existing Rider" : "+ New Rider"}
            </button>
          </div>

          {!isNewRider ? (
            <div className="selection-list compact">
              {availableRiders.map((rider) => (
                <button
                  key={rider.id}
                  type="button"
                  className={`selection-card ${selectedRiderId === rider.id ? "active" : ""}`}
                  onClick={() => setSelectedRiderId(rider.id)}
                >
                  <span className="rider-avatar">RD</span>
                  <span>
                    <strong>{rider.name}</strong>
                    <small>{rider.phone} · {rider.vehicleIdentifier}</small>
                  </span>
                  {selectedRiderId === rider.id && <span className="checkmark">✓</span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="new-rider-fields">
              <label className="field">
                <span>Rider Name</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </label>
              <label className="field">
                <span>Rider Phone Number</span>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 00000"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                />
              </label>
              <label className="field">
                <span>Vehicle Identifier (Optional)</span>
                <input
                  type="text"
                  placeholder="e.g. Hero Splendor DL-09-551"
                  value={customVehicle}
                  onChange={(e) => setCustomVehicle(e.target.value)}
                />
              </label>
            </div>
          )}

          <div className="info-note">
            🛵 <strong>Manual Dispatch Policy:</strong> The customer will immediately see the rider's name, phone, and vehicle details on their live booking screen.
          </div>

          <div className="button-pair">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button">
              Confirm & Assign Rider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
