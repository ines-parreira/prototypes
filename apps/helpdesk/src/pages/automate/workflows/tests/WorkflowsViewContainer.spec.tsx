import React from 'react'

import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useLocation } from 'react-router-dom'

import { billingState } from 'fixtures/billing'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { RootState } from 'state/types'

import { WorkflowsViewContainer } from '../WorkflowsViewContainer'

jest.mock('hooks/aiAgent/useAiAgentAccess')

const mockWorkflowsView = jest.fn()
jest.mock('../WorkflowsView', () => ({
    __esModule: true,
    WorkflowsView: (props: unknown) => mockWorkflowsView(props),
}))

const defaultState = {
    billing: fromJS(billingState),
} as RootState
const route = '/app/automation/shopify/test-shop/flows'
const path = '/app/automation/:shopType/:shopName/flows'

const LocationPath = () => {
    const location = useLocation()

    return (
        <div aria-label="Current path">
            {location.pathname}
            {location.search}
        </div>
    )
}

const mockUseAiAgentAccess = useAiAgentAccess as jest.MockedFunction<
    typeof useAiAgentAccess
>

const renderComponent = () => {
    return render(
        <>
            <LocationPath />
            <WorkflowsViewContainer />
        </>,
        { initialEntries: [route], path, storeState: defaultState },
    )
}

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

        renderComponent()

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

        renderComponent()

        expect(screen.getByText('WorkflowsView')).toBeInTheDocument()
    })

    it('should pass shopName and shopType props to WorkflowsView', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        renderComponent()

        expect(mockWorkflowsView).toHaveBeenCalledWith(
            expect.objectContaining({
                shopName: 'test-shop',
                shopType: 'shopify',
            }),
        )
    })

    describe('navigation callbacks', () => {
        beforeEach(() => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })
        })

        it('should navigate to new workflow page when goToNewWorkflowPage is called', () => {
            renderComponent()

            const props = mockWorkflowsView.mock.calls[0][0]
            act(() => {
                props.goToNewWorkflowPage()
            })

            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                '/app/automation/shopify/test-shop/flows/new',
            )
        })

        it('should navigate to edit workflow page when goToEditWorkflowPage is called', () => {
            renderComponent()

            const props = mockWorkflowsView.mock.calls[0][0]
            act(() => {
                props.goToEditWorkflowPage('workflow-123')
            })

            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                '/app/automation/shopify/test-shop/flows/edit/workflow-123',
            )
        })

        it('should navigate to templates page when goToWorkflowTemplatesPage is called', () => {
            renderComponent()

            const props = mockWorkflowsView.mock.calls[0][0]
            act(() => {
                props.goToWorkflowTemplatesPage()
            })

            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                '/app/automation/shopify/test-shop/flows/templates',
            )
        })

        it('should navigate to new workflow with template query param when goToNewWorkflowFromTemplatePage is called', () => {
            renderComponent()

            const props = mockWorkflowsView.mock.calls[0][0]
            act(() => {
                props.goToNewWorkflowFromTemplatePage('template-slug')
            })

            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                '/app/automation/shopify/test-shop/flows/new?template=template-slug',
            )
        })
    })

    describe('notifyMerchant callback', () => {
        beforeEach(() => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })
        })

        it('should dispatch success notification when notifyMerchant is called with success', () => {
            const { store } = renderComponent()

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
            const { store } = renderComponent()

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

        const { container } = renderComponent()

        expect(container).toBeInTheDocument()
        expect(screen.getByText('WorkflowsView')).toBeInTheDocument()
    })
})
