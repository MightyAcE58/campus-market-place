// Pilot validation story: owner Q&A + 12-step journey with demo-flow shortcuts.
import { useState } from "react";

interface PilotCaseStudyModalProps {
  onClose: () => void;
  onLaunchDemoFlow: (category: "laundry" | "ride") => void;
}

export function PilotCaseStudyModal({ onClose, onLaunchDemoFlow }: PilotCaseStudyModalProps) {
  const [activeTab, setActiveTab] = useState<"validation" | "comparison" | "journey">("validation");

  const validationQuestions = [
    {
      q: "1. How do customers currently contact you?",
      a: "Primarily through 8 different hostel WhatsApp groups and personal messages to the owner's phone number. Conversations get mixed up with personal family chats.",
    },
    {
      q: "2. How do new students discover you?",
      a: "Only by asking seniors in their hostel or through word of mouth during orientation week. Many first-year students never find out about the laundry service until mid-semester.",
    },
    {
      q: "3. What do students repeatedly ask?",
      a: "Every single day: 'What is the rate per kg?', 'Can you wash blankets?', 'When will you pick up from Hostel B?', and 'Is my laundry ready yet?'. Answering these manually takes 2+ hours daily.",
    },
    {
      q: "4. How do you publish promotions?",
      a: "We design a photo flyer and spam it into hostel groups. Within 5 minutes, 30 unrelated student messages bury the flyer completely.",
    },
    {
      q: "5. How do customers negotiate?",
      a: "Students text asking for discounts on bulk clothes. We bargain in WhatsApp DMs, but often forget what price was agreed on by the time the clothes are delivered.",
    },
    {
      q: "6. How do you update customers about service progress?",
      a: "Customers send 'Ready hua kya?' (Is it ready?) messages repeatedly. We have to search our paper register to find their laundry bag and reply manually.",
    },
    {
      q: "7. What part of your current process is most annoying?",
      a: "Lost clothes disputes and repeated pricing inquiries. Without a formal inventory checklist and locked prices, misunderstandings happen constantly.",
    },
    {
      q: "8. How do you track requests?",
      a: "Handwritten paper register books kept at the ironing table. Rain or spills easily damage it, and it's impossible to search customer history.",
    },
    {
      q: "9. What would make you use a centralized platform?",
      a: "A dedicated digital storefront with clear rules, pre-filled hostel rooms, structured item counts, and built-in bargaining that saves the final agreed price.",
    },
    {
      q: "10. What would make you trust it?",
      a: "No middleman holding our customer money (payment stays direct with us), admin-verified student profiles with room numbers, and minimal operational complexity.",
    },
  ];

  const comparisonRows = [
    {
      aspect: "Service Discovery",
      whatsapp: "Fragmented in 8+ informal WhatsApp groups; invisible to new students",
      platform: "Centralized campus catalogue with search, tags, and verified badges",
    },
    {
      aspect: "Pricing & Rules",
      whatsapp: "Students must ask repeatedly; restricted items (e.g. underwear, blankets) argued later",
      platform: "Transparent pricing (rate/kg + fee) and restricted items clearly enforced upfront",
    },
    {
      aspect: "Promotions & Offers",
      whatsapp: "Promotional flyers get buried in group chat noise within 10 minutes",
      platform: "Persistent Offers page with countdowns, eligibility, and 1-click booking",
    },
    {
      aspect: "Request Submissions",
      whatsapp: "Unstructured messy text messages ('bro take my clothes tonight')",
      platform: "Standardized booking form: clothing counts, bag photo upload, locked hostel",
    },
    {
      aspect: "Price Negotiation",
      whatsapp: "Casual back-and-forth chat; agreed discounts forgotten upon delivery",
      platform: "Structured bargaining: Offer → Counter-Offer → Acceptance; agreed price saved",
    },
    {
      aspect: "Status Tracking",
      whatsapp: "Students constantly spam 'Order ready?' pings; manual phone checks",
      platform: "Real-time status timeline (Requested → Processing → Ready) & in-app alerts",
    },
    {
      aspect: "Payment Handling",
      whatsapp: "Informal, often disputed",
      platform: "Clear zero-middleman policy: Payment collected directly by vendor at delivery",
    },
  ];

  const journeySteps = [
    { step: 1, title: "Vendor Onboarding", desc: "Admin onboards FreshFold Laundry with rules (no underwear/blankets, ₹80/kg + ₹30 fee)." },
    { step: 2, title: "Publish Service & Offer", desc: "FreshFold publishes 'Wash + Iron' and 'Weekend Laundry Deal (₹60/kg)'." },
    { step: 3, title: "Student Discovery", desc: "Aarav Mehta browses campus laundry, filters by hostel pickup, views FreshFold profile." },
    { step: 4, title: "Views Rules & Restrictions", desc: "Aarav notes blankets are dry-clean restricted and hostel pickup is locked to Maple B-204." },
    { step: 5, title: "Initiates In-Platform Chat", desc: "Aarav opens chat: 'Can you pick up 3 shirts, 2 pants, 1 bedsheet today?'" },
    { step: 6, title: "Student Submits Offer", desc: "Aarav submits a price offer: ₹160 (against listed ₹198 estimate)." },
    { step: 7, title: "Vendor Counter-Offer", desc: "Rahul Verma counter-offers ₹175 with steam iron included." },
    { step: 8, title: "Agreement & Price Locked", desc: "Aarav accepts. Final agreed price of ₹175 is permanently locked in system." },
    { step: 9, title: "Request Record Created", desc: "Booking CCM-L-1042 created with bag photo, quantities, and agreed price." },
    { step: 10, title: "Status Updates", desc: "Vendor transitions status: RECEIVED → PROCESSING → READY." },
    { step: 11, title: "In-App Notification", desc: "Student receives notification: 'Your laundry is ready for collection at Maple Reception'." },
    { step: 12, title: "Direct Payment & Completion", desc: "Student pays ₹175 directly to FreshFold at handover. Request archived." },
  ];

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="modal wide pilot-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="pilot-modal-title">
            <span className="pilot-tag">PRD Section 2 & 57 Validation</span>
            <h2>Pilot Business Case Study: FreshFold Laundry</h2>
            <p>
              Validating the MVP with real business owner <strong>Rahul Verma</strong> and replacing the
              fragmented WhatsApp workflow.
            </p>
          </div>
          <button className="icon-button close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs pilot-tabs">
          <button
            className={activeTab === "validation" ? "active" : ""}
            onClick={() => setActiveTab("validation")}
          >
            📋 Real Owner Interview (10 Q&A)
          </button>
          <button
            className={activeTab === "comparison" ? "active" : ""}
            onClick={() => setActiveTab("comparison")}
          >
            ⚖️ WhatsApp vs Campus Commerce
          </button>
          <button
            className={activeTab === "journey" ? "active" : ""}
            onClick={() => setActiveTab("journey")}
          >
            🚀 12-Step Pilot Journey Walkthrough
          </button>
        </div>

        {/* Tab 1: 10 Interview Questions */}
        {activeTab === "validation" && (
          <div className="pilot-content">
            <div className="owner-card">
              <div className="owner-avatar">RV</div>
              <div>
                <strong>Rahul Verma · Owner, FreshFold Laundry</strong>
                <p>
                  Operates laundry pickup across 4 hostels (Maple, Oak, Pine, Rose). Serves 180+ students
                  weekly. Validated during First-Hour Discovery.
                </p>
              </div>
            </div>

            <div className="qa-grid">
              {validationQuestions.map((item, idx) => (
                <div key={idx} className="qa-card">
                  <div className="qa-q">{item.q}</div>
                  <div className="qa-a">{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: WhatsApp vs Campus Commerce Comparison */}
        {activeTab === "comparison" && (
          <div className="pilot-content">
            <div className="comparison-intro">
              <strong>Why WhatsApp Fails for Campus Commerce:</strong> While WhatsApp is useful for casual
              chat, it is fragmented, unsearchable, and causes constant operational headaches for campus vendors.
            </div>

            <div className="comparison-table-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Workflow Aspect</th>
                    <th className="th-wa">❌ WhatsApp Reality (The Problem)</th>
                    <th className="th-ccm">✓ Campus Commerce MVP (The Solution)</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="td-aspect">{row.aspect}</td>
                      <td className="td-wa">{row.whatsapp}</td>
                      <td className="td-ccm">{row.platform}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: 12-Step Pilot Journey */}
        {activeTab === "journey" && (
          <div className="pilot-content">
            <div className="journey-header">
              <div>
                <strong>The Complete Pilot End-to-End Journey (PRD Section 58)</strong>
                <p>Walk through every stage of how FreshFold Laundry interacts with Aarav Mehta.</p>
              </div>
              <button
                className="button tiny"
                onClick={() => {
                  onClose();
                  onLaunchDemoFlow("laundry");
                }}
              >
                Test Laundry Flow Now →
              </button>
            </div>

            <div className="journey-timeline">
              {journeySteps.map((step) => (
                <div key={step.step} className="journey-step-card">
                  <div className="journey-badge">{step.step}</div>
                  <div className="journey-body">
                    <strong>{step.title}</strong>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="modal-footer pilot-footer">
          <div className="pilot-principle">
            <strong>MVP Principle Enforced:</strong> Digitize discovery, booking, communication, negotiation,
            and service updates without forcing vendors to change their physical fulfillment or collection!
          </div>
          <button className="button" onClick={onClose}>
            Got it, explore app
          </button>
        </div>
      </div>
    </div>
  );
}
