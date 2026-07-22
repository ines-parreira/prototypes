// Shared folder data for the Gaia Folders feature: the sidebar Folders list,
// the "Move to a folder" chat menu, and the dedicated folder page all read
// from here so a single folder id drives everything.

export type FolderChatGroup = 'Today' | 'Yesterday' | 'Last week' | 'Last month'

export type FolderChat = {
    id: string
    title: string
    summary: string
    time: string
    group: FolderChatGroup
}

export type FolderSource = {
    id: string
    name: string
    kind: string
}

export type GaiaFolder = {
    id: string
    name: string
    description?: string
    chats: FolderChat[]
    sources: FolderSource[]
    members: string[]
}

export const GAIA_FOLDERS: GaiaFolder[] = [
    {
        id: 'knowledge',
        name: 'Knowledge',
        description: 'Knowledge creation and optimization',
        chats: [
            {
                id: 'k1',
                title: 'Return policy article has gaps',
                summary: "Refund questions the help center doesn't answer yet.",
                time: 'Just now',
                group: 'Today',
            },
            {
                id: 'k2',
                title: 'Sizing guide coverage',
                summary: 'Which sizing questions escalate most often.',
                time: '1h ago',
                group: 'Today',
            },
            {
                id: 'k3',
                title: 'Shipping timelines by region',
                summary: 'Drafted region-specific shipping guidance.',
                time: 'Monday',
                group: 'Yesterday',
            },
            {
                id: 'k4',
                title: 'Warranty terms review',
                summary: 'Clarified the warranty window across skills.',
                time: 'Monday',
                group: 'Yesterday',
            },
        ],
        sources: [],
        members: [],
    },
    {
        id: 'reporting',
        name: 'Reporting',
        description: 'Weekly reporting, dashboards, and KPI reviews.',
        chats: [
            {
                id: 'r1',
                title: 'Weekly automation rate',
                summary: 'This week vs last week across channels.',
                time: '2h ago',
                group: 'Today',
            },
            {
                id: 'r2',
                title: 'Cost saved breakdown',
                summary: 'Where the savings came from this month.',
                time: 'Sunday',
                group: 'Last week',
            },
            {
                id: 'r3',
                title: 'CSAT trend after May update',
                summary: 'Compared CSAT before and after the change.',
                time: 'May 28',
                group: 'Last month',
            },
        ],
        sources: [
            { id: 's1', name: 'Q2-performance.pdf', kind: 'PDF' },
            { id: 's2', name: 'kpi-definitions.docx', kind: 'DOCX' },
        ],
        members: ['Jane Cooper', 'Cody Fisher'],
    },
]

export const GROUP_ORDER: FolderChatGroup[] = [
    'Today',
    'Yesterday',
    'Last week',
    'Last month',
]

export const getFolder = (id?: string): GaiaFolder | undefined =>
    GAIA_FOLDERS.find((folder) => folder.id === id)
