import type { IconName } from '@gorgias/axiom'

// A piece of context attached to the Gaia composer — either a component the
// merchant pointed at, or an entity they @-mentioned.
export type Attachment = {
    id: string
    kind: 'pointer' | 'mention' | 'file'
    label: string
    // Structured context handed to Gaia (component fixture data / entity ref),
    // not a screenshot or free text.
    context?: Record<string, unknown>
}

// A saved workflow: a reusable "/shortcut" that teaches Gaia a specific task.
export type Workflow = {
    id: string
    shortcut: string
    description?: string
    instructions: string
}

// Seed workflows so the "Run a workflow" submenu isn't empty on first load.
export const SEED_WORKFLOWS: Workflow[] = [
    {
        id: 'wf-daily-recap',
        shortcut: '/daily-recap',
        description: 'Yesterday’s automation rate and volume',
        instructions:
            'Summarize yesterday’s automation rate and ticket volume.',
    },
    {
        id: 'wf-csat-dip',
        shortcut: '/csat-dip',
        description: 'Explain CSAT drops',
        instructions:
            'Find what drove the latest CSAT dip and which skill or intent is responsible.',
    },
    {
        id: 'wf-weekly-review',
        shortcut: '/weekly-review',
        description: 'This week vs last week',
        instructions:
            'Compare this week’s performance to last week across automation rate, cost saved and CSAT.',
    },
]

let workflowSeq = 0
export const nextWorkflowId = () => `wf-${workflowSeq++}`

export type MentionCategory = {
    id: string
    label: string
    icon: IconName
    items: { id: string; label: string; sublabel?: string }[]
}

// Mock entities for each mention category.
export const MENTION_CATEGORIES: MentionCategory[] = [
    {
        id: 'customers',
        label: 'Customers',
        icon: 'user',
        items: [
            {
                id: 'c1',
                label: 'Alma Lawson',
                sublabel: 'alma.lawson@gmail.com',
            },
            { id: 'c2', label: 'Jed Mercer', sublabel: 'jed@northwind.co' },
            { id: 'c3', label: 'Priya Shah', sublabel: 'priya@shah.studio' },
        ],
    },
    {
        id: 'knowledge',
        label: 'Knowledge',
        icon: 'book-open',
        items: [
            {
                id: 'k1',
                label: 'Return policy',
                sublabel: 'Help center article',
            },
            { id: 'k2', label: 'Shipping timelines', sublabel: 'Skill' },
            {
                id: 'k3',
                label: 'Sizing guide',
                sublabel: 'Help center article',
            },
        ],
    },
    {
        id: 'tickets',
        label: 'Tickets',
        icon: 'inbox',
        items: [
            { id: 't1', label: '#1024', sublabel: 'Refund request' },
            { id: 't2', label: '#1099', sublabel: 'Where is my order' },
            { id: 't3', label: '#1150', sublabel: 'Exchange — wrong size' },
        ],
    },
    {
        id: 'products',
        label: 'Products',
        icon: 'shopping-bag',
        items: [
            { id: 'p1', label: 'Aero Runner', sublabel: 'Footwear' },
            { id: 'p2', label: 'Cloud Hoodie', sublabel: 'Apparel' },
            { id: 'p3', label: 'Trail Vest', sublabel: 'Outerwear' },
        ],
    },
]

let attachmentSeq = 0
export const nextAttachmentId = () => `att-${attachmentSeq++}`

// ---------------------------------------------------------------------------
// Proactive workflow suggestions
//
// When a merchant repeatedly asks Gaia for the same *kind* of recurring task,
// Gaia offers to turn it into a reusable workflow. Detection is intent-based
// (keyword match), not exact text — so "What's my weekly automation rate?",
// "show automation rate", and "automation rate this week" all count together.
// ---------------------------------------------------------------------------

// How many times the same intent must be asked before Gaia suggests a workflow.
export const SUGGESTION_THRESHOLD = 3

export type WorkflowIntent = {
    id: string
    label: string
    // Any keyword match counts a message toward this intent.
    keywords: string[]
    // Pre-fill for the workflow creation form, derived from the request.
    prefill: {
        shortcut: string
        description: string
        instructions: string
    }
}

export const WORKFLOW_INTENTS: WorkflowIntent[] = [
    {
        id: 'automation-rate',
        label: 'automation rate',
        keywords: ['automation rate', 'automation'],
        prefill: {
            shortcut: '/weekly-automation-rate',
            description: 'Weekly automation rate summary',
            instructions:
                'Summarize this week’s automation rate and how it changed versus last week.',
        },
    },
    {
        id: 'csat',
        label: 'CSAT',
        keywords: ['csat', 'customer satisfaction', 'satisfaction'],
        prefill: {
            shortcut: '/weekly-csat',
            description: 'Weekly CSAT summary',
            instructions:
                'Summarize this week’s CSAT and call out any notable changes by skill or intent.',
        },
    },
    {
        id: 'savings',
        label: 'cost saved',
        keywords: ['cost saved', 'cost savings', 'hours saved', 'savings'],
        prefill: {
            shortcut: '/weekly-savings',
            description: 'Weekly savings summary',
            instructions: 'Summarize the cost and agent hours saved this week.',
        },
    },
    {
        id: 'volume',
        label: 'ticket volume',
        keywords: ['ticket volume', 'volume', 'top intents'],
        prefill: {
            shortcut: '/weekly-volume',
            description: 'Weekly ticket volume',
            instructions:
                'Summarize this week’s ticket volume and the top intents by volume.',
        },
    },
]

// Classify a message by intent (first keyword match wins). Returns null when
// the request doesn't look like a recurring, workflow-able task.
export function detectWorkflowIntent(message: string): WorkflowIntent | null {
    const text = message.toLowerCase()
    return (
        WORKFLOW_INTENTS.find((intent) =>
            intent.keywords.some((keyword) => text.includes(keyword)),
        ) ?? null
    )
}
