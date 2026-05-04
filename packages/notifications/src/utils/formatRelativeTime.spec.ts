import { formatRelativeTime } from './formatRelativeTime'

describe('formatRelativeTime', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('returns "just now" for less than 1 minute ago', () => {
        expect(formatRelativeTime('2024-01-01T11:59:30Z')).toBe('just now')
    })

    it('returns "just now" for 0 seconds ago', () => {
        expect(formatRelativeTime('2024-01-01T12:00:00Z')).toBe('just now')
    })

    it('returns "Xm ago" for minutes less than 60', () => {
        expect(formatRelativeTime('2024-01-01T11:59:00Z')).toBe('1m ago')
        expect(formatRelativeTime('2024-01-01T11:30:00Z')).toBe('30m ago')
        expect(formatRelativeTime('2024-01-01T11:01:00Z')).toBe('59m ago')
    })

    it('returns "Xh ago" for hours less than 24', () => {
        expect(formatRelativeTime('2024-01-01T11:00:00Z')).toBe('1h ago')
        expect(formatRelativeTime('2024-01-01T00:00:00Z')).toBe('12h ago')
        expect(formatRelativeTime('2023-12-31T13:00:00Z')).toBe('23h ago')
    })

    it('returns "Xd ago" for 24 hours or more', () => {
        expect(formatRelativeTime('2023-12-31T12:00:00Z')).toBe('1d ago')
        expect(formatRelativeTime('2023-12-25T12:00:00Z')).toBe('7d ago')
    })
})
