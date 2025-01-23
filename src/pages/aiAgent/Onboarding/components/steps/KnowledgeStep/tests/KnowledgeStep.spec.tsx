import {render, screen} from '@testing-library/react'

import {fromJS} from 'immutable'
import React from 'react'

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
    const defaultProps = {
        currentStep: 1,
        totalSteps: 3,
        onNextClick: jest.fn(),
        onBackClick: jest.fn(),
    }

    const renderWithProvider = (props = defaultProps) => {
        return render(
            <OnboardingContext.Provider
                value={
                    {
                        shop_name: shopifyIntegration.meta.shop_name,
                        setOnboardingData: jest.fn(),
                    } as any
                }
            >
                <KnowledgeStep {...props} />
            </OnboardingContext.Provider>
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

    it('renders preview section', () => {
        renderWithProvider()

        expect(screen.getByText('Preview')).toBeInTheDocument()
        expect(
            screen.getByText("Hi, I'm Gorgias. How can I help you today?")
        ).toBeInTheDocument()
    })
})
