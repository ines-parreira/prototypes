import { useState } from "react";

// ─── Design Tokens ───
const tokens = {
  bg: "#FFFFFF",
  bgMuted: "#F7F7F8",
  bgAccent: "#F0F0F2",
  border: "#E5E5E7",
  borderSubtle: "#EFEFEF",
  text: "#1A1A1A",
  textSecondary: "#6B6B6F",
  textTertiary: "#9B9B9F",
  accent: "#1A1A1A",
  accentSubtle: "#E8E8EC",
  success: "#16A34A",
  successBg: "#F0FDF4",
  blue: "#2563EB",
  blueBg: "#EFF6FF",
};

// ─── Icons (inline SVGs) ───
const ChevronDown = ({ open }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    style={{
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 200ms ease",
      flexShrink: 0,
    }}
  >
    <path
      d="M4 6L8 10L12 6"
      stroke={tokens.textSecondary}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M3 7L6 10L11 4"
      stroke={tokens.success}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SpinnerIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    style={{ animation: "spin 1s linear infinite" }}
  >
    <circle
      cx="7"
      cy="7"
      r="5.5"
      stroke={tokens.borderSubtle}
      strokeWidth="1.5"
    />
    <path
      d="M12.5 7A5.5 5.5 0 0 0 7 1.5"
      stroke={tokens.textSecondary}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const DocIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="3"
      y="1.5"
      width="10"
      height="13"
      rx="1.5"
      stroke={tokens.textSecondary}
      strokeWidth="1.2"
    />
    <line
      x1="5.5"
      y1="5"
      x2="10.5"
      y2="5"
      stroke={tokens.textSecondary}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <line
      x1="5.5"
      y1="7.5"
      x2="10.5"
      y2="7.5"
      stroke={tokens.textSecondary}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <line
      x1="5.5"
      y1="10"
      x2="8.5"
      y2="10"
      stroke={tokens.textSecondary}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

// ─── COMPONENT 1: ProcessIndicator ───
// Replaces the wall of tool-call cards. Collapses all "thinking" steps
// into a single expandable line — like Claude's approach.
function ProcessIndicator({ steps, status = "done" }) {
  const [open, setOpen] = useState(false);
  const completedCount = steps.filter((s) => s.done).length;

  return (
    <div style={{ margin: "8px 0" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          background: "none",
          border: "none",
          cursor: "pointer",
          borderRadius: "8px",
          width: "100%",
          transition: "background 150ms",
          fontSize: "13px",
          color: tokens.textSecondary,
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = tokens.bgMuted)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        {status === "running" ? <SpinnerIcon /> : <CheckIcon />}
        <span>
          {status === "running"
            ? `Analyzing data...`
            : `Analyzed ${completedCount} sources`}
        </span>
        <span style={{ marginLeft: "auto" }}>
          <ChevronDown open={open} />
        </span>
      </button>

      {open && (
        <div
          style={{
            marginLeft: "20px",
            borderLeft: `1.5px solid ${tokens.border}`,
            paddingLeft: "16px",
            paddingTop: "4px",
            paddingBottom: "4px",
          }}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 0",
                fontSize: "12px",
                color: step.done ? tokens.textTertiary : tokens.textSecondary,
              }}
            >
              {step.done ? <CheckIcon /> : <SpinnerIcon />}
              <span>{step.label}</span>
              {step.detail && (
                <span style={{ color: tokens.textTertiary }}>
                  — {step.detail}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── COMPONENT 2: InsightCard ───
// Replaces dense inline bold text + tables. A scannable highlight
// that surfaces the key number or finding.
function InsightCard({ metric, label, trend, trendDirection = "neutral" }) {
  const trendColor =
    trendDirection === "positive"
      ? tokens.success
      : trendDirection === "negative"
        ? "#DC2626"
        : tokens.textSecondary;

  return (
    <div
      style={{
        padding: "16px 20px",
        background: tokens.bgMuted,
        borderRadius: "12px",
        flex: "1 1 0",
        minWidth: "140px",
      }}
    >
      <div
        style={{
          fontSize: "24px",
          fontWeight: "600",
          color: tokens.text,
          lineHeight: "1.2",
        }}
      >
        {metric}
      </div>
      <div
        style={{
          fontSize: "13px",
          color: tokens.textSecondary,
          marginTop: "4px",
        }}
      >
        {label}
      </div>
      {trend && (
        <div
          style={{
            fontSize: "12px",
            color: trendColor,
            marginTop: "6px",
            fontWeight: "500",
          }}
        >
          {trend}
        </div>
      )}
    </div>
  );
}

// ─── COMPONENT 3: Mention ───
// A lightweight inline reference to a guidance, topic, or entity.
// Feels like part of the prose, not a card. Think "@channel" in Slack
// or a wiki link — just enough to be recognizable and tappable.
function Mention({ children, detail }) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "1px 8px",
        background: hovered ? tokens.accentSubtle : tokens.bgMuted,
        borderRadius: "6px",
        fontSize: "inherit",
        fontWeight: "500",
        color: tokens.text,
        cursor: "default",
        transition: "background 150ms",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {detail && (
        <span
          style={{
            fontSize: "12px",
            color: tokens.textTertiary,
            fontWeight: "400",
          }}
        >
          {detail}
        </span>
      )}
    </span>
  );
}

// ─── COMPONENT 4: ReportAttachment ───
// Replaces the inline report card. A subtle file attachment.
function ReportAttachment({ title, type = "Report" }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 14px",
        border: `1px solid ${tokens.border}`,
        borderRadius: "10px",
        fontSize: "13px",
        color: tokens.text,
        cursor: "pointer",
        transition: "background 150ms",
        background: tokens.bg,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = tokens.bgMuted)}
      onMouseLeave={(e) => (e.currentTarget.style.background = tokens.bg)}
    >
      <DocIcon />
      <span style={{ fontWeight: "500" }}>{title}</span>
      <span
        style={{
          fontSize: "11px",
          color: tokens.textSecondary,
          padding: "1px 6px",
          background: tokens.bgMuted,
          borderRadius: "4px",
        }}
      >
        {type}
      </span>
    </div>
  );
}

// ─── COMPONENT 5: InlineDataRow ───
// Compact data display for ranked lists — replaces heavy tables.
function InlineDataRow({ rank, label, value, share }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 0",
        borderBottom: `1px solid ${tokens.borderSubtle}`,
        fontSize: "13.5px",
      }}
    >
      <span
        style={{
          color: tokens.textTertiary,
          fontSize: "12px",
          width: "18px",
          textAlign: "right",
        }}
      >
        {rank}
      </span>
      <span style={{ flex: 1, color: tokens.text }}>{label}</span>
      <span style={{ fontWeight: "600", color: tokens.text, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      <span
        style={{
          color: tokens.textSecondary,
          fontSize: "12px",
          width: "36px",
          textAlign: "right",
        }}
      >
        {share}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN DEMO — Shows the redesigned copilot response
// ═══════════════════════════════════════════════
export default function CopilotComponentSystem() {
  const [activeTab, setActiveTab] = useState("proposed");

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: "640px",
        margin: "0 auto",
        padding: "32px 20px",
        color: tokens.text,
        background: tokens.bg,
        minHeight: "100vh",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Tab switcher */}
      <div
        style={{
          display: "flex",
          gap: "2px",
          marginBottom: "32px",
          padding: "3px",
          background: tokens.bgMuted,
          borderRadius: "10px",
          width: "fit-content",
        }}
      >
        {["proposed", "anatomy"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "7px 16px",
              fontSize: "13px",
              fontWeight: "500",
              background: activeTab === tab ? tokens.bg : "transparent",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              color: activeTab === tab ? tokens.text : tokens.textSecondary,
              boxShadow:
                activeTab === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              fontFamily: "inherit",
              transition: "all 150ms",
            }}
          >
            {tab === "proposed" ? "Proposed UI" : "Component Anatomy"}
          </button>
        ))}
      </div>

      {activeTab === "proposed" ? (
        <>
          {/* ── The user's message ── */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
            <div
              style={{
                padding: "10px 16px",
                background: tokens.bgMuted,
                borderRadius: "18px 18px 4px 18px",
                fontSize: "14px",
                maxWidth: "80%",
              }}
            >
              Improve my guidances based on ticket handovers
            </div>
          </div>

          {/* ── COMPONENT 1: ProcessIndicator ── */}
          <ProcessIndicator
            status="done"
            steps={[
              { label: "Loaded guidance knowledge", detail: "core, variables, workflow", done: true },
              { label: "Listed current guidances", detail: "12 active", done: true },
              { label: "Queried handover data", detail: "last 90 days", done: true },
              { label: "Analyzed top handover topics", detail: "15 clusters found", done: true },
              { label: "Sampled agent responses", detail: "billing, cancellation, refunds", done: true },
              { label: "Reviewed AI reasoning logs", detail: "14 handover patterns", done: true },
            ]}
          />

          {/* ── Response text — concise summary ── */}
          <div
            style={{
              fontSize: "14.5px",
              lineHeight: "1.65",
              color: tokens.text,
              margin: "16px 0",
            }}
          >
            I analyzed your AI Agent's handover patterns over the last 90 days.
            Your handover rate is <strong>42.4%</strong> (10,460 of 24,662 executions) — trending
            down from ~50% in January to ~38% in mid-March. Three topic clusters
            drive 86% of all topic-triggered escalations.
          </div>

          {/* ── COMPONENT 2: InsightCards ── */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              margin: "16px 0",
              flexWrap: "wrap",
            }}
          >
            <InsightCard
              metric="42.4%"
              label="Handover rate"
              trend="↓ from 50% in Jan"
              trendDirection="positive"
            />
            <InsightCard
              metric="10,460"
              label="Total handovers"
              trend="~3,487/mo"
            />
            <InsightCard
              metric="3"
              label="Top topic clusters"
              trend="86% of escalations"
            />
          </div>

          {/* ── Key finding callout ── */}
          <div
            style={{
              margin: "20px 0",
              fontSize: "14.5px",
              lineHeight: "1.65",
            }}
          >
            The critical finding: all three topics trigger{" "}
            <strong>immediate handover with zero qualification</strong>. The AI
            detects the keyword and escalates instantly — simple questions like
            "Where do I download my invoice?" get the same treatment as billing
            disputes.
          </div>

          {/* ── Guidance proposals — all prose with Mentions ── */}
          <div
            style={{
              fontSize: "14.5px",
              lineHeight: "1.65",
              color: tokens.text,
              margin: "20px 0",
            }}
          >
            <p style={{ margin: "0 0 14px" }}>
              I'd suggest three new guidances based on what your agents are already doing:
            </p>
            <p style={{ margin: "0 0 14px" }}>
              <strong>1.</strong>{" "}
              <Mention detail="247 handovers">Billing & invoicing</Mention>{" "}
              — customers ask about overage confusion, plan changes, and payment methods.
              Your agents consistently direct them to Settings → Billing & Usage. A guidance
              that routes informational questions to self-serve links while escalating disputes
              could automate ~40-50% of these.
            </p>
            <p style={{ margin: "0 0 14px" }}>
              <strong>2.</strong>{" "}
              <Mention detail="152 handovers">Subscription cancellation & pausing</Mention>{" "}
              — agents follow a retention-first pattern, offering downgrades and pause options
              before processing. A guidance handling self-serve downgrades and trial
              clarifications could automate ~30-40%.
            </p>
            <p style={{ margin: "0 0 14px" }}>
              <strong>3.</strong>{" "}
              <Mention detail="51 handovers">Coupons & refunds</Mention>{" "}
              — mostly product how-to questions. A guidance directing to docs for
              configuration while escalating billing refunds could automate ~40%.
            </p>
            <p style={{ margin: "0 0 14px" }}>
              Across all three, I'd also recommend splitting the monolithic "billing" handover
              topic into sub-topics so AI can resolve the simple ones, and adding a single
              clarifying question before handover to separate informational queries from
              transactional ones. Email is worth focusing on first — it has a 71.6% handover
              rate vs 66.3% on chat.
            </p>
            <p style={{ margin: "0", color: tokens.textSecondary }}>
              Together, these could automate ~165-200 handovers over 90 days, saving roughly
              57-67 tickets per month.
            </p>
          </div>

          {/* ── COMPONENT 5: Report attachment ── */}
          <div style={{ margin: "20px 0" }}>
            <ReportAttachment title="Guidance Improvement Proposals" type="Report" />
          </div>

          {/* ── Closing ── */}
          <div
            style={{
              fontSize: "14px",
              color: tokens.textSecondary,
              lineHeight: "1.6",
            }}
          >
            Want me to draft any of these three guidances so you can review and
            publish them?
          </div>
        </>
      ) : (
        /* ═══ ANATOMY TAB ═══ */
        <div style={{ fontSize: "14px", lineHeight: "1.7", color: tokens.text }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 24px" }}>
            Component Anatomy
          </h2>

          {/* ProcessIndicator */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: tokens.textTertiary, marginBottom: "8px" }}>
              1 · Process Indicator
            </div>
            <div style={{ fontSize: "13.5px", color: tokens.textSecondary, marginBottom: "12px" }}>
              Collapses all tool calls / thinking steps into a single line. Expandable for transparency, but collapsed by default so the answer leads.
            </div>
            <div style={{ padding: "16px", background: tokens.bgMuted, borderRadius: "12px" }}>
              <ProcessIndicator
                status="done"
                steps={[
                  { label: "Loaded guidance knowledge", detail: "3 sources", done: true },
                  { label: "Queried handover data", detail: "last 90 days", done: true },
                  { label: "Analyzed patterns", detail: "15 clusters", done: true },
                ]}
              />
            </div>
            <div style={{ marginTop: "8px", fontSize: "12px", color: tokens.textTertiary }}>
              <strong>When to use:</strong> Any time the copilot runs multiple tool calls / data fetches before responding.
            </div>
          </div>

          {/* InsightCard */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: tokens.textTertiary, marginBottom: "8px" }}>
              2 · Insight Card
            </div>
            <div style={{ fontSize: "13.5px", color: tokens.textSecondary, marginBottom: "12px" }}>
              Surfaces a key metric or finding as a scannable tile. Use in groups of 2-4 for dashboard-style summaries at the top of a response.
            </div>
            <div style={{ display: "flex", gap: "8px", padding: "16px", background: tokens.bgMuted, borderRadius: "12px" }}>
              <InsightCard metric="42.4%" label="Handover rate" trend="↓ from 50%" trendDirection="positive" />
              <InsightCard metric="10,460" label="Total handovers" />
            </div>
          </div>

          {/* Mention */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: tokens.textTertiary, marginBottom: "8px" }}>
              3 · Mention
            </div>
            <div style={{ fontSize: "13.5px", color: tokens.textSecondary, marginBottom: "12px" }}>
              A lightweight inline chip that references a guidance, topic, or entity within prose. Not a card — it lives inside sentences. Think @mention in Slack or a wiki link. Use whenever the copilot names something the user could navigate to.
            </div>
            <div style={{ padding: "16px", background: tokens.bgMuted, borderRadius: "12px", fontSize: "14px", lineHeight: "1.65" }}>
              <p style={{ margin: 0 }}>
                The top handover topic is{" "}
                <Mention detail="247">Billing & invoicing</Mention>{" "}
                followed by{" "}
                <Mention detail="152">Subscription cancellation</Mention>.
              </p>
            </div>
            <div style={{ marginTop: "8px", fontSize: "12px", color: tokens.textTertiary }}>
              <strong>When to use:</strong> Referencing guidances, topics, agents, or any named entity inline. Not for standalone recommendations — those should just be prose.
            </div>
          </div>

          {/* InlineDataRow */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: tokens.textTertiary, marginBottom: "8px" }}>
              4 · Inline Data Row
            </div>
            <div style={{ fontSize: "13.5px", color: tokens.textSecondary, marginBottom: "12px" }}>
              Lightweight ranked-list display. Replaces heavy full-width tables for simple ranked data. Use sparingly — only when exact numbers add real value beyond what prose can carry.
            </div>
            <div style={{ padding: "16px", background: tokens.bgMuted, borderRadius: "12px" }}>
              <InlineDataRow rank="1" label="Billing & invoicing" value="247" share="49%" />
              <InlineDataRow rank="2" label="Subscription cancellation" value="152" share="30%" />
            </div>
          </div>

          {/* ReportAttachment */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: tokens.textTertiary, marginBottom: "8px" }}>
              5 · Report Attachment
            </div>
            <div style={{ fontSize: "13.5px", color: tokens.textSecondary, marginBottom: "12px" }}>
              Compact file-attachment chip for generated reports / documents. Replaces the heavy inline report card.
            </div>
            <div style={{ padding: "16px", background: tokens.bgMuted, borderRadius: "12px" }}>
              <ReportAttachment title="Guidance Improvement Proposals" type="Report" />
            </div>
          </div>

          {/* Design Principles */}
          <div style={{ padding: "20px", background: tokens.bgMuted, borderRadius: "12px" }}>
            <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: "12px" }}>
              Design principles
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px", color: tokens.textSecondary }}>
              <div><strong style={{ color: tokens.text }}>Answer first, process second.</strong> The response text leads. Tool calls collapse into a single line.</div>
              <div><strong style={{ color: tokens.text }}>Prose is the default.</strong> The copilot is talking, not building a dashboard. Recommendations, cross-cutting advice, and impact estimates are sentences — not cards, expandables, or tables. Structure earns its way in.</div>
              <div><strong style={{ color: tokens.text }}>Components are for data, not for opinions.</strong> Insight Cards and Data Rows exist because numbers benefit from visual separation. Mentions exist because entities benefit from being tappable. Everything else is prose.</div>
              <div><strong style={{ color: tokens.text }}>One response, one scroll.</strong> If the default view doesn't fit on one screen, something has too much visual weight. Cut the container before cutting the content.</div>
              <div><strong style={{ color: tokens.text }}>Flat visual hierarchy.</strong> Muted backgrounds, subtle borders. No element should fight the prose for attention.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
