import { FilterKey } from 'domains/reporting/models/stat/types'

describe('AiSalesAgentReportConfig', () => {
    describe('AI_SALES_AGENTS_OPTIONAL_FILTERS', () => {
        beforeEach(() => {
            jest.resetModules()
        })

        it('should return the correct optional filters if feature flag is enabled', () => {
            jest.doMock('pages/aiAgent/Activation/utils', () => ({
                getAiSalesAgentEmailEnabledFlag: () => true,
            }))

            const {
                AI_SALES_AGENTS_OPTIONAL_FILTERS: FiltersEnabled,
            } = require('domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentReportConfig')

            expect(FiltersEnabled).toEqual([FilterKey.Channels])
        })

        it('should return an empty array if feature flag is disabled', () => {
            jest.doMock('pages/aiAgent/Activation/utils', () => ({
                getAiSalesAgentEmailEnabledFlag: () => false,
            }))

            const {
                AI_SALES_AGENTS_OPTIONAL_FILTERS: FiltersDisabled,
            } = require('domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentReportConfig')

            expect(FiltersDisabled).toEqual([])
        })
    })
})
