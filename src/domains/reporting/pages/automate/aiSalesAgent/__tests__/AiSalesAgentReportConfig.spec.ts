import { FilterKey } from 'domains/reporting/models/stat/types'

describe('AiSalesAgentReportConfig', () => {
    describe('AI_SALES_AGENTS_OPTIONAL_FILTERS', () => {
        beforeEach(() => {
            jest.resetModules()
        })

        it('should return channels in the optional fields', () => {
            const {
                AiSalesAgentReportConfig,
            } = require('../AiSalesAgentReportConfig')

            expect(AiSalesAgentReportConfig.reportFilters.optional).toContain(
                FilterKey.Channels,
            )
        })
    })
})
