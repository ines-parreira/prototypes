import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, render, screen} from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'

import React from 'react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {shopifyIntegration} from 'fixtures/integrations'
import * as hooks from 'hooks/useAppSelector'
import {KnowledgeStep} from 'pages/aiAgent/Onboarding/components/steps/KnowledgeStep/KnowledgeStep'
import {DiscountStrategy} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import {PersuasionLevel} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import {useGetHelpCentersByShopName} from 'pages/aiAgent/Onboarding/hooks/useGetHelpCentersByShopName'

import {useGetKnowledgeStatusByShopName} from 'pages/aiAgent/Onboarding/hooks/useGetKnowledgeStatusByShopName'
import {
    useGetOnboardingData,
    useUpdateOnboardingCache,
} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'

import {AiAgentScopes, WizardStepEnum} from 'pages/aiAgent/Onboarding/types'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {assumeMock} from 'utils/testing'

jest.mock(
    'pages/aiAgent/Onboarding/hooks/useGetKnowledgeStatusByShopName',
    () => ({
        useGetKnowledgeStatusByShopName: jest.fn().mockReturnValue('DONE'),
    })
)
jest.mock('pages/aiAgent/Onboarding/hooks/useGetHelpCentersByShopName', () => ({
    useGetHelpCentersByShopName: jest
        .fn()
        .mockReturnValue({isHelpCenterLoading: false, helpCenters: []}),
}))
jest.spyOn(hooks, 'default').mockReturnValue(fromJS(shopifyIntegration))

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData', () => ({
    useGetOnboardingData: jest.fn(),
    useUpdateOnboardingCache: jest.fn(),
}))

const useGetHelpCentersByShopNameMock = assumeMock(useGetHelpCentersByShopName)

jest.mock(
    'pages/aiAgent/Onboarding/hooks/useGetKnowledgeStatusByShopName',
    () => ({
        useGetKnowledgeStatusByShopName: jest.fn(),
    })
)

const mockUseGetOnboardingData = useGetOnboardingData as jest.Mock
const mockUseUpdateOnboardingCache = useUpdateOnboardingCache as jest.Mock
const mockUseGetKnowledgeStatusByShopName =
    useGetKnowledgeStatusByShopName as jest.Mock

const queryClient = new QueryClient()

describe('KnowledgeStep', () => {
    const defaultProps: StepProps = {
        currentStep: 2,
        totalSteps: 3,
        goToStep: jest.fn(),
    }

    const renderWithProvider = (props = defaultProps) => {
        return render(
            <Provider store={configureMockStore()()}>
                <QueryClientProvider client={queryClient}>
                    <KnowledgeStep {...props} />
                </QueryClientProvider>
            </Provider>
        )
    }

    beforeEach(() => {
        // Populate the return values of the mocked hooks
        mockUseGetOnboardingData.mockReturnValue({
            data: {
                persuasionLevel: PersuasionLevel.Moderate,
                discountStrategy: DiscountStrategy.Balanced,
                maxDiscountPercentage: 8,
                scope: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
                shop: shopifyIntegration.meta.shop_name,
            },
        })

        mockUseGetKnowledgeStatusByShopName.mockReturnValue('done')
        mockUseUpdateOnboardingCache.mockReturnValue(jest.fn())
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
                /Your AI Agent uses your knowledge to respond to customers/
            )
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
            screen.getByText(shopifyIntegration.meta.shop_name)
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

        expect(mockUseUpdateOnboardingCache).toHaveBeenCalled()
    })

    it('navigates to the handover step when Back is clicked', () => {
        renderWithProvider()

        jest.runAllTimers()

        fireEvent.click(screen.getByText(/Back/i))

        expect(defaultProps.goToStep).toHaveBeenCalledWith(
            WizardStepEnum.HANDOVER
        )
    })
})
