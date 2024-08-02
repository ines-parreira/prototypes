import {renderHook} from '@testing-library/react-hooks'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
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
    it('should return the correct labels when SunsetQuickResponses flag is true', () => {
        // Mock the useFlags hook to return true for the SunsetQuickResponses feature flag
        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.SunsetQuickResponses]: true,
        })

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

    it('should return the correct labels when SunsetQuickResponses flag is false', () => {
        // Mock the useFlags hook to return false for the SunsetQuickResponses feature flag
        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.SunsetQuickResponses]: false,
        })

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
        ).toBe(QUICK_RESPONSES)
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
