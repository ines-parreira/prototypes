import React from 'react'

import { render, screen } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'

import { BrowserRouter } from 'react-router-dom'

import { IntegrationType } from 'models/integration/constants'
import { ShopType } from 'models/selfServiceConfiguration/types'
import { AiAgentNavbarSectionBlock } from 'pages/aiAgent/components/AiAgentNavbar/AiAgentNavbarSectionBlock'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import {
    OnboardingState,
    useAiAgentOnboardingState,
} from 'pages/aiAgent/hooks/useAiAgentOnboardingState'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import { assumeMock } from 'utils/testing'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingState')

const mockUseAiAgentNavigation = assumeMock(useAiAgentNavigation)
const mockUseAiAgentOnboardingState = assumeMock(useAiAgentOnboardingState)

jest.mock(
    'pages/stats/report-chart-restrictions/useReportChartRestrictions',
    () => ({
        useReportChartRestrictions: jest.fn(),
    }),
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

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
            // @ts-ignore We don't test this part
            routes: { main: '/main' },
            navigationItems: [
                { route: '/route1', title: 'Route 1', dataCanduId: 'candu-1' },
                { route: '/route2', title: 'Route 2' },
                { route: '/route3', title: 'Sales' },
            ],
        })
        mockUseAiAgentOnboardingState.mockReturnValue(OnboardingState.Onboarded)
        useReportChartRestrictionsMock.mockReturnValue({
            isRouteRestrictedToCurrentUser: () => false,
        } as any)
    })

    test('renders the component with onboarded state', () => {
        render(
            <BrowserRouter>
                <AiAgentNavbarSectionBlock {...defaultProps} />
            </BrowserRouter>,
        )

        expect(screen.getByAltText('shopify logo')).toBeInTheDocument()
        expect(screen.getByText('Route 1')).toBeInTheDocument()
        expect(screen.getByText('Route 2')).toBeInTheDocument()
        expect(screen.getByText('Sales')).toBeInTheDocument()
        expect(screen.getByText('BETA')).toBeInTheDocument()
        expect(screen.queryByText('Get Started')).not.toBeInTheDocument()
    })

    test('renders the component with non-onboarded state', () => {
        mockUseAiAgentOnboardingState.mockReturnValueOnce(
            OnboardingState.WelcomeStatic,
        )

        render(
            <BrowserRouter>
                <AiAgentNavbarSectionBlock {...defaultProps} />
            </BrowserRouter>,
        )

        expect(screen.getByAltText('shopify logo')).toBeInTheDocument()
        expect(screen.getByText('Get Started')).toBeInTheDocument()
        expect(screen.queryByText('Route 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Route 2')).not.toBeInTheDocument()
        expect(screen.queryByText('Sales')).not.toBeInTheDocument()
    })

    test('does not render the component when loading', () => {
        mockUseAiAgentOnboardingState.mockReturnValueOnce(
            OnboardingState.Loading,
        )

        const { container } = render(
            <BrowserRouter>
                <AiAgentNavbarSectionBlock {...defaultProps} />
            </BrowserRouter>,
        )

        expect(container.firstChild).toBeNull()
    })

    test('does not render the BETA badge when there is no Sales route', () => {
        mockUseAiAgentNavigation.mockReturnValue({
            // @ts-ignore We don't test this part
            routes: { main: '/main' },
            navigationItems: [
                { route: '/route1', title: 'Route 1', dataCanduId: 'candu-1' },
                { route: '/route2', title: 'Route 2' },
            ],
        })

        render(
            <BrowserRouter>
                <AiAgentNavbarSectionBlock {...defaultProps} />
            </BrowserRouter>,
        )

        expect(screen.queryByText('BETA')).not.toBeInTheDocument()
    })
})
