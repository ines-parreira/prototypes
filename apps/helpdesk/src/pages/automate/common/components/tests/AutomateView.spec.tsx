import { screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import AutomateView from '../AutomateView'

// Mock components used within AutomateView
jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div>Loading...</div>
))

jest.mock(
    'pages/common/components/SecondaryNavbar/SecondaryNavbar',
    () =>
        ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
)

describe('AutomateView', () => {
    test('renders with title and action', () => {
        renderWithQueryClientProvider(
            <MemoryRouter>
                <AutomateView
                    title={<div>Test Title</div>}
                    action={<button>Action</button>}
                >
                    <div>Content</div>
                </AutomateView>
            </MemoryRouter>,
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
        renderWithQueryClientProvider(
            <MemoryRouter>
                <AutomateView headerNavbarItems={navbarItems}>
                    <div>Content</div>
                </AutomateView>
            </MemoryRouter>,
        )
        expect(screen.getByText('Route 1')).toBeInTheDocument()
        expect(screen.getByText('Route 2')).toBeInTheDocument()
    })

    test('renders loading state', () => {
        renderWithQueryClientProvider(
            <MemoryRouter>
                <AutomateView isLoading>
                    <div>Content</div>
                </AutomateView>
            </MemoryRouter>,
        )
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    test('renders children when not loading', () => {
        renderWithQueryClientProvider(
            <MemoryRouter>
                <AutomateView>
                    <div>Content</div>
                </AutomateView>
            </MemoryRouter>,
        )
        expect(screen.getByText('Content')).toBeInTheDocument()
    })
})
