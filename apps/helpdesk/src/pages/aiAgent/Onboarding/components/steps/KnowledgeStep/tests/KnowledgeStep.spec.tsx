import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { useFlag } from 'core/flags'
import { shopifyIntegration } from 'fixtures/integrations'
import * as hooks from 'hooks/useAppSelector'
import { OnboardingNotificationState } from 'models/aiAgent/types'
import { useOnboardingNotificationState } from 'pages/aiAgent/hooks/useOnboardingNotificationState'
import { KnowledgeStep } from 'pages/aiAgent/Onboarding/components/steps/KnowledgeStep/KnowledgeStep'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { StepProps } from 'pages/aiAgent/Onboarding/components/steps/types'
import { useGetHelpCentersByShopName } from 'pages/aiAgent/Onboarding/hooks/useGetHelpCentersByShopName'
import { useGetKnowledgePreviewData } from 'pages/aiAgent/Onboarding/hooks/useGetKnowledgePreviewData'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useTopLocations } from 'pages/aiAgent/Onboarding/hooks/useTopLocations'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useUpdateOnboarding'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { renderWithRouter } from 'utils/testing'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useOnboardingNotificationState', () => ({
    useOnboardingNotificationState: jest.fn(),
}))
const mockUseOnboardingNotificationState = jest.mocked(
    useOnboardingNotificationState,
)

jest.mock('pages/aiAgent/Onboarding/hooks/useGetHelpCentersByShopName', () => ({
    useGetHelpCentersByShopName: jest
        .fn()
        .mockReturnValue({ isHelpCenterLoading: false, helpCenters: [] }),
}))
jest.spyOn(hooks, 'default').mockReturnValue(fromJS(shopifyIntegration))

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData', () => ({
    useGetOnboardingData: jest.fn(),
}))

jest.mock('pages/aiAgent/Onboarding/hooks/useUpdateOnboarding', () => ({
    useUpdateOnboarding: jest.fn(),
}))

jest.mock('pages/settings/contactForm/hooks/useEmailIntegrations')

jest.mock('pages/aiAgent/Onboarding/hooks/useGetKnowledgePreviewData', () => ({
    useGetKnowledgePreviewData: jest.fn(),
}))

const useGetHelpCentersByShopNameMock = assumeMock(useGetHelpCentersByShopName)
const mockUseEmailIntegrations = useEmailIntegrations as jest.Mock

jest.mock('pages/aiAgent/Onboarding/hooks/useTopLocations')

const mockUseTopLocations = assumeMock(useTopLocations)

const mockUseGetOnboardingData = useGetOnboardingData as jest.Mock
const mockUseUpdateOnboarding = useUpdateOnboarding as jest.Mock
const mockUseGetKnowledgePreviewData = useGetKnowledgePreviewData as jest.Mock
const mockUseFlag = useFlag as jest.Mock

const defaultProps: StepProps = {
    currentStep: 2,
    totalSteps: 5,
    goToStep: jest.fn(),
}

const renderWithProvider = (props = defaultProps) => {
    const queryClient = new QueryClient()
    const history = createMemoryHistory({
        initialEntries: [
            `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/knowledge`,
        ],
    })

    const result = renderWithRouter(
        <Provider store={configureMockStore()()}>
            <QueryClientProvider client={queryClient}>
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
    beforeEach(() => {
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
                onSuccess()
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

        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('renders the component with main title', () => {
        renderWithProvider()

        jest.runAllTimers()

        expect(screen.getByText(/Great, start building/)).toBeInTheDocument()
        expect(screen.getByText(/AI Agent's knowledge/)).toBeInTheDocument()
    })

    it('renders AI Banner with correct text', () => {
        renderWithProvider()

        jest.runAllTimers()

        expect(
            screen.getByText(
                /Your AI Agent leverages different knowledge resources/,
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

    it('navigates to the channels step when Back is clicked', () => {
        renderWithProvider()

        jest.runAllTimers()

        fireEvent.click(screen.getByText(/Back/i))

        expect(defaultProps.goToStep).toHaveBeenCalledWith(
            WizardStepEnum.CHANNELS,
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

        const nextButton = screen.getByText('Next')

        act(() => {
            userEvent.click(nextButton)
        })

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

        const nextButton = screen.getByText('Next')

        act(() => {
            userEvent.click(nextButton)
        })

        await waitFor(() => {
            expect(history.location.pathname).toEqual('/app/ai-agent/overview')
            expect(history.location.search).toEqual(
                `?shopName=${encodeURIComponent(shopifyIntegration.meta.shop_name)}&from=onboarding`,
            )
        })
    })
})
