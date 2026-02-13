import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import configureMockStore from 'redux-mock-store'

import { ThemeProvider } from 'core/theme'
import { AnalyticsPage } from 'domains/reporting/pages/common/layout/AnalyticsPage'

jest.mock('@repo/routing', () => ({
    history: {
        replace: jest.fn(),
    },
}))

jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: () => <div data-testid="drill-down-modal" />,
}))

jest.mock('hooks/candu/useInjectStyleToCandu', () => ({
    __esModule: true,
    default: jest.fn(),
}))

const mockStore = configureMockStore()
const store = mockStore({
    currentAccount: fromJS({ domain: 'test-domain' }),
})

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

const renderComponent = (
    props: React.ComponentProps<typeof AnalyticsPage>,
    initialRoute = '/test',
) => {
    return render(
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <MemoryRouter initialEntries={[initialRoute]}>
                        <AnalyticsPage {...props} />
                    </MemoryRouter>
                </ThemeProvider>
            </QueryClientProvider>
        </Provider>,
    )
}

describe('AnalyticsPage', () => {
    const originalError = console.error

    beforeAll(() => {
        console.error = (...args: any[]) => {
            const message = args[0]
            // Suppress act warnings from Axiom Tabs internal updates
            if (
                typeof message === 'string' &&
                message.includes('Warning: An update to') &&
                message.includes('inside a test was not wrapped in act')
            ) {
                return
            }
            originalError.call(console, ...args)
        }
    })

    afterAll(() => {
        console.error = originalError
    })

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })

    describe('Basic rendering', () => {
        it('should render title as string', () => {
            renderComponent({
                title: 'Test Analytics',
                children: <div>Content</div>,
            })

            expect(screen.getByText('Test Analytics')).toBeInTheDocument()
        })

        it('should render title as ReactNode', () => {
            renderComponent({
                title: <h1>Custom Title</h1>,
                children: <div>Content</div>,
            })

            expect(screen.getByText('Custom Title')).toBeInTheDocument()
        })

        it('should render titleExtra', () => {
            renderComponent({
                title: 'Test Analytics',
                titleExtra: <button>Extra Button</button>,
                children: <div>Content</div>,
            })

            expect(screen.getByText('Extra Button')).toBeInTheDocument()
        })

        it('should render children', () => {
            renderComponent({
                title: 'Test Analytics',
                children: <div>Test Content</div>,
            })

            expect(screen.getByText('Test Content')).toBeInTheDocument()
        })

        it('should render DrillDownModal', () => {
            renderComponent({
                title: 'Test Analytics',
                children: <div>Content</div>,
            })

            expect(screen.getByTestId('drill-down-modal')).toBeInTheDocument()
        })

        it('should render filters slot', () => {
            renderComponent({
                title: 'Test Analytics',
                filtersSlot: <div>Filters Panel</div>,
                children: <div>Content</div>,
            })

            expect(screen.getByText('Filters Panel')).toBeInTheDocument()
        })
    })

    describe('Tabs', () => {
        const tabs = [
            { param: 'tab1', title: 'Tab 1' },
            { param: 'tab2', title: 'Tab 2' },
            { param: 'tab3', title: 'Tab 3' },
        ]

        it('should render tabs when provided', () => {
            renderComponent({
                title: 'Test Analytics',
                tabs,
                tabParamName: 'test-tab',
                children: <div>Content</div>,
            })

            expect(
                screen.getByRole('tab', { name: /tab 1/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('tab', { name: /tab 2/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('tab', { name: /tab 3/i }),
            ).toBeInTheDocument()
        })

        it('should not render tabs when not provided', () => {
            renderComponent({
                title: 'Test Analytics',
                children: <div>Content</div>,
            })

            expect(screen.queryByRole('tab')).not.toBeInTheDocument()
        })

        it('should not render tabs when empty array provided', () => {
            renderComponent({
                title: 'Test Analytics',
                tabs: [],
                tabParamName: 'test-tab',
                children: <div>Content</div>,
            })

            expect(screen.queryByRole('tab')).not.toBeInTheDocument()
        })

        it('should select default tab when no URL param', () => {
            renderComponent(
                {
                    title: 'Test Analytics',
                    tabs,
                    tabParamName: 'test-tab',
                    defaultTab: 'tab2',
                    children: <div>Content</div>,
                },
                '/test',
            )

            expect(
                screen.getByRole('tab', { name: /tab 2/i, selected: true }),
            ).toBeInTheDocument()
        })

        it('should select active tab based on URL param', () => {
            renderComponent(
                {
                    title: 'Test Analytics',
                    tabs,
                    tabParamName: 'test-tab',
                    activeTab: 'tab3',
                    defaultTab: 'tab1',
                    children: <div>Content</div>,
                },
                '/test?test-tab=tab3',
            )

            expect(
                screen.getByRole('tab', { name: /tab 3/i, selected: true }),
            ).toBeInTheDocument()
        })

        it('should call onTabChangeCallback when tab is clicked', async () => {
            const user = userEvent.setup()
            const onTabChangeCallback = jest.fn()

            renderComponent(
                {
                    title: 'Test Analytics',
                    tabs,
                    tabParamName: 'test-tab',
                    defaultTab: 'tab1',
                    onTabChangeCallback,
                    children: <div>Content</div>,
                },
                '/test?test-tab=tab1',
            )

            await user.click(screen.getByRole('tab', { name: /tab 2/i }))

            await waitFor(() => {
                expect(onTabChangeCallback).toHaveBeenCalledWith({
                    tabParam: 'tab2',
                    previousTab: 'tab1',
                })
            })
        })

        it('should call onTabChangeCallback with null previousTab when no initial tab', async () => {
            const user = userEvent.setup()
            const onTabChangeCallback = jest.fn()

            renderComponent(
                {
                    title: 'Test Analytics',
                    tabs,
                    tabParamName: 'test-tab',
                    onTabChangeCallback,
                    children: <div>Content</div>,
                },
                '/test',
            )

            await user.click(screen.getByRole('tab', { name: /tab 1/i }))

            await waitFor(() => {
                expect(onTabChangeCallback).toHaveBeenCalledWith({
                    tabParam: 'tab1',
                    previousTab: null,
                })
            })
        })

        it('should not call onTabChangeCallback when tabParamName is not provided', async () => {
            const user = userEvent.setup()
            const onTabChangeCallback = jest.fn()

            renderComponent({
                title: 'Test Analytics',
                tabs,
                onTabChangeCallback,
                children: <div>Content</div>,
            })

            await user.click(screen.getByRole('tab', { name: /tab 1/i }))

            await waitFor(() => {
                expect(onTabChangeCallback).not.toHaveBeenCalled()
            })
        })
    })

    describe('Layout structure', () => {
        it('should have sticky header', () => {
            const { container } = renderComponent({
                title: 'Test Analytics',
                children: <div>Content</div>,
            })

            const stickyHeader = container.querySelector('.stickyHeader')
            expect(stickyHeader).toBeInTheDocument()
        })

        it('should have content area', () => {
            const { container } = renderComponent({
                title: 'Test Analytics',
                children: <div>Content</div>,
            })

            const content = container.querySelector('.content')
            expect(content).toBeInTheDocument()
        })
    })
})
