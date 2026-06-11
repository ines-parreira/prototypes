import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { ReturnActionType } from 'models/selfServiceConfiguration/types'
import { useSelfServiceConfiguration } from 'pages/automate/common/hooks/useSelfServiceConfiguration'

import { useOrderManagementFlows } from './useOrderManagementFlows'

const mockHistoryPush = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockHistoryPush }),
    useLocation: () => ({
        pathname: '/app/settings/order-management/shopify/test-shop',
    }),
    useParams: () => ({ shopName: 'test-shop', shopType: 'shopify' }),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration', () => ({
    useSelfServiceConfiguration: jest.fn(),
}))

const mockedUseAiAgentAccess = useAiAgentAccess as jest.MockedFunction<
    typeof useAiAgentAccess
>
const mockedUseSelfServiceConfiguration =
    useSelfServiceConfiguration as jest.MockedFunction<
        typeof useSelfServiceConfiguration
    >

const mockHandleSelfServiceConfigurationUpdate = jest.fn()

const mockSelfServiceConfiguration = {
    id: 1,
    trackOrderPolicy: {
        enabled: true,
        unfulfilledMessage: { text: 'Tracking message', html: '' },
    },
    returnOrderPolicy: {
        enabled: false,
        eligibilities: [],
        exceptions: [],
        action: {
            type: 'automated_response' as const,
            responseMessageContent: { text: 'Return message', html: '' },
        },
    },
    cancelOrderPolicy: {
        enabled: true,
        eligibilities: [],
        exceptions: [],
        action: {
            type: 'automated_response' as const,
            responseMessageContent: { text: 'Cancel message', html: '' },
        },
    },
    reportIssuePolicy: {
        enabled: false,
        cases: [],
    },
}

describe('useOrderManagementFlows', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseAiAgentAccess.mockReturnValue({ hasAccess: true } as any)
        mockedUseSelfServiceConfiguration.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            selfServiceConfiguration: mockSelfServiceConfiguration,
            handleSelfServiceConfigurationUpdate:
                mockHandleSelfServiceConfigurationUpdate,
            storeIntegration: { id: 1 },
        } as any)
    })

    describe('loading state', () => {
        it('should return isLoading as true when fetch is pending', () => {
            mockedUseSelfServiceConfiguration.mockReturnValue({
                isFetchPending: true,
                isUpdatePending: false,
                selfServiceConfiguration: null,
                handleSelfServiceConfigurationUpdate:
                    mockHandleSelfServiceConfigurationUpdate,
                storeIntegration: null,
            } as any)

            const { result } = renderHook(() => useOrderManagementFlows())

            expect(result.current.isLoading).toBe(true)
        })

        it('should return isLoading as false when fetch is complete', () => {
            const { result } = renderHook(() => useOrderManagementFlows())

            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('flows', () => {
        it('should return empty flows when selfServiceConfiguration is null', () => {
            mockedUseSelfServiceConfiguration.mockReturnValue({
                isFetchPending: false,
                isUpdatePending: false,
                selfServiceConfiguration: null,
                handleSelfServiceConfigurationUpdate:
                    mockHandleSelfServiceConfigurationUpdate,
                storeIntegration: null,
            } as any)

            const { result } = renderHook(() => useOrderManagementFlows())

            expect(result.current.flows).toHaveLength(0)
        })

        it('should return 4 flows when configuration is loaded', () => {
            const { result } = renderHook(() => useOrderManagementFlows())

            expect(result.current.flows).toHaveLength(4)
        })

        it('should return flows in correct order', () => {
            const { result } = renderHook(() => useOrderManagementFlows())

            expect(result.current.flows.map((f) => f.key)).toEqual([
                'trackOrderPolicy',
                'returnOrderPolicy',
                'cancelOrderPolicy',
                'reportIssuePolicy',
            ])
        })

        it('should reflect the enabled state of each flow from configuration', () => {
            const { result } = renderHook(() => useOrderManagementFlows())

            const { flows } = result.current
            expect(flows[0].isEnabled).toBe(true) // trackOrderPolicy
            expect(flows[1].isEnabled).toBe(false) // returnOrderPolicy
            expect(flows[2].isEnabled).toBe(true) // cancelOrderPolicy
            expect(flows[3].isEnabled).toBe(false) // reportIssuePolicy
        })
    })

    describe('canNavigate', () => {
        it('should set canNavigate to true for track and report flows when user has access', () => {
            const { result } = renderHook(() => useOrderManagementFlows())

            const trackFlow = result.current.flows.find(
                (f) => f.key === 'trackOrderPolicy',
            )
            const reportFlow = result.current.flows.find(
                (f) => f.key === 'reportIssuePolicy',
            )

            expect(trackFlow?.canNavigate).toBe(true)
            expect(reportFlow?.canNavigate).toBe(true)
        })

        it('should set canNavigate to false for track and report flows when user has no access', () => {
            mockedUseAiAgentAccess.mockReturnValue({ hasAccess: false } as any)

            const { result } = renderHook(() => useOrderManagementFlows())

            const trackFlow = result.current.flows.find(
                (f) => f.key === 'trackOrderPolicy',
            )
            const reportFlow = result.current.flows.find(
                (f) => f.key === 'reportIssuePolicy',
            )

            expect(trackFlow?.canNavigate).toBe(false)
            expect(reportFlow?.canNavigate).toBe(false)
        })

        it('should always set canNavigate to true for return and cancel flows regardless of access', () => {
            mockedUseAiAgentAccess.mockReturnValue({ hasAccess: false } as any)

            const { result } = renderHook(() => useOrderManagementFlows())

            const returnFlow = result.current.flows.find(
                (f) => f.key === 'returnOrderPolicy',
            )
            const cancelFlow = result.current.flows.find(
                (f) => f.key === 'cancelOrderPolicy',
            )

            expect(returnFlow?.canNavigate).toBe(true)
            expect(cancelFlow?.canNavigate).toBe(true)
        })
    })

    describe('hasEmptyResponse', () => {
        it('should be false when flow is disabled', () => {
            mockedUseSelfServiceConfiguration.mockReturnValue({
                isFetchPending: false,
                isUpdatePending: false,
                selfServiceConfiguration: {
                    ...mockSelfServiceConfiguration,
                    trackOrderPolicy: {
                        enabled: false,
                        unfulfilledMessage: { text: '', html: '' },
                    },
                },
                handleSelfServiceConfigurationUpdate:
                    mockHandleSelfServiceConfigurationUpdate,
                storeIntegration: { id: 1 },
            } as any)

            const { result } = renderHook(() => useOrderManagementFlows())

            const trackFlow = result.current.flows.find(
                (f) => f.key === 'trackOrderPolicy',
            )

            expect(trackFlow?.hasEmptyResponse).toBe(false)
        })

        it('should be false when user has no access', () => {
            mockedUseAiAgentAccess.mockReturnValue({ hasAccess: false } as any)
            mockedUseSelfServiceConfiguration.mockReturnValue({
                isFetchPending: false,
                isUpdatePending: false,
                selfServiceConfiguration: {
                    ...mockSelfServiceConfiguration,
                    trackOrderPolicy: {
                        enabled: true,
                        unfulfilledMessage: { text: '', html: '' },
                    },
                },
                handleSelfServiceConfigurationUpdate:
                    mockHandleSelfServiceConfigurationUpdate,
                storeIntegration: { id: 1 },
            } as any)

            const { result } = renderHook(() => useOrderManagementFlows())

            const trackFlow = result.current.flows.find(
                (f) => f.key === 'trackOrderPolicy',
            )

            expect(trackFlow?.hasEmptyResponse).toBe(false)
        })

        it('should be true when track order is enabled and has no unfulfilled message', () => {
            mockedUseSelfServiceConfiguration.mockReturnValue({
                isFetchPending: false,
                isUpdatePending: false,
                selfServiceConfiguration: {
                    ...mockSelfServiceConfiguration,
                    trackOrderPolicy: {
                        enabled: true,
                        unfulfilledMessage: { text: '', html: '' },
                    },
                },
                handleSelfServiceConfigurationUpdate:
                    mockHandleSelfServiceConfigurationUpdate,
                storeIntegration: { id: 1 },
            } as any)

            const { result } = renderHook(() => useOrderManagementFlows())

            const trackFlow = result.current.flows.find(
                (f) => f.key === 'trackOrderPolicy',
            )

            expect(trackFlow?.hasEmptyResponse).toBe(true)
        })

        it('should be true when cancel order is enabled and has no response message', () => {
            mockedUseSelfServiceConfiguration.mockReturnValue({
                isFetchPending: false,
                isUpdatePending: false,
                selfServiceConfiguration: {
                    ...mockSelfServiceConfiguration,
                    cancelOrderPolicy: {
                        enabled: true,
                        eligibilities: [],
                        exceptions: [],
                        action: {
                            type: 'automated_response' as const,
                            responseMessageContent: { text: '', html: '' },
                        },
                    },
                },
                handleSelfServiceConfigurationUpdate:
                    mockHandleSelfServiceConfigurationUpdate,
                storeIntegration: { id: 1 },
            } as any)

            const { result } = renderHook(() => useOrderManagementFlows())

            const cancelFlow = result.current.flows.find(
                (f) => f.key === 'cancelOrderPolicy',
            )

            expect(cancelFlow?.hasEmptyResponse).toBe(true)
        })

        it('should be false for return order when action type is LoopReturns', () => {
            mockedUseSelfServiceConfiguration.mockReturnValue({
                isFetchPending: false,
                isUpdatePending: false,
                selfServiceConfiguration: {
                    ...mockSelfServiceConfiguration,
                    returnOrderPolicy: {
                        enabled: true,
                        eligibilities: [],
                        exceptions: [],
                        action: {
                            type: ReturnActionType.LoopReturns,
                            integrationId: 42,
                        },
                    },
                },
                handleSelfServiceConfigurationUpdate:
                    mockHandleSelfServiceConfigurationUpdate,
                storeIntegration: { id: 1 },
            } as any)

            const { result } = renderHook(() => useOrderManagementFlows())

            const returnFlow = result.current.flows.find(
                (f) => f.key === 'returnOrderPolicy',
            )

            expect(returnFlow?.hasEmptyResponse).toBe(false)
        })

        it('should be true for return order when enabled and has no response message', () => {
            mockedUseSelfServiceConfiguration.mockReturnValue({
                isFetchPending: false,
                isUpdatePending: false,
                selfServiceConfiguration: {
                    ...mockSelfServiceConfiguration,
                    returnOrderPolicy: {
                        enabled: true,
                        eligibilities: [],
                        exceptions: [],
                        action: {
                            type: 'automated_response' as const,
                            responseMessageContent: { text: '', html: '' },
                        },
                    },
                },
                handleSelfServiceConfigurationUpdate:
                    mockHandleSelfServiceConfigurationUpdate,
                storeIntegration: { id: 1 },
            } as any)

            const { result } = renderHook(() => useOrderManagementFlows())

            const returnFlow = result.current.flows.find(
                (f) => f.key === 'returnOrderPolicy',
            )

            expect(returnFlow?.hasEmptyResponse).toBe(true)
        })

        it('should be true for report issue when a case has a reason with no response message', () => {
            mockedUseSelfServiceConfiguration.mockReturnValue({
                isFetchPending: false,
                isUpdatePending: false,
                selfServiceConfiguration: {
                    ...mockSelfServiceConfiguration,
                    reportIssuePolicy: {
                        enabled: true,
                        cases: [
                            {
                                title: 'Damaged item',
                                description: '',
                                conditions: {},
                                newReasons: [
                                    {
                                        reasonKey: 'damaged',
                                        action: {
                                            type: 'automated_response' as const,
                                            responseMessageContent: {
                                                text: '',
                                                html: '',
                                            },
                                            showHelpfulPrompt: false,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
                handleSelfServiceConfigurationUpdate:
                    mockHandleSelfServiceConfigurationUpdate,
                storeIntegration: { id: 1 },
            } as any)

            const { result } = renderHook(() => useOrderManagementFlows())

            const reportFlow = result.current.flows.find(
                (f) => f.key === 'reportIssuePolicy',
            )

            expect(reportFlow?.hasEmptyResponse).toBe(true)
        })

        it('should be false for report issue when all cases have response messages', () => {
            mockedUseSelfServiceConfiguration.mockReturnValue({
                isFetchPending: false,
                isUpdatePending: false,
                selfServiceConfiguration: {
                    ...mockSelfServiceConfiguration,
                    reportIssuePolicy: {
                        enabled: true,
                        cases: [
                            {
                                title: 'Damaged item',
                                description: '',
                                conditions: {},
                                newReasons: [
                                    {
                                        reasonKey: 'damaged',
                                        action: {
                                            type: 'automated_response' as const,
                                            responseMessageContent: {
                                                text: 'We are sorry to hear that',
                                                html: '',
                                            },
                                            showHelpfulPrompt: false,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
                handleSelfServiceConfigurationUpdate:
                    mockHandleSelfServiceConfigurationUpdate,
                storeIntegration: { id: 1 },
            } as any)

            const { result } = renderHook(() => useOrderManagementFlows())

            const reportFlow = result.current.flows.find(
                (f) => f.key === 'reportIssuePolicy',
            )

            expect(reportFlow?.hasEmptyResponse).toBe(false)
        })
    })

    describe('handleFlowToggle', () => {
        it('should call handleSelfServiceConfigurationUpdate when toggling a flow', () => {
            const { result } = renderHook(() => useOrderManagementFlows())

            act(() => {
                result.current.handleFlowToggle('trackOrderPolicy', false)
            })

            expect(mockHandleSelfServiceConfigurationUpdate).toHaveBeenCalled()
        })
    })

    describe('navigateToFlow', () => {
        it('should push the correct path when navigating to a flow', () => {
            const { result } = renderHook(() => useOrderManagementFlows())

            act(() => {
                result.current.navigateToFlow('track')
            })

            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/settings/order-management/shopify/test-shop/track',
            )
        })

        it('should push the correct path for report-issue flow', () => {
            const { result } = renderHook(() => useOrderManagementFlows())

            act(() => {
                result.current.navigateToFlow('report-issue')
            })

            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/settings/order-management/shopify/test-shop/report-issue',
            )
        })
    })
})
