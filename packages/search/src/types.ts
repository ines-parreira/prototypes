export type SearchSection = 'all' | 'customers' | 'tickets' | 'calls'
export type SearchRowKind = 'customer' | 'ticket' | 'call'

export type DisplayTextValue = {
    text: string
    highlightedHtml?: string
}

export type RawSearchItem = Record<string, any> & {
    id: number
}

export type SearchCustomerRow = {
    kind: 'customer'
    id: number
    raw: RawSearchItem
    url: string
    name: DisplayTextValue
    email: DisplayTextValue
    phone: DisplayTextValue
}

export type SearchTicketRow = {
    kind: 'ticket'
    id: number
    raw: RawSearchItem
    url: string
    subject: DisplayTextValue
    hiddenMatch?: DisplayTextValue
    customerName: DisplayTextValue
    statusLabel: string
    statusColor: 'purple' | 'grey'
    isUnread: boolean
    activityLabel: string
    agentName: string
    agentAvatarUrl?: string
}

export type SearchCallRow = {
    kind: 'call'
    id: number
    raw: RawSearchItem
    url?: string
    title: DisplayTextValue
    hiddenMatch?: DisplayTextValue
    customerPhone: DisplayTextValue
    statusLabel: string
    statusColor: 'green' | 'red' | 'orange' | 'grey'
    callIcon: 'phone-incoming' | 'phone-outgoing' | 'phone-missed'
    activityLabel: string
}

export type SearchRow = SearchCustomerRow | SearchTicketRow | SearchCallRow

export type SearchSectionSummary = {
    id: Exclude<SearchSection, 'all'>
    title: string
    recentTitle: string
    rows: SearchRow[]
    totalCount: number
    emptyMessage: string
}
