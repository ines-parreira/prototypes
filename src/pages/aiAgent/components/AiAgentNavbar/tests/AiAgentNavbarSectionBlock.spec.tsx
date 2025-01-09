import {render, screen} from '@testing-library/react'
import React from 'react'

import '@testing-library/jest-dom/extend-expect'
import {BrowserRouter} from 'react-router-dom'

import {IntegrationType} from 'models/integration/constants'
import {ShopType} from 'models/selfServiceConfiguration/types'
import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'

import {
    OnboardingState,
    useAiAgentOnboardingState,
} from 'pages/aiAgent/hooks/useAiAgentOnboardingState'

import {AiAgentNavbarSectionBlock} from '../AiAgentNavbarSectionBlock'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingState')

const mockUseAiAgentNavigation = useAiAgentNavigation as jest.Mock
const mockUseAiAgentOnboardingState = useAiAgentOnboardingState as jest.Mock

describe('AiAgentNavbarSectionBlock', () => {
    const defaultProps = {
        shopType: IntegrationType.Shopify as ShopType,
        shopName: 'Test Shop',
        onToggle: jest.fn(),
        name: 'Test Name',
        isExpanded: true,
    }

    beforeEach(() => {
        mockUseAiAgentNavigation.mockReturnValue({
            headerNavbarItems: [
                {route: '/route1', title: 'Route 1', dataCanduId: 'candu-1'},
                {route: '/route2', title: 'Route 2'},
            ],
            routes: {main: '/main'},
        })
        mockUseAiAgentOnboardingState.mockReturnValue(OnboardingState.Onboarded)
    })

    test('renders the component with onboarded state', () => {
        render(
            <BrowserRouter>
                <AiAgentNavbarSectionBlock {...defaultProps} />
            </BrowserRouter>
        )

        expect(screen.getByAltText('shopify logo')).toBeInTheDocument()
        expect(screen.getByText('Route 1')).toBeInTheDocument()
        expect(screen.getByText('Route 2')).toBeInTheDocument()
        expect(screen.queryByText('Set Up')).not.toBeInTheDocument()
    })

    test('renders the component with non-onboarded state', () => {
        mockUseAiAgentOnboardingState.mockReturnValueOnce(
            OnboardingState.WelcomeStatic
        )

        render(
            <BrowserRouter>
                <AiAgentNavbarSectionBlock {...defaultProps} />
            </BrowserRouter>
        )

        expect(screen.getByAltText('shopify logo')).toBeInTheDocument()
        expect(screen.getByText('Set Up')).toBeInTheDocument()
        expect(screen.queryByText('Route 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Route 2')).not.toBeInTheDocument()
    })

    test('does not render the component when loading', () => {
        mockUseAiAgentOnboardingState.mockReturnValueOnce(
            OnboardingState.Loading
        )

        const {container} = render(
            <BrowserRouter>
                <AiAgentNavbarSectionBlock {...defaultProps} />
            </BrowserRouter>
        )

        expect(container.firstChild).toBeNull()
    })
})
