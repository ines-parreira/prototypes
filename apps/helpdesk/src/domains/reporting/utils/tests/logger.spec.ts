import { reportQueryMismatch } from 'domains/reporting/utils/logger'
import { logger } from 'utils/datadog'

jest.mock('utils/datadog', () => ({
    logger: {
        warn: jest.fn(),
    },
}))

describe('reportQueryMismatch', () => {
    it('should log warning with correct parameters', () => {
        const metric = 'test-metric'
        const diff = 'test-diff'

        reportQueryMismatch(metric, diff)

        expect(logger.warn).toHaveBeenCalledWith('Query mismatch', {
            metric,
            diff,
            timestamp: expect.any(String),
        })
    })
})
