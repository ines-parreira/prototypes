import type { ReactNode } from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { AiAgentView } from '../AiAgentView'

// Mock components used within AiAgentView
jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div>Loading...</div>
))
jest.mock(
    'pages/common/components/SecondaryNavbar/SecondaryNavbar',
    () =>
        ({ children }: { children?: ReactNode }) => <div>{children}</div>,
)
describe('AiAgentView', () => {
    test('renders with title and action', () => {
        render(
            <AiAgentView
                title={<div>Test Title</div>}
                action={<button>Action</button>}
            >
                <div>Content</div>
            </AiAgentView>,
            {},
        )
        expect(screen.getByText('Test Title')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Action' }),
        ).toBeInTheDocument()
    })
    test('renders with headerNavbarItems', () => {
        const navbarItems = [
            { route: '/route1', title: 'Route 1' },
            { route: '/route2', title: 'Route 2', exact: false },
        ]
        render(
            <AiAgentView headerNavbarItems={navbarItems}>
                <div>Content</div>
            </AiAgentView>,
            {},
        )
        expect(screen.getByText('Route 1')).toBeInTheDocument()
        expect(screen.getByText('Route 2')).toBeInTheDocument()
    })
    test('renders loading state', () => {
        render(
            <AiAgentView isLoading>
                <div>Content</div>
            </AiAgentView>,
            {},
        )
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
    test('renders children when not loading', () => {
        render(
            <AiAgentView>
                <div>Content</div>
            </AiAgentView>,
            {},
        )
        expect(screen.getByText('Content')).toBeInTheDocument()
    })
})
