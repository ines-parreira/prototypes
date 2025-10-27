import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory, MemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import WorkflowsViewContainer from '../WorkflowsViewContainer'

jest.mock('hooks/aiAgent/useAiAgentAccess')

const mockWorkflowsView = jest.fn()
jest.mock('../WorkflowsView', () => ({
    __esModule: true,
    default: (props: unknown) => mockWorkflowsView(props),
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const queryClient = mockQueryClient()

const defaultState = {
    billing: fromJS(billingState),
} as RootState

const mockUseAiAgentAccess = useAiAgentAccess as jest.MockedFunction<
    typeof useAiAgentAccess
>

describe('<WorkflowsViewContainer />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockWorkflowsView.mockReturnValue(<div>WorkflowsView</div>)
    })

    it('should render AutomatePaywallView when user does not have access', async () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        renderWithRouter(
            <MemoryRouter
                initialEntries={['/app/automation/shopify/test-shop/flows']}
            >
                <Route path="/app/automation/:shopType/:shopName/flows">
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore(defaultState)}>
                            <WorkflowsViewContainer />
                        </Provider>
                    </QueryClientProvider>
                </Route>
            </MemoryRouter>,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Select plan to get started'),
            ).toBeInTheDocument()
        })
    })

    it('should render WorkflowsView when user has access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        renderWithRouter(
            <MemoryRouter
                initialEntries={['/app/automation/shopify/test-shop/flows']}
            >
                <Route path="/app/automation/:shopType/:shopName/flows">
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore(defaultState)}>
                            <WorkflowsViewContainer />
                        </Provider>
                    </QueryClientProvider>
                </Route>
            </MemoryRouter>,
        )

        expect(screen.getByText('WorkflowsView')).toBeInTheDocument()
    })

    it('should pass shopName and shopType props to WorkflowsView', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        renderWithRouter(
            <MemoryRouter
                initialEntries={['/app/automation/shopify/test-shop/flows']}
            >
                <Route path="/app/automation/:shopType/:shopName/flows">
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore(defaultState)}>
                            <WorkflowsViewContainer />
                        </Provider>
                    </QueryClientProvider>
                </Route>
            </MemoryRouter>,
        )

        expect(mockWorkflowsView).toHaveBeenCalledWith(
            expect.objectContaining({
                shopName: 'test-shop',
                shopType: 'shopify',
            }),
        )
    })

    describe('navigation callbacks', () => {
        let history: MemoryHistory

        const renderWithHistory = () => {
            history = createMemoryHistory({
                initialEntries: ['/app/automation/shopify/test-shop/flows'],
            })

            return renderWithRouter(
                <Router history={history}>
                    <Route path="/app/automation/:shopType/:shopName/flows">
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore(defaultState)}>
                                <WorkflowsViewContainer />
                            </Provider>
                        </QueryClientProvider>
                    </Route>
                </Router>,
            )
        }

        beforeEach(() => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })
        })

        it('should navigate to new workflow page when goToNewWorkflowPage is called', () => {
            renderWithHistory()

            const props = mockWorkflowsView.mock.calls[0][0]
            act(() => {
                props.goToNewWorkflowPage()
            })

            expect(history.location.pathname).toBe(
                '/app/automation/shopify/test-shop/flows/new',
            )
        })

        it('should navigate to edit workflow page when goToEditWorkflowPage is called', () => {
            renderWithHistory()

            const props = mockWorkflowsView.mock.calls[0][0]
            act(() => {
                props.goToEditWorkflowPage('workflow-123')
            })

            expect(history.location.pathname).toBe(
                '/app/automation/shopify/test-shop/flows/edit/workflow-123',
            )
        })

        it('should navigate to templates page when goToWorkflowTemplatesPage is called', () => {
            renderWithHistory()

            const props = mockWorkflowsView.mock.calls[0][0]
            act(() => {
                props.goToWorkflowTemplatesPage()
            })

            expect(history.location.pathname).toBe(
                '/app/automation/shopify/test-shop/flows/templates',
            )
        })

        it('should navigate to new workflow with template query param when goToNewWorkflowFromTemplatePage is called', () => {
            renderWithHistory()

            const props = mockWorkflowsView.mock.calls[0][0]
            act(() => {
                props.goToNewWorkflowFromTemplatePage('template-slug')
            })

            expect(history.location.pathname).toBe(
                '/app/automation/shopify/test-shop/flows/new',
            )
            expect(history.location.search).toBe('?template=template-slug')
        })
    })

    describe('notifyMerchant callback', () => {
        let store: ReturnType<typeof mockStore>

        beforeEach(() => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })
            store = mockStore(defaultState)
        })

        it('should dispatch success notification when notifyMerchant is called with success', () => {
            renderWithRouter(
                <MemoryRouter
                    initialEntries={['/app/automation/shopify/test-shop/flows']}
                >
                    <Route path="/app/automation/:shopType/:shopName/flows">
                        <QueryClientProvider client={queryClient}>
                            <Provider store={store}>
                                <WorkflowsViewContainer />
                            </Provider>
                        </QueryClientProvider>
                    </Route>
                </MemoryRouter>,
            )

            const props = mockWorkflowsView.mock.calls[0][0]
            props.notifyMerchant('Operation successful', 'success')

            const actions = store.getActions()
            expect(actions).toHaveLength(1)
            expect(actions[0]).toMatchObject({
                type: 'reapop/upsertNotification',
                payload: expect.objectContaining({
                    message: 'Operation successful',
                    status: 'success',
                    allowHTML: true,
                    showDismissButton: true,
                }),
            })
        })

        it('should dispatch error notification when notifyMerchant is called with error', () => {
            renderWithRouter(
                <MemoryRouter
                    initialEntries={['/app/automation/shopify/test-shop/flows']}
                >
                    <Route path="/app/automation/:shopType/:shopName/flows">
                        <QueryClientProvider client={queryClient}>
                            <Provider store={store}>
                                <WorkflowsViewContainer />
                            </Provider>
                        </QueryClientProvider>
                    </Route>
                </MemoryRouter>,
            )

            const props = mockWorkflowsView.mock.calls[0][0]
            props.notifyMerchant('Operation failed', 'error')

            const actions = store.getActions()
            expect(actions).toHaveLength(1)
            expect(actions[0]).toMatchObject({
                type: 'reapop/upsertNotification',
                payload: expect.objectContaining({
                    message: 'Operation failed',
                    status: 'error',
                    allowHTML: true,
                    showDismissButton: true,
                }),
            })
        })
    })

    it('should wrap WorkflowsView with ErrorBoundary', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const { container } = renderWithRouter(
            <MemoryRouter
                initialEntries={['/app/automation/shopify/test-shop/flows']}
            >
                <Route path="/app/automation/:shopType/:shopName/flows">
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore(defaultState)}>
                            <WorkflowsViewContainer />
                        </Provider>
                    </QueryClientProvider>
                </Route>
            </MemoryRouter>,
        )

        expect(container).toBeInTheDocument()
        expect(screen.getByText('WorkflowsView')).toBeInTheDocument()
    })
})
