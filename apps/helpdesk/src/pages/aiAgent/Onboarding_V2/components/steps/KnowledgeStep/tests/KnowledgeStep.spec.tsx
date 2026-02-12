import { useFlag } from '@repo/feature-flags'
import { useLocalStorage } from '@repo/hooks'
import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { shopifyIntegration } from 'fixtures/integrations'
import useAppDispatch from 'hooks/useAppDispatch'
import * as hooks from 'hooks/useAppSelector'
import {
    useGetStoresConfigurationForAccount,
    useStartSalesTrialMutation,
} from 'models/aiAgent/queries'
import type { OnboardingNotificationState } from 'models/aiAgent/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { useOnboardingNotificationState } from 'pages/aiAgent/hooks/useOnboardingNotificationState'
import { KnowledgeStep } from 'pages/aiAgent/Onboarding_V2/components/steps/KnowledgeStep/KnowledgeStep'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'
import type { StepProps } from 'pages/aiAgent/Onboarding_V2/components/steps/types'
import { useAiAgentScopesForAutomationPlan } from 'pages/aiAgent/Onboarding_V2/hooks/useAiAgentScopesForAutomationPlan'
import { useGetHelpCentersByShopName } from 'pages/aiAgent/Onboarding_V2/hooks/useGetHelpCentersByShopName'
import { useGetKnowledgePreviewData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetKnowledgePreviewData'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'
import { useTopLocations } from 'pages/aiAgent/Onboarding_V2/hooks/useTopLocations'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding_V2/hooks/useUpdateOnboarding'
import {
    AiAgentScopes,
    WizardStepEnum,
} from 'pages/aiAgent/Onboarding_V2/types'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { notify } from 'state/notifications/actions'
import { renderWithRouter } from 'utils/testing'

jest.mock('react-chartjs-2', () => ({
    Line: () => (
        <>
            <canvas id="lineChartTooltip" />
            <div id="lineChartTooltip" />
        </>
    ),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useOnboardingNotificationState', () => ({
    useOnboardingNotificationState: jest.fn(),
}))
const mockUseOnboardingNotificationState = jest.mocked(
    useOnboardingNotificationState,
)

jest.mock(
    'pages/aiAgent/Onboarding_V2/hooks/useGetHelpCentersByShopName',
    () => ({
        useGetHelpCentersByShopName: jest
            .fn()
            .mockReturnValue({ isHelpCenterLoading: false, helpCenters: [] }),
    }),
)
jest.spyOn(hooks, 'default').mockReturnValue(fromJS(shopifyIntegration))

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData', () => ({
    useGetOnboardingData: jest.fn(),
}))

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useUpdateOnboarding', () => ({
    useUpdateOnboarding: jest.fn(),
}))

jest.mock('pages/settings/contactForm/hooks/useEmailIntegrations')

jest.mock(
    'pages/aiAgent/Onboarding_V2/hooks/useGetKnowledgePreviewData',
    () => ({
        useGetKnowledgePreviewData: jest.fn(),
    }),
)

jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
jest.mock('@repo/hooks')
jest.mock('models/aiAgent/queries', () => ({
    ...jest.requireActual('models/aiAgent/queries'),
    useStartSalesTrialMutation: jest.fn(),
    useGetStoresConfigurationForAccount: jest.fn(),
}))
jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')

const useGetHelpCentersByShopNameMock = assumeMock(useGetHelpCentersByShopName)
const mockUseEmailIntegrations = useEmailIntegrations as jest.Mock

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useTopLocations')

const mockUseTopLocations = assumeMock(useTopLocations)

const mockUseGetOnboardingData = useGetOnboardingData as jest.Mock
const mockUseUpdateOnboarding = useUpdateOnboarding as jest.Mock
const mockUseGetKnowledgePreviewData = useGetKnowledgePreviewData as jest.Mock
const mockUseFlag = useFlag as jest.Mock
const mockUseTrialAccess = useTrialAccess as jest.Mock
const mockUseLocalStorage = useLocalStorage as jest.Mock
const mockUseStartSalesTrialMutation = useStartSalesTrialMutation as jest.Mock
const mockUseGetStoresConfigurationForAccount =
    useGetStoresConfigurationForAccount as jest.Mock
const mockUseAppDispatch = useAppDispatch as jest.Mock
const mockNotify = notify as jest.Mock

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useAiAgentScopesForAutomationPlan')
const useAiAgentScopesForAutomationPlanMock = assumeMock(
    useAiAgentScopesForAutomationPlan,
)

const defaultProps: StepProps = {
    currentStep: 4,
    totalSteps: 4,
    goToStep: jest.fn(),
}

const testQueryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

const renderWithProvider = (props = defaultProps) => {
    const history = createMemoryHistory({
        initialEntries: [
            `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/knowledge`,
        ],
    })

    const result = renderWithRouter(
        <Provider store={configureMockStore()()}>
            <QueryClientProvider client={testQueryClient}>
                <KnowledgeStep {...props} />
            </QueryClientProvider>
        </Provider>,
        {
            history,
            path: '/app/ai-agent/:shopType/:shopName/onboarding/:step',
            route: `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/knowledge`,
        },
    )

    return {
        ...result,
        history,
    }
}

describe('KnowledgeStep', () => {
    const user = userEvent.setup({
        advanceTimers: jest.advanceTimersByTime,
    })
    const mockDispatch = jest.fn()
    const mockRemoveShoppingAssistantTrialOptin = jest.fn()
    const mockStartSalesTrialMutateAsync = jest
        .fn()
        .mockResolvedValue(undefined)

    beforeEach(() => {
        testQueryClient.clear()
        jest.clearAllMocks()

        useGetHelpCentersByShopNameMock.mockReturnValue({
            isHelpCenterLoading: false,
            helpCenters: [],
        })
        mockUseGetOnboardingData.mockReturnValue({
            data: {
                id: 1,
                salesPersuasionLevel: PersuasionLevel.Moderate,
                salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                salesDiscountMax: 0.8,
                scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
                shopName: shopifyIntegration.meta.shop_name,
            },
        })

        mockUseOnboardingNotificationState.mockReturnValue({
            isLoading: false,
            onboardingNotificationState: {
                scrapingProcessingFinishedDatetime: '2025-05-21T12:00:00.000Z',
            } as OnboardingNotificationState,
        })

        mockUseUpdateOnboarding.mockReturnValue({
            mutate: (_data: any, { onSuccess }: any) => {
                Promise.resolve(onSuccess()).then(() => {})
            },
            isLoading: false,
        })

        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: true,
            defaultIntegration: true,
        })

        mockUseTopLocations.mockReturnValue({
            data: [],
            isLoading: false,
        })

        mockUseGetKnowledgePreviewData.mockReturnValue({
            data: {
                experienceScore: 50,
                categories: [],
                averageDiscount: 10,
                repeatRate: 25,
                averageOrders: [],
                averageOrderValue: 100,
                isAverageOrderValueLoading: false,
                isRepeatRateLoading: false,
                topProducts: [],
                isTopProductsLoading: false,
            },
        })

        mockUseFlag.mockReturnValue(false)

        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockNotify.mockReturnValue({ type: 'NOTIFY', payload: {} })

        mockUseTrialAccess.mockReturnValue({
            trialType: TrialType.ShoppingAssistant,
            hasCurrentStoreTrialStarted: false,
            hasAnyTrialStarted: false,
            canSeeTrialCTA: false,
            isLoading: false,
        })

        mockUseLocalStorage.mockReturnValue([
            false, // shoppingAssistantTrialOptin
            jest.fn(), // setter (not used)
            mockRemoveShoppingAssistantTrialOptin, // remove function
        ])

        mockUseStartSalesTrialMutation.mockReturnValue({
            mutateAsync: mockStartSalesTrialMutateAsync,
            mutate: jest.fn(),
            data: undefined,
            error: null,
            isLoading: false,
            isError: false,
            isSuccess: false,
        })

        mockUseGetStoresConfigurationForAccount.mockReturnValue({
            isLoading: false,
            data: {
                storeConfigurations: [],
            },
            error: null,
            isFetched: true,
        })

        useAiAgentScopesForAutomationPlanMock.mockReturnValue([
            AiAgentScopes.SUPPORT,
            AiAgentScopes.SALES,
        ])

        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('renders the component with main title', () => {
        renderWithProvider()

        jest.runAllTimers()

        expect(
            screen.getByRole('heading', {
                name: /AI Agent is syncing your knowledge sources/i,
            }),
        ).toBeInTheDocument()
    })

    it('renders description with correct text', () => {
        renderWithProvider()

        jest.runAllTimers()

        expect(
            screen.getByText(
                /We're setting things up so AI Agent can respond with confidence/,
            ),
        ).toBeInTheDocument()
    })

    it('renders all knowledge sources when everything is available', () => {
        useGetHelpCentersByShopNameMock.mockReturnValue({
            isHelpCenterLoading: false,
            helpCenters: getHelpCentersResponseFixture.data,
        })

        renderWithProvider()

        jest.runAllTimers()

        expect(screen.getByText('ACME Help Center')).toBeInTheDocument()

        expect(screen.getByText('Shopify Store')).toBeInTheDocument()

        expect(screen.getByText('shopify.myshopify.com')).toBeInTheDocument()
    })

    it('does not render Help center knowledge source when there is none', () => {
        useGetHelpCentersByShopNameMock.mockReturnValue({
            isHelpCenterLoading: true,
            helpCenters: [],
        })

        renderWithProvider()

        jest.runAllTimers()

        expect(screen.queryByText('ACME Help Center')).toBeNull()
    })

    it('does not render Help center knowledge source when it is loading', () => {
        useGetHelpCentersByShopNameMock.mockReturnValue({
            isHelpCenterLoading: true,
            helpCenters: [],
        })
        renderWithProvider()

        jest.runAllTimers()

        expect(screen.queryByText('ACME Help Center')).toBeNull()
    })

    it('renders Help center knowledge source when there is one', () => {
        useGetHelpCentersByShopNameMock.mockReturnValue({
            isHelpCenterLoading: false,
            helpCenters: getHelpCentersResponseFixture.data,
        })

        renderWithProvider()

        jest.runAllTimers()

        expect(screen.getByText('ACME Help Center')).toBeInTheDocument()
    })

    it('renders preview section', async () => {
        renderWithProvider()

        jest.runAllTimers()

        expect((await screen.findAllByText('Top Locations')).length).toBe(4)
    })

    it('navigates to the previous step when Back is clicked', () => {
        renderWithProvider()

        jest.runAllTimers()

        fireEvent.click(screen.getByText(/Back/i))

        expect(defaultProps.goToStep).toHaveBeenCalledWith(
            WizardStepEnum.ENGAGEMENT,
        )
    })

    it('should navigate to per-shop overview when feature flag is enabled', async () => {
        mockUseFlag.mockReturnValueOnce(true)

        useGetHelpCentersByShopNameMock.mockReturnValue({
            isHelpCenterLoading: false,
            helpCenters: getHelpCentersResponseFixture.data,
        })

        const { history } = renderWithProvider()
        jest.runAllTimers()

        const nextButton = screen.getByText('Finish setup')

        await act(() => user.click(nextButton))

        await waitFor(() => {
            expect(history.location.pathname).toEqual(
                `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/overview`,
            )
            expect(history.location.search).toEqual(
                `?shopName=${encodeURIComponent(shopifyIntegration.meta.shop_name)}&from=onboarding`,
            )
        })
    })

    it('should call onClick when there is an HelpCenter and verify routing behavior', async () => {
        useGetHelpCentersByShopNameMock.mockReturnValue({
            isHelpCenterLoading: false,
            helpCenters: getHelpCentersResponseFixture.data,
        })
        const { history } = renderWithProvider()

        jest.runAllTimers()

        const nextButton = screen.getByRole('button', { name: /finish/i })

        await act(() => user.click(nextButton))

        await waitFor(() => {
            expect(history.location.pathname).toEqual('/app/ai-agent/overview')
            expect(history.location.search).toEqual(
                `?shopName=${encodeURIComponent(shopifyIntegration.meta.shop_name)}&from=onboarding`,
            )
        })
    })

    describe('Shopping Assistant trial functionality', () => {
        beforeEach(() => {
            testQueryClient.clear()

            mockUseLocalStorage.mockReturnValue([
                true, // shoppingAssistantTrialOptin = true
                jest.fn(),
                mockRemoveShoppingAssistantTrialOptin,
            ])

            useGetHelpCentersByShopNameMock.mockReturnValue({
                isHelpCenterLoading: false,
                helpCenters: getHelpCentersResponseFixture.data,
            })
        })

        it('should start Shopping Assistant trial when conditions are met', async () => {
            const { history } = renderWithProvider()
            jest.runAllTimers()

            const nextButton = screen.getByText('Finish setup')

            await act(() => user.click(nextButton))

            await waitFor(() => {
                expect(mockStartSalesTrialMutateAsync).toHaveBeenCalledWith([
                    shopifyIntegration.meta.shop_name,
                ])
                expect(mockRemoveShoppingAssistantTrialOptin).toHaveBeenCalled()
                expect(history.location.pathname).toEqual(
                    '/app/ai-agent/overview',
                )
            })
        })

        it('should NOT start Shopping Assistant trial when opt-in is false', async () => {
            mockUseLocalStorage.mockReturnValue([
                false, // shoppingAssistantTrialOptin = false
                jest.fn(),
                mockRemoveShoppingAssistantTrialOptin,
            ])

            const { history } = renderWithProvider()
            jest.runAllTimers()

            const nextButton = screen.getByText('Finish setup')

            await act(() => user.click(nextButton))

            await waitFor(() => {
                expect(mockStartSalesTrialMutateAsync).not.toHaveBeenCalled()
                expect(
                    mockRemoveShoppingAssistantTrialOptin,
                ).not.toHaveBeenCalled()
                expect(history.location.pathname).toEqual(
                    '/app/ai-agent/overview',
                )
            })
        })

        it('should preserve AI Agent flow and NOT start Shopping Assistant trial', async () => {
            mockUseTrialAccess.mockReturnValue({
                trialType: TrialType.AiAgent, // AI Agent type
                hasCurrentStoreTrialStarted: false,
                hasAnyTrialStarted: false,
                canSeeTrialCTA: false,
                isLoading: false,
            })

            const { history } = renderWithProvider()
            jest.runAllTimers()

            const nextButton = screen.getByText('Finish setup')

            await act(() => user.click(nextButton))

            await waitFor(() => {
                expect(mockStartSalesTrialMutateAsync).not.toHaveBeenCalled()
                expect(
                    mockRemoveShoppingAssistantTrialOptin,
                ).not.toHaveBeenCalled()
                expect(history.location.pathname).toEqual(
                    '/app/ai-agent/overview',
                )
            })
        })

        it('should configure error handling correctly in the mutation hook', async () => {
            // Capture the onError callback that was passed to the hook
            let capturedOnErrorCallback: (() => void) | undefined
            mockUseStartSalesTrialMutation.mockImplementation(({ onError }) => {
                capturedOnErrorCallback = onError
                return {
                    mutateAsync: mockStartSalesTrialMutateAsync,
                    mutate: jest.fn(),
                    data: undefined,
                    error: null,
                    isLoading: false,
                    isError: false,
                    isSuccess: false,
                }
            })

            renderWithProvider()
            jest.runAllTimers()

            // Verify that the error callback was configured
            expect(capturedOnErrorCallback).toBeDefined()

            // Simulate calling the error callback
            if (capturedOnErrorCallback) {
                act(() => {
                    capturedOnErrorCallback?.()
                })
            }

            // Verify the error notification was dispatched
            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'NOTIFY',
                    }),
                )
            })
        })
    })

    describe('Loading state management', () => {
        beforeEach(() => {
            testQueryClient.clear()

            useGetHelpCentersByShopNameMock.mockReturnValue({
                isHelpCenterLoading: false,
                helpCenters: getHelpCentersResponseFixture.data,
            })
        })

        it('should use mutation hook loading state', async () => {
            mockUseUpdateOnboarding.mockReturnValue({
                mutate: jest.fn(),
                isLoading: true,
            })

            renderWithProvider()
            jest.runAllTimers()

            const nextButton = screen.getByRole('button', { name: /finish/i })

            // When mutation is loading, button should be disabled
            expect(nextButton).toBeDisabled()
        })

        it('should keep loading state until navigation completes on success', async () => {
            mockUseUpdateOnboarding.mockReturnValue({
                mutate: (_data: any, { onSuccess }: any) => {
                    Promise.resolve(onSuccess()).then(() => {})
                },
                isLoading: false,
            })

            const { history } = renderWithProvider()
            jest.runAllTimers()

            const nextButton = screen.getByRole('button', { name: /finish/i })

            await act(() => user.click(nextButton))

            await waitFor(() => {
                expect(history.location.pathname).toEqual(
                    '/app/ai-agent/overview',
                )
            })
        })
    })
})
