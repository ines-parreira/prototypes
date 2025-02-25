import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { shopifyIntegration } from 'fixtures/integrations'
import * as hooks from 'hooks/useAppSelector'
import {
    getOnboardingData,
    updateOnboardingData,
} from 'models/aiAgent/resources/configuration'
import { KnowledgeStep } from 'pages/aiAgent/Onboarding/components/steps/KnowledgeStep/KnowledgeStep'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { StepProps } from 'pages/aiAgent/Onboarding/components/steps/types'
import { useGetHelpCentersByShopName } from 'pages/aiAgent/Onboarding/hooks/useGetHelpCentersByShopName'
import { useGetKnowledgeStatusByShopName } from 'pages/aiAgent/Onboarding/hooks/useGetKnowledgeStatusByShopName'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { assumeMock, renderWithRouter } from 'utils/testing'

jest.mock(
    'pages/aiAgent/Onboarding/hooks/useGetKnowledgeStatusByShopName',
    () => ({
        useGetKnowledgeStatusByShopName: jest.fn().mockReturnValue('DONE'),
    }),
)
jest.mock('pages/aiAgent/Onboarding/hooks/useGetHelpCentersByShopName', () => ({
    useGetHelpCentersByShopName: jest
        .fn()
        .mockReturnValue({ isHelpCenterLoading: false, helpCenters: [] }),
}))
jest.spyOn(hooks, 'default').mockReturnValue(fromJS(shopifyIntegration))

jest.mock('models/aiAgent/resources/configuration', () => ({
    getOnboardingData: jest.fn(),
    updateOnboardingData: jest.fn(),
}))

const useGetHelpCentersByShopNameMock = assumeMock(useGetHelpCentersByShopName)

jest.mock(
    'pages/aiAgent/Onboarding/hooks/useGetKnowledgeStatusByShopName',
    () => ({
        useGetKnowledgeStatusByShopName: jest.fn(),
    }),
)

const mockGetOnboardingData = getOnboardingData as jest.Mock
const mockUpdateOnboardingData = updateOnboardingData as jest.Mock
const mockUseGetKnowledgeStatusByShopName =
    useGetKnowledgeStatusByShopName as jest.Mock

const queryClient = new QueryClient()

const history = createMemoryHistory({
    initialEntries: [
        `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/knowledge`,
    ],
})

describe('KnowledgeStep', () => {
    const defaultProps: StepProps = {
        currentStep: 2,
        totalSteps: 3,
        goToStep: jest.fn(),
    }

    const renderWithProvider = (props = defaultProps) => {
        return renderWithRouter(
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
    }

    beforeEach(() => {
        // ✅ Mock getOnboardingData function
        mockGetOnboardingData.mockResolvedValue(
            Promise.resolve([
                {
                    id: 1,
                    salesPersuasionLevel: PersuasionLevel.Moderate,
                    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                    salesDiscountMax: 0.8,
                    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
                    shopName: shopifyIntegration.meta.shop_name,
                },
            ]),
        )

        // // ✅ Mock updateOnboardingData function
        mockUpdateOnboardingData.mockResolvedValue(
            Promise.resolve({
                success: true,
            }),
        )

        mockUseGetKnowledgeStatusByShopName.mockReturnValue('done')
    })

    beforeAll(() => {
        jest.useFakeTimers()
    })

    afterAll(() => {
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

    it('renders Shopify knowledge source when shop name is provided', () => {
        useGetHelpCentersByShopNameMock.mockReturnValue({
            isHelpCenterLoading: false,
            helpCenters: getHelpCentersResponseFixture.data,
        })

        renderWithProvider()

        jest.runAllTimers()

        expect(screen.getByText('ACME Help Center')).toBeInTheDocument()

        expect(
            screen.getByText(shopifyIntegration.meta.shop_name),
        ).toBeInTheDocument()
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

        expect((await screen.findAllByText('Top Locations')).length).toBe(2)
    })

    it('should call onClick when there is an HelpCenter', () => {
        useGetHelpCentersByShopNameMock.mockReturnValue({
            isHelpCenterLoading: false,
            helpCenters: getHelpCentersResponseFixture.data,
        })
        renderWithProvider()

        jest.runAllTimers()

        const nextButton = screen.getByText('Next')

        userEvent.click(nextButton)
    })

    it('navigates to the handover step when Back is clicked', () => {
        renderWithProvider()

        jest.runAllTimers()

        fireEvent.click(screen.getByText(/Back/i))

        expect(defaultProps.goToStep).toHaveBeenCalledWith(
            WizardStepEnum.HANDOVER,
        )
    })
})
