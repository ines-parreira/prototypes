import { useEffect, useMemo, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'

import {
    Button,
    ButtonGroup,
    ButtonGroupItem,
    Icon,
    Quantity,
    Tag,
    Text,
    toast,
} from '@gorgias/axiom'
import {
    useConfigureSuggestions,
    useCopilot,
    useCopilotPanel,
} from '@gorgias/copilot'
import { PageHeader } from 'pages/common/components/PageHeader'

import css from './GaiaOpportunitiesPage.less'

type Priority = 'critical' | 'high' | 'low'
type Source = 'AI Agent' | 'Helpdesk' | 'Knowledge'
type ProposalState = 'pending' | 'approved' | 'dismissed'

type Proposal = {
    id: number
    priority: Priority
    source: Source
    eyebrow: string
    title: string
    finding: string
    impact: string
    analysis: string
    suggestions: string[]
}

const PRIORITY: Record<
    Priority,
    { label: string; icon: string; iconClass: string; dotClass: string }
> = {
    critical: {
        label: 'Critical',
        icon: 'arrow-chevron-up-duo',
        iconClass: 'iconCritical',
        dotClass: 'dotCritical',
    },
    high: {
        label: 'High',
        icon: 'arrow-chevron-up',
        iconClass: 'iconHigh',
        dotClass: 'dotHigh',
    },
    low: {
        label: 'Low',
        icon: 'equals',
        iconClass: 'iconLow',
        dotClass: 'dotLow',
    },
}

const PROPOSALS: Proposal[] = [
    {
        id: 1,
        priority: 'critical',
        source: 'AI Agent',
        eyebrow: 'Action gap',
        title: 'Two skills give shoppers different return windows',
        finding:
            'Potter ipsum wand elf parchment wingardium. From mr muggle-born tears rock-cake. Lights should umbridge potter seeker elder parchment centaur.',
        impact: '+12% automation',
        analysis:
            'Your "Returns" and "Holiday policy" skills disagree on the return window (30 vs 14 days). This contradiction affected 218 conversations last month and is the top driver of return-related escalations.',
        suggestions: [
            'Align both skills to 30 days',
            'Which conversations were affected?',
            'Draft the corrected policy',
        ],
    },
    {
        id: 2,
        priority: 'critical',
        source: 'AI Agent',
        eyebrow: 'Underperforming skill',
        title: '"Order tracking" resolves below your average',
        finding:
            'High volume (1,020 conversations) but only 21% success. Carrier-specific steps are missing, so most tracking questions hand off to an agent.',
        impact: '+9% automation',
        analysis:
            '"Order tracking" handles 1,020 conversations/month at 21% resolution — well below your 63% average. Adding carrier-specific instructions should lift automation on this skill.',
        suggestions: [
            'Add carrier-specific steps',
            'Show failing examples',
            'Compare to top skills',
        ],
    },
    {
        id: 3,
        priority: 'high',
        source: 'AI Agent',
        eyebrow: 'Missing intent',
        title: 'Shoppers keep asking about international shipping',
        finding:
            '183 handovers in 30 days had no matching skill, so they defaulted to general knowledge and escalated.',
        impact: '+7% automation',
        analysis:
            '183 international-shipping questions had no matching skill last month. A new skill covering rates and timelines would deflect most of these.',
        suggestions: [
            'Create the skill from these tickets',
            'What questions come up most?',
            'Estimate the deflection',
        ],
    },
    {
        id: 4,
        priority: 'high',
        source: 'Helpdesk',
        eyebrow: 'Macro opportunity',
        title: 'Repetitive refund replies could be a macro',
        finding:
            'Agents typed near-identical refund confirmations 340 times this month — a strong macro candidate.',
        impact: '1h 10m saved',
        analysis:
            'Agents sent 340 near-duplicate refund confirmations this month. A shared macro would save roughly 1h 10m/week of typing.',
        suggestions: [
            'Draft the macro',
            'Show the duplicate replies',
            'Who would use it most?',
        ],
    },
    {
        id: 5,
        priority: 'low',
        source: 'Helpdesk',
        eyebrow: 'Routing gap',
        title: 'VIP tickets are missing a priority tag',
        finding:
            'VIP customers are not being tagged on inbound, so they sit in the general queue longer than target.',
        impact: '+3% CSAT',
        analysis:
            'VIP inbound tickets are not auto-tagged, so they miss priority routing and wait ~2x longer. A rule on the VIP segment would fix it.',
        suggestions: [
            'Create the routing rule',
            'How many VIPs are affected?',
            'Show current wait times',
        ],
    },
    {
        id: 6,
        priority: 'low',
        source: 'Knowledge',
        eyebrow: 'Stale article',
        title: 'Return policy article is out of date',
        finding:
            'The public return-policy article still lists last season’s window and contradicts the current skill.',
        impact: '+2% deflection',
        analysis:
            'Your public return-policy Help Center article lists an outdated window and contradicts the AI Agent skill, confusing shoppers.',
        suggestions: [
            'Update the article',
            'Show the mismatch',
            'Sync with the skill',
        ],
    },
    {
        id: 7,
        priority: 'critical',
        source: 'Helpdesk',
        eyebrow: 'Macro error',
        title: 'Refund macro links to the wrong policy page',
        finding:
            'The most-used refund macro points to an outdated policy URL, so 96 customers got a broken link this month.',
        impact: '+5% CSAT',
        analysis:
            'Your top refund macro references a policy page that was moved, sending customers to a 404. Updating the link fixes it for every future use.',
        suggestions: [
            'Fix the macro link',
            'Show affected tickets',
            'Find other broken links',
        ],
    },
    {
        id: 8,
        priority: 'high',
        source: 'AI Agent',
        eyebrow: 'Underperforming skill',
        title: 'Subscription cancellations escalate too often',
        finding:
            'The "Manage subscription" skill hands off 41% of cancellation requests instead of completing them in-flow.',
        impact: '+8% automation',
        analysis:
            'Cancellation requests escalate at 41% because the skill lacks a confirmation step. Adding one should let the AI Agent complete most of them end-to-end.',
        suggestions: [
            'Add a confirmation step',
            'Show escalated examples',
            'Estimate the lift',
        ],
    },
    {
        id: 9,
        priority: 'low',
        source: 'Helpdesk',
        eyebrow: 'Response-time drift',
        title: 'First-reply time slips on Monday mornings',
        finding:
            'Monday 8–10am first replies run ~35% slower than your weekly average due to the weekend backlog.',
        impact: '30m saved',
        analysis:
            'Weekend tickets pile up and slow Monday-morning first replies. A scheduled Monday triage rule would smooth the backlog and recover ~30m/day.',
        suggestions: [
            'Create a Monday triage rule',
            'Show the backlog trend',
            'Who should it route to?',
        ],
    },
]

const FILTERS: ('All' | Source)[] = ['All', 'AI Agent', 'Helpdesk']

const STREAK_TOTAL = 8

// Wavy sample data for the small sparkline charts on the impact cards.
const AUTOMATION_SPARK = [14, 11, 16, 13, 18, 15, 20, 17, 22, 19, 24]
const HOURS_SPARK = [12, 15, 13, 18, 16, 14, 19, 17, 15, 20, 18]

const VIEW_STORAGE_KEY = 'gaia-opportunities-view'

export function GaiaOpportunitiesPage() {
    const [states, setStates] = useState<Record<number, ProposalState>>(
        Object.fromEntries(PROPOSALS.map((p) => [p.id, 'pending'])),
    )
    const [filter, setFilter] = useState<'All' | Source>('All')
    const [view, setView] = useState<'card' | 'list'>(
        () =>
            (sessionStorage.getItem(VIEW_STORAGE_KEY) as 'card' | 'list') ||
            'card',
    )
    const [index, setIndex] = useState(0)
    const [pickerOpen, setPickerOpen] = useState(false)
    const [impactBump, setImpactBump] = useState(false)
    // The opportunity Gaia is currently focused on — drives the contextual
    // follow-up suggestion cards in the side panel.
    const [gaiaProposal, setGaiaProposal] = useState<Proposal | null>(null)
    const { sendPrompt, newThread, abort } = useCopilot()
    const { setIsOpen: setCopilotOpen } = useCopilotPanel()

    useEffect(() => {
        sessionStorage.setItem(VIEW_STORAGE_KEY, view)
    }, [view])

    const filtered = useMemo(
        () => PROPOSALS.filter((p) => filter === 'All' || p.source === filter),
        [filter],
    )

    useEffect(() => {
        setIndex(0)
    }, [filter])

    // Open the product Gaia side panel (docks right, squeezes the main UI),
    // set the active opportunity so its follow-up cards surface, and seed a
    // prompt so Gaia proactively explains the issue instead of opening empty.
    const openGaia = (proposal?: Proposal) => {
        if (!proposal) return
        abort()
        newThread()
        setGaiaProposal(proposal)
        setCopilotOpen(true)
        sendPrompt(
            `I'm reviewing this opportunity in my dashboard: "${proposal.title}". ${proposal.analysis} Can you explain the issue and recommend how to resolve it?`,
        )
    }

    const reviewedCount = Object.values(states).filter(
        (s) => s !== 'pending',
    ).length

    const counts = {
        All: PROPOSALS.length,
        'AI Agent': PROPOSALS.filter((p) => p.source === 'AI Agent').length,
        Helpdesk: PROPOSALS.filter((p) => p.source === 'Helpdesk').length,
        Knowledge: PROPOSALS.filter((p) => p.source === 'Knowledge').length,
    }

    const current = filtered[Math.min(index, filtered.length - 1)]

    const goPrev = () => setIndex((i) => Math.max(0, i - 1))
    const goNext = () => setIndex((i) => Math.min(filtered.length - 1, i + 1))

    const review = (id: number, next: ProposalState) => {
        setStates((prev) => ({ ...prev, [id]: next }))
        if (next === 'approved') {
            setImpactBump(true)
            window.setTimeout(() => setImpactBump(false), 1500)
        }
        toast.success(
            next === 'approved'
                ? 'Opportunity approved — Gaia will roll out the change.'
                : 'Opportunity dismissed — Gaia won’t suggest it again.',
        )
        // Advance to the next unreviewed-ish card.
        if (index < filtered.length - 1) goNext()
    }

    return (
        <div className={css.page}>
            <div className={css.surface}>
                <PageHeader title="Opportunities" className={css.pageHeader}>
                    <Button
                        variant="tertiary"
                        icon="history"
                        aria-label="History"
                    />
                </PageHeader>

                <div className={css.content}>
                    <ImpactStrip
                        bump={impactBump}
                        reviewedCount={reviewedCount}
                    />

                    <div className={css.controls}>
                        <ButtonGroup
                            size="lg"
                            selectedKey={filter}
                            onSelectionChange={(key) =>
                                setFilter(key as 'All' | Source)
                            }
                        >
                            {FILTERS.map((f) => (
                                <ButtonGroupItem
                                    key={f}
                                    id={f}
                                    trailingSlot={
                                        <Quantity quantity={counts[f]} />
                                    }
                                >
                                    {f}
                                </ButtonGroupItem>
                            ))}
                        </ButtonGroup>
                        <ButtonGroup
                            size="lg"
                            selectedKey={view}
                            onSelectionChange={(key) =>
                                setView(key as 'card' | 'list')
                            }
                        >
                            <ButtonGroupItem
                                id="card"
                                icon={<Icon name="media-shuffle" size="sm" />}
                            />
                            <ButtonGroupItem
                                id="list"
                                icon={<Icon name="list-unordered" size="sm" />}
                            />
                        </ButtonGroup>
                    </div>

                    {view === 'card' ? (
                        <CardView
                            current={current}
                            onPrev={goPrev}
                            onNext={goNext}
                            canPrev={index > 0}
                            canNext={index < filtered.length - 1}
                            onApprove={() =>
                                current && review(current.id, 'approved')
                            }
                            onDismiss={() =>
                                current && review(current.id, 'dismissed')
                            }
                            onAskGaia={() => openGaia(current)}
                        />
                    ) : (
                        <ListView
                            proposals={filtered}
                            states={states}
                            onApprove={(id) => review(id, 'approved')}
                            onDismiss={(id) => review(id, 'dismissed')}
                            onAskGaia={(id) =>
                                openGaia(filtered.find((p) => p.id === id))
                            }
                        />
                    )}

                    {view === 'card' && (
                        <Footer
                            proposals={filtered}
                            states={states}
                            reviewedCount={reviewedCount}
                            total={PROPOSALS.length}
                            open={pickerOpen}
                            onToggle={() => setPickerOpen((v) => !v)}
                            onJump={(i) => {
                                setIndex(i)
                                setPickerOpen(false)
                            }}
                        />
                    )}
                </div>
            </div>

            <GaiaOpportunitySuggestions proposal={gaiaProposal} />
        </div>
    )
}

/* ---------------- Contextual Gaia follow-up cards ---------------- */

/**
 * Feeds the selected opportunity's follow-up questions into the product's
 * existing Gaia suggestion-card component. They surface after Gaia's first
 * (proactive) reply so the user can drill in with one click.
 */
function GaiaOpportunitySuggestions({
    proposal,
}: {
    proposal: Proposal | null
}) {
    useConfigureSuggestions({
        available: proposal ? 'after-first-message' : 'disabled',
        suggestions: proposal
            ? proposal.suggestions.map((question) => ({
                  title: question,
                  message: question,
              }))
            : [],
    })
    return null
}

/* ---------------- Impact strip ---------------- */

function Sparkline({ data }: { data: number[] }) {
    const chartData = data.map((value, index) => ({ index, value }))
    return (
        <div className={css.sparkline}>
            <ResponsiveContainer width="100%" height={36}>
                <AreaChart
                    data={chartData}
                    margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
                >
                    <defs>
                        <linearGradient
                            id="gaiaSparkFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="currentColor"
                                stopOpacity={0.18}
                            />
                            <stop
                                offset="100%"
                                stopColor="currentColor"
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        fill="url(#gaiaSparkFill)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

function ImpactStrip({
    bump,
    reviewedCount,
}: {
    bump: boolean
    reviewedCount: number
}) {
    const streakDone = Math.min(1 + reviewedCount, STREAK_TOTAL)
    const remaining = Math.max(0, 5 - streakDone)

    return (
        <div className={css.impact}>
            <div className={css.impactHeader}>
                <Text variant="bold" className={css.impactTitle}>
                    This week&rsquo;s impact
                </Text>
                <Text className={css.impactSubtitle}>
                    Potter ipsum wand elf parchment wingardium
                </Text>
            </div>

            <div className={css.tiles}>
                {/* Weekly review streak — segmented progress + caption */}
                <div className={css.tile}>
                    <div className={css.tileLabel}>Weekly review streak</div>
                    <div className={css.tileValue}>
                        {streakDone} of {STREAK_TOTAL}
                    </div>
                    <div className={css.progressTrack}>
                        {Array.from({ length: STREAK_TOTAL }).map(
                            (_, index) => (
                                <span
                                    key={index}
                                    className={`${css.progressSeg} ${
                                        index < streakDone
                                            ? css.progressSegOn
                                            : ''
                                    }`}
                                />
                            ),
                        )}
                    </div>
                    <div className={css.tileCaption}>
                        Review <strong>{remaining} more</strong> to unlock{' '}
                        <strong>+20 messages</strong>
                    </div>
                </div>

                {/* Increase in automation rate — sparkline */}
                <div className={css.tile}>
                    <div className={css.tileLabel}>
                        <span>Increase in automation rate</span>
                        <Icon name="info" size="xs" />
                    </div>
                    <div
                        className={`${css.tileValue} ${
                            bump ? css.tileValueFlash : ''
                        }`}
                    >
                        +2%
                    </div>
                    <Sparkline data={AUTOMATION_SPARK} />
                </div>

                {/* Hours saved by agents — sparkline */}
                <div className={css.tile}>
                    <div className={css.tileLabel}>
                        <span>Hours saved by agents</span>
                        <Icon name="info" size="xs" />
                    </div>
                    <div className={css.tileValue}>1h 20m</div>
                    <Sparkline data={HOURS_SPARK} />
                </div>
            </div>
        </div>
    )
}

/* ---------------- Card view ---------------- */

type CardViewProps = {
    current?: Proposal
    onPrev: () => void
    onNext: () => void
    canPrev: boolean
    canNext: boolean
    onApprove: () => void
    onDismiss: () => void
    onAskGaia: () => void
}

function CardView({
    current,
    onPrev,
    onNext,
    canPrev,
    canNext,
    onApprove,
    onDismiss,
    onAskGaia,
}: CardViewProps) {
    const x = useMotionValue(0)
    const approveHint = useTransform(x, [20, 140], [0, 1])
    const dismissHint = useTransform(x, [-20, -140], [0, 1])
    const rotate = useTransform(x, [-200, 200], [-6, 6])

    if (!current) {
        return (
            <div className={css.emptyState}>
                <Text className={css.impactSubtitle}>
                    No opportunities in this filter.
                </Text>
            </div>
        )
    }

    const priority = PRIORITY[current.priority]

    return (
        <div className={css.stageRow}>
            <Button
                variant="tertiary"
                aria-label="Previous"
                icon="arrow-chevron-left"
                onClick={onPrev}
                isDisabled={!canPrev}
            />

            <div className={css.stage}>
                <div className={css.cardWrap}>
                    <motion.div
                        className={css.card}
                        style={{ x, rotate }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.6}
                        onDragEnd={(_, info) => {
                            if (info.offset.x > 140) onApprove()
                            else if (info.offset.x < -140) onDismiss()
                        }}
                    >
                        <motion.span
                            className={`${css.dragHint} ${css.dragApprove}`}
                            style={{ opacity: approveHint }}
                        >
                            Approve
                        </motion.span>
                        <motion.span
                            className={`${css.dragHint} ${css.dragDismiss}`}
                            style={{ opacity: dismissHint }}
                        >
                            Dismiss
                        </motion.span>

                        <div className={css.cardTags}>
                            <Tag
                                size="sm"
                                leadingSlot={
                                    <span className={css[priority.iconClass]}>
                                        <Icon name={priority.icon} size="xs" />
                                    </span>
                                }
                            >
                                {priority.label}
                            </Tag>
                            <Tag size="sm">{current.source}</Tag>
                        </div>

                        <div className={css.cardEyebrow}>
                            {current.eyebrow.toUpperCase()}
                        </div>
                        <div className={css.cardTitle}>{current.title}</div>
                        <div className={css.cardFinding}>{current.finding}</div>

                        <div className={css.cardImpact}>
                            <Icon name="trending-up" size="xs" />
                            Estimated {current.impact}
                        </div>

                        <div className={css.cardActions}>
                            <Button
                                variant="primary"
                                size="md"
                                onClick={onApprove}
                            >
                                Approve
                            </Button>
                            <Button
                                variant="secondary"
                                size="md"
                                onClick={onDismiss}
                            >
                                Dismiss
                            </Button>
                            <Button
                                variant="tertiary"
                                size="md"
                                leadingSlot={
                                    <Icon name="chat-circle" size="sm" />
                                }
                                onClick={onAskGaia}
                            >
                                Ask Gaia
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <Button
                variant="tertiary"
                aria-label="Next"
                icon="arrow-chevron-right"
                onClick={onNext}
                isDisabled={!canNext}
            />
        </div>
    )
}

/* ---------------- List view ---------------- */

function ListView({
    proposals,
    states,
    onApprove,
    onDismiss,
    onAskGaia,
}: {
    proposals: Proposal[]
    states: Record<number, ProposalState>
    onApprove: (id: number) => void
    onDismiss: (id: number) => void
    onAskGaia: (id: number) => void
}) {
    return (
        <div className={css.list}>
            {proposals.map((p) => {
                const priority = PRIORITY[p.priority]
                const state = states[p.id] ?? 'pending'
                return (
                    <div key={p.id} className={css.listRow}>
                        <span className={css[priority.dotClass]} />
                        <div className={css.listMain}>
                            <div className={css.listTitle}>{p.title}</div>
                            <div className={css.listSubtitle}>{p.finding}</div>
                        </div>
                        <Tag size="sm">{p.source}</Tag>
                        <span className={css.listImpact}>
                            <Icon name="trending-up" size="xs" />
                            Estimated {p.impact}
                        </span>
                        {state === 'pending' ? (
                            <div className={css.listActions}>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => onApprove(p.id)}
                                >
                                    Approve
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onDismiss(p.id)}
                                >
                                    Dismiss
                                </Button>
                                <Button
                                    variant="tertiary"
                                    size="sm"
                                    leadingSlot={
                                        <Icon name="chat-circle" size="sm" />
                                    }
                                    onClick={() => onAskGaia(p.id)}
                                >
                                    Ask Gaia
                                </Button>
                            </div>
                        ) : (
                            <span className={css.listState}>{state}</span>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

/* ---------------- Footer counter + picker ---------------- */

function Footer({
    proposals,
    states,
    reviewedCount,
    total,
    open,
    onToggle,
    onJump,
}: {
    proposals: Proposal[]
    states: Record<number, ProposalState>
    reviewedCount: number
    total: number
    open: boolean
    onToggle: () => void
    onJump: (index: number) => void
}) {
    return (
        <div className={css.footer}>
            {open && (
                <div className={css.picker}>
                    {proposals.map((p, i) => {
                        const state = states[p.id] ?? 'pending'
                        const priority = PRIORITY[p.priority]
                        return (
                            <button
                                key={p.id}
                                type="button"
                                className={css.pickerItem}
                                onClick={() => onJump(i)}
                            >
                                <span
                                    className={`${css.pickerState} ${
                                        css[`pickerState_${state}`]
                                    }`}
                                />
                                <span className={css.pickerTitle}>
                                    {p.title}
                                </span>
                                <span className={css.pickerImpact}>
                                    {p.impact}
                                </span>
                                <span className={css[priority.dotClass]} />
                            </button>
                        )
                    })}
                </div>
            )}

            <button type="button" className={css.counter} onClick={onToggle}>
                {reviewedCount} of {total} reviewed
                <Icon
                    name={open ? 'arrow-chevron-down' : 'arrow-chevron-up'}
                    size="xs"
                />
            </button>
        </div>
    )
}
