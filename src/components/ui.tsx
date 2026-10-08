// Shared presentational primitives for Campus Commerce.
// Stateless building blocks used by every screen in `src/App.tsx`:
// stroke icons, catalogue metadata, buttons, badges, form rows, modal shell,
// page headers, empty states, vendor cards, and status timelines.

import type { ReactNode } from "react";
import type { CategoryId, Role, VendorItem } from "../types";

export type IconName =
  | "arrow" | "back" | "bell" | "bike" | "calendar" | "check" | "chevron"
  | "clock" | "close" | "filter" | "food" | "home" | "laundry" | "location"
  | "offer" | "search" | "settings" | "store" | "upload" | "user" | "users"
  | "chat" | "shield" | "star";

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    back: <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    bike: <><circle cx="5.5" cy="16.5" r="3.5" /><circle cx="18.5" cy="16.5" r="3.5" /><path d="m9 16.5 3-7h3l3.5 7M8 8h4M5.5 16.5 9 11l4 5.5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    close: <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
    food: <><path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3v18M17 3c3 2 3 8 0 10" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
    laundry: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="12" cy="13" r="5" /><path d="M7 7h.01M11 7h6" /></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    offer: <><path d="M20 12 12 20l-9-9V4h7l10 8Z" /><circle cx="7.5" cy="8.5" r="1" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7L10.5 2h-3l-.7 2-1.7.7-1.9-.9-2.1 2.1.9 1.9-.7 1.7L0 10.5v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2.3h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7Z" transform="translate(2)" /></>,
    store: <><path d="M4 10v10h16V10M3 10l2-6h14l2 6" /><path d="M3 10a3 3 0 0 0 5 2 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 5-2M9 20v-5h6v5" /></>,
    upload: <><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M4 15v5h16v-5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    users: <><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0M16 5a4 4 0 0 1 0 7M18 15a6 6 0 0 1 4 6" /></>,
    chat: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></>,
  };
  return (
    <svg aria-hidden="true" className="icon" fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        {paths[name]}
      </g>
    </svg>
  );
}

export const categoriesMeta = [
  { id: "ride" as CategoryId, name: "Bike Ride", description: "Quick rides across campus", detail: "From ₹30", icon: "bike" as IconName, className: "blue" },
  { id: "laundry" as CategoryId, name: "Laundry", description: "Pickup, wash and iron", detail: "From ₹60/kg", icon: "laundry" as IconName, className: "violet" },
  { id: "food" as CategoryId, name: "Food", description: "Fresh meals around campus", detail: "From ₹70", icon: "food" as IconName, className: "orange" },
];

export const navByRole: Record<Role, string[]> = {
  customer: ["Home", "Marketplace", "Bookings", "Messages", "Offers"],
  vendor: ["Dashboard", "Requests", "Services", "Messages", "Business Profile", "Offers", "Account"],
  admin: ["Dashboard", "Vendors", "Services", "Users", "Bookings", "Reports", "Disputes"],
};

export function Button({ children, className = "", onClick, disabled = false, type = "button" }: { children: ReactNode; className?: string; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }) {
  return <button className={`button ${className}`} disabled={disabled} onClick={onClick} type={type}>{children}</button>;
}

export function StatusBadge({ value }: { value: string }) {
  // Note: regex replace (not replaceAll) keeps this compatible with the ES2020 lib target.
  const normalized = value.toLowerCase().replace(/ /g, "-");
  return <span className={`status status-${normalized}`}>{value}</span>;
}

export function Field({ label, value, onChange, placeholder, type = "text", locked = false }: { label: string; value: string; onChange?: (value: string) => void; placeholder?: string; type?: string; locked?: boolean }) {
  return (
    <label className={`field ${locked ? "locked" : ""}`}>
      <span>{label}{locked && <small> Auto-filled from profile</small>}</span>
      <input disabled={locked} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} type={type} value={value} />
    </label>
  );
}

export function Toggle({ label, detail, checked, onChange, disabled = false }: { label: string; detail?: string; checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button className="toggle-row" disabled={disabled} onClick={onChange} type="button">
      <span><strong>{label}</strong>{detail && <small>{detail}</small>}</span>
      <i className={checked ? "toggle on" : "toggle"}><b /></i>
    </button>
  );
}

export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className={`modal ${wide ? "wide" : ""}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          <button aria-label="Close" className="icon-button" onClick={onClose}><Icon name="close" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PageHead({ title, subtitle, back, action }: { title: string; subtitle?: string; back?: () => void; action?: ReactNode }) {
  return (
    <div className="page-head">
      <div className="head-copy">
        {back && <button className="back-button" onClick={back}><Icon name="back" /></button>}
        <div>
          <div className="page-title">{title}</div>
          {subtitle && <div className="page-subtitle">{subtitle}</div>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon = "search", title, text, action }: { icon?: IconName; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon name={icon} size={25} /></div>
      <div className="empty-title">{title}</div>
      <div>{text}</div>
      {action}
    </div>
  );
}

export function VendorCard({
  vendor,
  onDetails,
  onBook,
  onChat,
}: {
  vendor: VendorItem;
  onDetails: () => void;
  onBook: () => void;
  onChat: () => void;
}) {
  return (
    <article className="vendor-card">
      <div className={`vendor-cover ${vendor.color}`}>
        <div className="vendor-logo">{vendor.mark}</div>
        {vendor.offer && (
          <div className="offer-pill">
            <Icon name="offer" size={12} /> {vendor.offer}
          </div>
        )}
        <div className="open-pill"><span /> {vendor.status}</div>
      </div>
      <div className="vendor-content">
        <div className="vendor-title-row">
          <div className="vendor-title-info">
            <div className="vendor-name-row">
              <span className="vendor-name">{vendor.name}</span>
              {vendor.verified && <span className="verified-badge">✓ Verified</span>}
              {vendor.isPilotBusiness && <span className="pilot-badge">Pilot</span>}
            </div>
            <div className="vendor-type">{vendor.type}</div>
          </div>
          <button aria-label={`Open ${vendor.name}`} className="round-arrow" onClick={onDetails}>
            <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="vendor-description">{vendor.description}</div>
        <div className="tag-row">
          {vendor.tags
            .filter((tag) => {
              // Avoid duplicate veg pills: dietary badge already covers it for VEG_ONLY kitchens.
              if (vendor.dietaryClassification === "VEG_ONLY") {
                const n = tag.toLowerCase().replace(/[^a-z]/g, "");
                if (n === "vegonly" || n === "veg" || n === "vegonlyvendors") return false;
              }
              return true;
            })
            .slice(0, 4)
            .map((tag) => {
              const lower = tag.toLowerCase();
              const isNegotiable = (tag.includes("Negotiat") || tag.includes("Bargaining")) && !lower.includes("no bargain");
              const isFixed = lower.includes("no bargain") || lower.includes("fixed fare");
              return (
                <span key={tag} className={isNegotiable ? "tag-negotiable" : isFixed ? "tag-fixed" : ""}>
                  {tag}
                </span>
              );
            })}
          {vendor.dietaryClassification === "VEG_ONLY" && (
            <span className="dietary-tag dietary-veg">🌱 Veg Only</span>
          )}
        </div>
        <div className="vendor-meta">
          <Icon name="location" size={13} /> {vendor.area}
        </div>
        <div className="vendor-footer">
          <strong title={vendor.price}>{vendor.price}</strong>
          <div className="vendor-btn-pair">
            <button className="button tiny secondary" onClick={onChat} title="Chat & Bargain">
              <Icon name="chat" size={13} /> Chat
            </button>
            <Button className="tiny" onClick={onBook}>
              Book
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function Timeline({ items, active }: { items: string[]; active: number }) {
  return (
    <div className="timeline">
      {items.map((item, index) => (
        <div className={`timeline-item ${index <= active ? "done" : ""} ${index === active ? "current" : ""}`} key={item}>
          <div className="timeline-mark">{index < active ? <Icon name="check" size={14} /> : index + 1}</div>
          <div>
            <strong>{item}</strong>
            <small>{index <= active ? (index === active ? "Current status" : "Completed step") : "Pending"}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
