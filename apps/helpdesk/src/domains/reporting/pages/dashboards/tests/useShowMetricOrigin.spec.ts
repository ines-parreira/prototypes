import { getShowMetricOriginValue } from 'domains/reporting/pages/dashboards/useShowMetricOrigin'

const DASHBOARD_ID = 42
const STORAGE_KEY = `show-metric-origin-dashboard-${DASHBOARD_ID}`

afterEach(() => {
    localStorage.clear()
})

describe('getShowMetricOriginValue', () => {
    it('returns false by default when nothing is stored', () => {
        expect(getShowMetricOriginValue(DASHBOARD_ID)).toBe(false)
    })

    it('returns the provided defaultValue when nothing is stored', () => {
        expect(getShowMetricOriginValue(DASHBOARD_ID, true)).toBe(true)
    })

    it('returns true when true is stored in localStorage', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(true))

        expect(getShowMetricOriginValue(DASHBOARD_ID)).toBe(true)
    })

    it('returns false when false is stored in localStorage', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(false))

        expect(getShowMetricOriginValue(DASHBOARD_ID, true)).toBe(false)
    })

    it('returns defaultValue when localStorage contains invalid JSON', () => {
        localStorage.setItem(STORAGE_KEY, 'not-valid-json{')

        expect(getShowMetricOriginValue(DASHBOARD_ID)).toBe(false)
        expect(getShowMetricOriginValue(DASHBOARD_ID, true)).toBe(true)
    })

    it('uses separate storage keys per dashboard id', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(true))

        expect(getShowMetricOriginValue(99)).toBe(false)
    })
})
