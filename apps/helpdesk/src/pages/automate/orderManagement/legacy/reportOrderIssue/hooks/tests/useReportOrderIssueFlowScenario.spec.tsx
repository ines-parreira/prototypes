import { renderHook } from '@repo/testing'

import { selfServiceConfiguration1 } from 'fixtures/self_service_configurations'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'

import useReportOrderIssueFlowScenario from '../useReportOrderIssueFlowScenario'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')
jest.mock('hooks/useAppDispatch')

describe('useSelfServiceConfiguration', () => {
    beforeEach(() => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                articleRecommendationHelpCenterId: 1,
                reportIssuePolicy: {
                    cases: [
                        {
                            title: 'Order not received',
                            conditions: {},
                            description: 'order not received',
                            newReasons: [
                                {
                                    reasonKey: 'order_not_received',
                                    action: {
                                        showHelpfulPrompt: true,
                                        type: 'automated_response',
                                        responseMessageContent: {
                                            html: 'Order not received',
                                            text: 'Order not received',
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                    enabled: true,
                },
            },
            storeIntegration: null,
            isFetchPending: false,
        })
    })
    it('should return a scenario', () => {
        const { result } = renderHook(() =>
            useReportOrderIssueFlowScenario('shop-name', 0),
        )

        expect(result.current.scenario).toMatchObject({
            conditions: {},
            description: 'order not received',
            newReasons: [
                {
                    action: {
                        responseMessageContent: {
                            html: '<div>Order not received</div>',
                            text: 'Order not received',
                        },
                        showHelpfulPrompt: true,
                        type: 'automated_response',
                    },
                    reasonKey: 'order_not_received',
                },
            ],
            title: 'Order not received',
        })
    })
})
