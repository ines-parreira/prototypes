import {
    sanitizeHtmlDefault,
    shortenRelativeDurationLabel,
    stringToDatetime,
} from '@repo/utils'

import type {
    DisplayTextValue,
    RawSearchItem,
    SearchCallRow,
    SearchCustomerRow,
    SearchRow,
    SearchTicketRow,
} from './types'

function getNestedValue(input: unknown, path: string): unknown {
    if (!input || typeof input !== 'object') {
        return undefined
    }

    return path.split('.').reduce<unknown>((value, key) => {
        if (!value || typeof value !== 'object') {
            return undefined
        }

        return (value as Record<string, unknown>)[key]
    }, input)
}

function getFirstHighlight(
    highlights: unknown,
    paths: string[],
): string | undefined {
    for (const path of paths) {
        const value = getNestedValue(highlights, path)

        if (Array.isArray(value) && typeof value[0] === 'string') {
            return value[0]
        }

        if (typeof value === 'string') {
            return value
        }
    }

    return undefined
}

function hasHighlightMarkup(value?: string) {
    return typeof value === 'string' && /<\/?(?:em|mark)>/i.test(value)
}

function createHiddenMatchDisplayText(
    text: string | null | undefined,
    highlightedHtml?: string,
) {
    if (!highlightedHtml || !hasHighlightMarkup(highlightedHtml)) {
        return undefined
    }

    return createDisplayText(text, highlightedHtml)
}

export function createDisplayText(
    text: string | null | undefined,
    highlightedHtml?: string,
): DisplayTextValue {
    const safeText = text?.trim() || ''

    return highlightedHtml && hasHighlightMarkup(highlightedHtml)
        ? {
              text: safeText,
              highlightedHtml: sanitizeHtmlDefault(highlightedHtml),
          }
        : {
              text: safeText,
          }
}

function formatShortenedRelativeLabel(value: string) {
    return value.replace(/^(\d+)([a-z]+)$/i, '$1 $2')
}

function formatRelativeActivity(datetime?: string | null, includeBy = true) {
    const parsed = datetime ? stringToDatetime(datetime) : null

    if (!parsed) {
        return ''
    }

    const shortened = shortenRelativeDurationLabel(parsed.fromNow())

    if (!shortened) {
        return ''
    }

    const formatted = formatShortenedRelativeLabel(shortened)

    if (formatted === 'now') {
        return includeBy ? 'now by' : 'now'
    }

    return includeBy ? `${formatted} ago by` : `${formatted} ago`
}

function toNumber(value: unknown) {
    return typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number.parseInt(value, 10) || 0
          : 0
}

function getCustomerPhone(raw: RawSearchItem) {
    const channels = Array.isArray(raw.channels) ? raw.channels : []
    const phoneChannel = channels.find((channel) => {
        if (!channel || typeof channel !== 'object') {
            return false
        }

        const type = (channel as Record<string, unknown>).type
        const address = (channel as Record<string, unknown>).address

        return (
            type === 'phone' ||
            type === 'voice' ||
            (typeof address === 'string' && !address.includes('@'))
        )
    }) as Record<string, unknown> | undefined

    return (
        (typeof raw.phone === 'string' && raw.phone) ||
        (typeof raw.phone_number === 'string' && raw.phone_number) ||
        (typeof phoneChannel?.address === 'string' && phoneChannel.address) ||
        ''
    )
}

function getCustomerEmail(raw: RawSearchItem) {
    const channels = Array.isArray(raw.channels) ? raw.channels : []
    const emailChannel = channels.find((channel) => {
        if (!channel || typeof channel !== 'object') {
            return false
        }

        const type = (channel as Record<string, unknown>).type
        const address = (channel as Record<string, unknown>).address

        return type === 'email' || typeof address === 'string'
            ? typeof address === 'string' && address.includes('@')
            : false
    }) as Record<string, unknown> | undefined

    return (
        (typeof raw.email === 'string' && raw.email) ||
        (typeof emailChannel?.address === 'string' && emailChannel.address) ||
        ''
    )
}

function getCustomerDisplayName(raw: RawSearchItem) {
    const fullName = [raw.firstname, raw.lastname]
        .filter(
            (value): value is string =>
                typeof value === 'string' && Boolean(value.trim()),
        )
        .join(' ')

    return (
        (typeof raw.name === 'string' && raw.name.trim()) ||
        fullName ||
        (typeof raw.email === 'string' && raw.email.trim()) ||
        `Customer #${raw.id}`
    )
}

function getTicketCustomerDisplayName(raw: RawSearchItem) {
    const customer = raw.customer

    if (!customer || typeof customer !== 'object') {
        return ''
    }

    const normalized = customer as Record<string, unknown>

    return (
        (typeof normalized.name === 'string' && normalized.name.trim()) ||
        (typeof normalized.email === 'string' && normalized.email.trim()) ||
        (typeof normalized.id === 'number' ? `Customer #${normalized.id}` : '')
    )
}

function titleCase(value?: string | null) {
    if (!value) {
        return ''
    }

    return value
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getCallStatus(raw: RawSearchItem) {
    const value = String(
        raw.display_status ?? raw.termination_status ?? raw.status ?? '',
    ).toLowerCase()

    if (value.includes('answered') || value.includes('completed')) {
        return {
            label: 'Answered',
            color: 'green' as const,
        }
    }

    if (value.includes('abandoned')) {
        return {
            label: 'Abandoned',
            color: 'red' as const,
        }
    }

    if (value.includes('missed') || value.includes('unanswered')) {
        return {
            label: 'Missed',
            color: 'orange' as const,
        }
    }

    return {
        label: titleCase(value),
        color: 'grey' as const,
    }
}

function getCallIcon(raw: RawSearchItem): SearchCallRow['callIcon'] {
    const status = String(
        raw.display_status ?? raw.termination_status ?? raw.status ?? '',
    ).toLowerCase()

    if (status.includes('missed') || status.includes('abandoned')) {
        return 'phone-missed'
    }

    return raw.direction === 'outbound' ? 'phone-outgoing' : 'phone-incoming'
}

function getCallCustomerPhone(raw: RawSearchItem) {
    if (raw.direction === 'outbound') {
        return (
            (typeof raw.phone_number_destination === 'string' &&
                raw.phone_number_destination) ||
            ''
        )
    }

    return (
        (typeof raw.phone_number_source === 'string' &&
            raw.phone_number_source) ||
        ''
    )
}

function getCallTitle(raw: RawSearchItem) {
    if (typeof raw.title === 'string' && raw.title) {
        return raw.title
    }

    if (raw.direction === 'outbound') {
        return 'Outgoing call'
    }

    return 'Incoming call'
}

function getAgent(raw: RawSearchItem) {
    const agent = raw.assignee_user ?? null

    if (!agent || typeof agent !== 'object') {
        return {
            name: '',
            avatarUrl: undefined,
        }
    }

    const normalized = agent as Record<string, any>

    return {
        name:
            normalized.name ??
            [normalized.firstname, normalized.lastname]
                .filter(Boolean)
                .join(' ') ??
            normalized.email ??
            '',
        avatarUrl: normalized.meta?.profile_picture_url,
    }
}

export function getRowUrl(row: SearchRow) {
    return row.url
}

export function toCustomerRow(raw: RawSearchItem): SearchCustomerRow | null {
    if (typeof raw.id !== 'number') {
        return null
    }

    const highlights = raw.highlights

    return {
        kind: 'customer',
        id: raw.id,
        raw,
        url: `/app/customer/${raw.id}`,
        name: createDisplayText(
            getCustomerDisplayName(raw),
            getFirstHighlight(highlights, ['name']),
        ),
        email: createDisplayText(
            getCustomerEmail(raw),
            getFirstHighlight(highlights, ['email', 'channels.address']),
        ),
        phone: createDisplayText(
            getCustomerPhone(raw),
            getFirstHighlight(highlights, [
                'phone',
                'phone_number',
                'channels.address',
            ]),
        ),
    }
}

export function toTicketRow(raw: RawSearchItem): SearchTicketRow | null {
    if (typeof raw.id !== 'number') {
        return null
    }

    const agent = getAgent(raw)
    const statusLabel = titleCase(raw.status)

    return {
        kind: 'ticket',
        id: raw.id,
        raw,
        url: `/app/ticket/${raw.id}`,
        subject: createDisplayText(
            raw.subject,
            getFirstHighlight(raw.highlights, ['subject']),
        ),
        hiddenMatch: createHiddenMatchDisplayText(
            raw.excerpt,
            getFirstHighlight(raw.highlights, ['messages.body', 'excerpt']),
        ),
        customerName: createDisplayText(
            getTicketCustomerDisplayName(raw),
            getFirstHighlight(raw.highlights, [
                'messages.from.name',
                'messages.from.address',
                'messages.to.name',
                'messages.to.address',
                'customer.name',
                'customer.email',
            ]),
        ),
        statusLabel,
        statusColor: statusLabel === 'Closed' ? 'grey' : 'purple',
        isUnread: Boolean(raw.is_unread),
        activityLabel: formatRelativeActivity(
            raw.updated_datetime ??
                raw.last_message_datetime ??
                raw.created_datetime,
            Boolean(agent.name.trim()),
        ),
        agentName: agent.name,
        agentAvatarUrl: agent.avatarUrl,
    }
}

export function toCallRow(raw: RawSearchItem): SearchCallRow | null {
    if (typeof raw.id !== 'number') {
        return null
    }

    const status = getCallStatus(raw)

    return {
        kind: 'call',
        id: raw.id,
        raw,
        url:
            typeof raw.ticket_id === 'number'
                ? `/app/ticket/${raw.ticket_id}?call_id=${raw.id}`
                : undefined,
        title: createDisplayText(
            getCallTitle(raw),
            getFirstHighlight(raw.highlights, [
                'title',
                'phone_number_source',
                'phone_number_destination',
            ]),
        ),
        hiddenMatch: createHiddenMatchDisplayText(
            raw.transcript ?? raw.excerpt,
            getFirstHighlight(raw.highlights, ['transcripts']),
        ),
        customerPhone: createDisplayText(
            getCallCustomerPhone(raw),
            getFirstHighlight(raw.highlights, [
                'phone_number_source',
                'phone_number_destination',
            ]),
        ),
        statusLabel: status.label,
        statusColor: status.color,
        callIcon: getCallIcon(raw),
        activityLabel: formatRelativeActivity(
            raw.updated_datetime ??
                raw.started_datetime ??
                raw.created_datetime,
            false,
        ),
    }
}

export function toTotalCount(
    response: Record<string, any> | undefined,
    fallbackCount: number,
) {
    return toNumber(
        response?.meta?.total_resources ??
            response?.meta?.totalResources ??
            response?.meta?.count ??
            fallbackCount,
    )
}

export function toNextCursor(response: Record<string, any> | undefined) {
    const nextCursor =
        response?.meta?.next_cursor ??
        response?.meta?.nextCursor ??
        response?.meta?.next_items ??
        response?.meta?.nextItems

    if (typeof nextCursor !== 'string' || !nextCursor) {
        return undefined
    }

    if (nextCursor.startsWith('/') || nextCursor.includes('://')) {
        try {
            return (
                new URL(nextCursor, 'https://app.gorgias.com').searchParams.get(
                    'cursor',
                ) ?? nextCursor
            )
        } catch {
            return nextCursor
        }
    }

    return nextCursor
}

export function extractResponseData(candidate: unknown) {
    if (!candidate || typeof candidate !== 'object') {
        return undefined
    }

    if ('meta' in candidate && 'data' in candidate) {
        return candidate as Record<string, any>
    }

    if (
        'data' in candidate &&
        candidate.data &&
        typeof candidate.data === 'object' &&
        'meta' in candidate.data &&
        'data' in candidate.data
    ) {
        return candidate.data as Record<string, any>
    }

    return undefined
}
