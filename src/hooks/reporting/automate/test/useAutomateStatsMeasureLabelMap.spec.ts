import {renderHook} from '@testing-library/react-hooks'
import {AutomationBillingEventMeasure} from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import {
    FLOWS,
    QUICK_RESPONSES,
    ARTICLE_RECOMMENDATION,
} from 'pages/automate/common/components/constants'
import {useAutomateStatsMeasureLabelMap} from '../useAutomateStatsMeasureLabelMap'

// Mock useFlags from launchdarkly-react-client-sdk
jest.mock('launchdarkly-react-client-sdk')

describe('useAutomateStatsMeasureLabelMap', () => {
    it('should return the correct labels', () => {
        const {result} = renderHook(() => useAutomateStatsMeasureLabelMap())

        const labelMap = result.current

        expect(
            labelMap[
                AutomationBillingEventMeasure.AutomatedInteractionsByAIAgent
            ]
        ).toBe('AI Agent')
        expect(
            labelMap[
                AutomationBillingEventMeasure
                    .AutomatedInteractionsByQuickResponseFlows
            ]
        ).toBe(FLOWS)
        expect(
            labelMap[
                AutomationBillingEventMeasure
                    .AutomatedInteractionsByQuickResponse
            ]
        ).toBe(`${QUICK_RESPONSES} (deprecated)`)
        expect(
            labelMap[
                AutomationBillingEventMeasure
                    .AutomatedInteractionsByArticleRecommendation
            ]
        ).toBe(ARTICLE_RECOMMENDATION)
        expect(
            labelMap[
                AutomationBillingEventMeasure.AutomatedInteractionsByTrackOrder
            ]
        ).toBe('Track order')
        expect(
            labelMap[
                AutomationBillingEventMeasure.AutomatedInteractionsByLoopReturns
            ]
        ).toBe('Return order')
        expect(
            labelMap[
                AutomationBillingEventMeasure
                    .AutomatedInteractionsByAutomatedResponse
            ]
        ).toBe('Report order issue')
        expect(
            labelMap[
                AutomationBillingEventMeasure
                    .AutomatedInteractionsByAutoResponders
            ]
        ).toBe('Autoresponders')
    })
})
