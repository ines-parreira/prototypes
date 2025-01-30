import {QueryClientProvider} from '@tanstack/react-query'
import {act, render, screen, waitFor} from '@testing-library/react'

import {fromJS} from 'immutable'

import React from 'react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {appQueryClient} from 'api/queryClient'
import {shopifyIntegration} from 'fixtures/integrations'
import * as hooks from 'hooks/useAppSelector'
import {useGetHelpCentersByShopName} from 'pages/aiAgent/Onboarding/hooks/useGetHelpCentersByShopName'
import {OnboardingContext} from 'pages/aiAgent/Onboarding/providers/OnboardingContext'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {assumeMock} from 'utils/testing'

import {KnowledgeStep} from '../KnowledgeStep'

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

const useGetHelpCentersByShopNameMock = assumeMock(useGetHelpCentersByShopName)

describe('KnowledgeStep', () => {
    jest.useFakeTimers()

    const defaultProps = {
        currentStep: 1,
        totalSteps: 3,
        onNextClick: jest.fn(),
        onBackClick: jest.fn(),
    }

    const renderWithProvider = (props = defaultProps) => {
        return render(
            <Provider store={configureMockStore()()}>
                <QueryClientProvider client={appQueryClient}>
                    <OnboardingContext.Provider
                        value={
                            {
                                shopName: shopifyIntegration.meta.shop_name,
                                setOnboardingData: jest.fn(),
                            } as any
                        }
                    >
                        <KnowledgeStep {...props} />
                    </OnboardingContext.Provider>
                </QueryClientProvider>
            </Provider>
        )
    }

    it('renders the component with main title', () => {
        renderWithProvider()

        expect(screen.getByText(/Great, start building/)).toBeInTheDocument()
        expect(screen.getByText(/AI Agent's knowledge/)).toBeInTheDocument()
    })

    it('renders AI Banner with correct text', () => {
        renderWithProvider()

        expect(
            screen.getByText(
                /Your AI Agent uses your knowledge to respond to customers/
            )
        ).toBeInTheDocument()
    })

    it('renders Shopify knowledge source when shop name is provided', () => {
        renderWithProvider()

        expect(
            screen.getByText(shopifyIntegration.meta.shop_name)
        ).toBeInTheDocument()
    })

    it('does not render Help center knowledge source when there is none', () => {
        renderWithProvider()

        expect(screen.queryByText('ACME Help Center')).toBeNull()
    })

    it('does not render Help center knowledge source when it is loading', () => {
        useGetHelpCentersByShopNameMock.mockReturnValue({
            isHelpCenterLoading: true,
            helpCenters: [],
        })
        renderWithProvider()

        expect(screen.queryByText('ACME Help Center')).toBeNull()
    })

    it('renders Help center knowledge source when there is one', () => {
        useGetHelpCentersByShopNameMock.mockReturnValue({
            isHelpCenterLoading: false,
            helpCenters: getHelpCentersResponseFixture.data,
        })

        renderWithProvider()

        expect(screen.getByText('ACME Help Center')).toBeInTheDocument()
    })

    it('renders preview section', async () => {
        renderWithProvider()
        act(() => jest.runAllTimers())

        await waitFor(() =>
            expect(screen.getAllByText('Top Locations').length).toBe(2)
        )
    })
})
