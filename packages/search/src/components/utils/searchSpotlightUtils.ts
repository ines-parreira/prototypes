import { SEARCH_GROUP_LIMIT } from '../../constants'
import type {
    DisplayTextValue,
    RawSearchItem,
    SearchCallRow,
    SearchCustomerRow,
    SearchRow,
    SearchSection,
    SearchTicketRow,
} from '../../types'

export function hasDisplayTextValue(value: {
    text: string
    highlightedHtml?: string
}) {
    return Boolean(value.highlightedHtml || value.text.trim())
}

export function hasTextValue(value: string) {
    return Boolean(value.trim())
}

export function stripDisplayTextHighlight(
    value: DisplayTextValue,
): DisplayTextValue {
    return {
        text: value.text,
    }
}

export function stripRowHighlights(row: SearchRow): SearchRow {
    switch (row.kind) {
        case 'customer':
            return {
                ...row,
                name: stripDisplayTextHighlight(row.name),
                email: stripDisplayTextHighlight(row.email),
                phone: stripDisplayTextHighlight(row.phone),
            }
        case 'ticket':
            return {
                ...row,
                subject: stripDisplayTextHighlight(row.subject),
                customerName: stripDisplayTextHighlight(row.customerName),
                hiddenMatch: undefined,
            }
        case 'call':
            return {
                ...row,
                title: stripDisplayTextHighlight(row.title),
                customerPhone: stripDisplayTextHighlight(row.customerPhone),
                hiddenMatch: undefined,
            }
    }
}

export function getRowHiddenMatch(row: SearchRow) {
    return row.kind === 'customer' ? undefined : row.hiddenMatch
}

export function getAvailableSections(showCalls: boolean): SearchSection[] {
    return showCalls
        ? ['all', 'customers', 'tickets', 'calls']
        : ['all', 'customers', 'tickets']
}

export function getRowsForSection(rows: SearchRow[], isAllSection: boolean) {
    return isAllSection ? rows.slice(0, SEARCH_GROUP_LIMIT) : rows
}

export function getSectionTitle(
    section: Exclude<SearchSection, 'all'>,
    isSearchMode: boolean,
): string {
    if (isSearchMode) {
        switch (section) {
            case 'customers':
                return 'Customers'
            case 'tickets':
                return 'Tickets'
            case 'calls':
                return 'Calls'
        }
    }

    switch (section) {
        case 'customers':
            return 'Recently accessed customers'
        case 'tickets':
            return 'Recently accessed tickets'
        case 'calls':
            return 'Recently accessed calls'
    }
}

export function toRecentRows<T extends RawSearchItem>(
    items: T[],
    mapper: (item: T) => SearchRow | null,
) {
    return items.map(mapper).filter((item): item is SearchRow => item !== null)
}

export function isCustomerRow(row: SearchRow): row is SearchCustomerRow {
    return row.kind === 'customer'
}

export function isTicketRow(row: SearchRow): row is SearchTicketRow {
    return row.kind === 'ticket'
}

export function isCallRow(row: SearchRow): row is SearchCallRow {
    return row.kind === 'call'
}
