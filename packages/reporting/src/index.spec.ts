import * as moduleExports from './index'

describe('@repo/reporting exports', () => {
    it('should export all expected components, functions and constants', () => {
        // Test components
        expect(moduleExports.TrendIcon).toBeDefined()
    })
})
