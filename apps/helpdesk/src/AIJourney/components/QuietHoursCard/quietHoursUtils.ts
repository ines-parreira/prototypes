import { Time } from '@internationalized/date'

type TimeInput = { hour: number; minute: number }

export function parseHHMM(value: string | null | undefined): Time | null {
    if (!value) return null
    const [h, m] = value.split(':').map(Number)
    if (isNaN(h) || isNaN(m)) return null
    return new Time(h, m)
}

export function formatHHMM(value: TimeInput | null): string | null {
    if (!value) return null
    const h = String(value.hour).padStart(2, '0')
    const m = String(value.minute).padStart(2, '0')
    return `${h}:${m}`
}
