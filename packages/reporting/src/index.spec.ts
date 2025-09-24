import * as moduleExports from './index'

describe('@repo/reporting exports', () => {
    it('should export all expected components, functions and constants', () => {
        // Test components
        expect(moduleExports.TrendIcon).toBeDefined()
        expect(moduleExports.TrendBadge).toBeDefined()

        // Test formatting functions
        expect(moduleExports.formatMetricTrend).toBeDefined()
        expect(moduleExports.formatDuration).toBeDefined()
        expect(moduleExports.formatMetricValue).toBeDefined()

        // Test constants
        expect(moduleExports.NOT_AVAILABLE_PLACEHOLDER).toBeDefined()
        expect(moduleExports.NOT_AVAILABLE_TEXT).toBeDefined()
        expect(moduleExports.DEFAULT_LOCALE).toBeDefined()
    })
})
