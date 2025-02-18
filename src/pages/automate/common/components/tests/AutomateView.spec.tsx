import {screen} from '@testing-library/react'
import React from 'react'

import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'

import {useDisplayAiAgentMovedBanner} from '../../hooks/useDisplayAiAgentMovedBanner'
import AutomateView from '../AutomateView'

// Mock components used within AutomateView
jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div>Loading...</div>
))

jest.mock(
    'pages/common/components/SecondaryNavbar/SecondaryNavbar',
    () =>
        ({children}: {children: React.ReactNode}) => <div>{children}</div>
)

jest.mock('../../hooks/useDisplayAiAgentMovedBanner', () => ({
    useDisplayAiAgentMovedBanner: jest.fn(),
}))

jest.mock('../AiAgentMovedBanner', () => ({
    AiAgentMovedBanner: () => <div>AI Agent Moved Banner</div>,
}))

describe('AutomateView', () => {
    beforeEach(() => {
        ;(useDisplayAiAgentMovedBanner as jest.Mock).mockReset()
    })

    test('renders with title and action', () => {
        renderWithQueryClientProvider(
            <AutomateView
                title={<div>Test Title</div>}
                action={<button>Action</button>}
            >
                <div>Content</div>
            </AutomateView>
        )

        expect(screen.getByText('Test Title')).toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'Action'})).toBeInTheDocument()
    })

    test('renders with headerNavbarItems', () => {
        const navbarItems = [
            {route: '/route1', title: 'Route 1'},
            {route: '/route2', title: 'Route 2', exact: false},
        ]
        renderWithQueryClientProvider(
            <AutomateView headerNavbarItems={navbarItems}>
                <div>Content</div>
            </AutomateView>
        )
        expect(screen.getByText('Route 1')).toBeInTheDocument()
        expect(screen.getByText('Route 2')).toBeInTheDocument()
    })

    test('renders loading state', () => {
        renderWithQueryClientProvider(
            <AutomateView isLoading>
                <div>Content</div>
            </AutomateView>
        )
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    test('renders children when not loading', () => {
        renderWithQueryClientProvider(
            <AutomateView>
                <div>Content</div>
            </AutomateView>
        )
        expect(screen.getByText('Content')).toBeInTheDocument()
    })

    test('renders AI Agent Moved banner when useDisplayAiAgentMovedBanner returns true', () => {
        ;(useDisplayAiAgentMovedBanner as jest.Mock).mockReturnValue(true)

        renderWithQueryClientProvider(
            <AutomateView>
                <div>Content</div>
            </AutomateView>
        )

        expect(screen.getByText('AI Agent Moved Banner')).toBeInTheDocument()
    })

    test('does not render AI Agent Moved banner when useDisplayAiAgentMovedBanner returns false', () => {
        ;(useDisplayAiAgentMovedBanner as jest.Mock).mockReturnValue(false)

        renderWithQueryClientProvider(
            <AutomateView>
                <div>Content</div>
            </AutomateView>
        )

        expect(
            screen.queryByText('AI Agent Moved Banner')
        ).not.toBeInTheDocument()
    })
})
