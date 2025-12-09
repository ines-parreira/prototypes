import { parseAbsolute } from '@internationalized/date'
import type { ZonedDateTime } from '@internationalized/date'
import type { Moment } from 'moment-timezone'
import moment from 'moment-timezone'

import type { DatePickerPreset } from '@gorgias/axiom'

export function momentToZonedDateTime(m: Moment | null): ZonedDateTime | null {
    if (!m) return null

    const isoString = m.toISOString()
    return parseAbsolute(isoString, 'UTC')
}

export function zonedDateTimeToMoment(
    zdt: ZonedDateTime | null,
): Moment | null {
    if (!zdt) return null

    return moment(zdt.toDate())
}

export function createRangeValueFromMoments(
    start: Moment | null,
    end: Moment | null,
): { start: ZonedDateTime; end: ZonedDateTime } | null {
    if (!start || !end) return null

    const startZdt = momentToZonedDateTime(start)
    const endZdt = momentToZonedDateTime(end)

    if (!startZdt || !endZdt) return null

    return {
        start: startZdt,
        end: endZdt,
    }
}

export function extractMomentsFromRange(
    value: {
        start: ZonedDateTime
        end: ZonedDateTime
    } | null,
): { start: Moment | null; end: Moment | null } {
    if (!value) return { start: null, end: null }

    return {
        start: zonedDateTimeToMoment(value.start),
        end: zonedDateTimeToMoment(value.end),
    }
}

export function getKnowledgeHubDatePresets(): DatePickerPreset[] {
    return [
        {
            id: 'today',
            label: 'Today',
            duration: { days: 0 },
        },
        {
            id: 'last-7-days',
            label: 'Last 7 days',
            duration: { days: -7 },
        },
        {
            id: 'last-30-days',
            label: 'Last 30 days',
            duration: { days: -30 },
        },
        {
            id: 'last-60-days',
            label: 'Last 60 days',
            duration: { days: -60 },
        },
        {
            id: 'last-90-days',
            label: 'Last 90 days',
            duration: { days: -90 },
        },
    ]
}
