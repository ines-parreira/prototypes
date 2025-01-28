import {QueryClientProvider} from '@tanstack/react-query'
import {act, render, screen, waitFor} from '@testing-library/react'

import {fromJS} from 'immutable'
import React from 'react'

import {appQueryClient} from 'api/queryClient'
import {shopifyIntegration} from 'fixtures/integrations'
import * as hooks from 'hooks/useAppSelector'

import {OnboardingContext} from 'pages/aiAgent/Onboarding/providers/OnboardingContext'

import {KnowledgeStep} from '../KnowledgeStep'

jest.mock(
    'pages/aiAgent/Onboarding/hooks/useGetKnowledgeStatusByShopName',
    () => ({
        useGetKnowledgeStatusByShopName: jest.fn().mockReturnValue('DONE'),
    })
)
jest.spyOn(hooks, 'default').mockReturnValue(fromJS(shopifyIntegration))

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

    it('renders Help center knowledge source', () => {
        renderWithProvider()

        expect(screen.getByText('Help center example')).toBeInTheDocument()
    })

    it('renders preview section', async () => {
        renderWithProvider()
        act(() => jest.runAllTimers())

        await waitFor(() =>
            expect(screen.getAllByText('Top Locations').length).toBe(2)
        )
    })
})
