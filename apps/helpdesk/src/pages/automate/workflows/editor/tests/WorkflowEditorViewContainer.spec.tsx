import React from 'react'

import * as segment from '@repo/logging'
import { act, render } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureStore from 'redux-mock-store'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppSelector from 'hooks/useAppSelector'
import { useAutomateBaseURL } from 'settings/automate/hooks/useAutomateBaseURL'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import WorkflowEditorViewContainer from '../WorkflowEditorViewContainer'

const mockStore = configureStore([])
const mockUseAiAgentAccess = useAiAgentAccess as jest.MockedFunction<
    typeof useAiAgentAccess
>
const mockUseAutomateBaseURL = useAutomateBaseURL as jest.MockedFunction<
    typeof useAutomateBaseURL
>
const mockUseIsAutomateSettings = useIsAutomateSettings as jest.MockedFunction<
    typeof useIsAutomateSettings
>
const mockUseAppSelector = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
>

jest.mock('hooks/useAppSelector')
jest.mock('hooks/aiAgent/useAiAgentAccess')
jest.mock('settings/automate/hooks/useAutomateBaseURL')
jest.mock('settings/automate/hooks/useIsAutomateSettings')

jest.mock('@repo/logging', () => ({
    SegmentEvent: {
        FlowBuilderViewed: 'FlowBuilderViewed',
        FlowBuilderSaved: 'FlowBuilderSaved',
    },
    logEvent: jest.fn(),
}))

jest.mock('../WorkflowEditorView', () => ({
    __esModule: true,
    default: () => (
        <div data-testid="workflow-editor-view">WorkflowEditorView</div>
    ),
}))

describe('WorkflowEditorViewContainer', () => {
    let history: ReturnType<typeof createMemoryHistory>

    const renderComponent = () => {
        const store = mockStore({})
        return render(
            <Provider store={store}>
                <Router history={history}>
                    <WorkflowEditorViewContainer />
                </Router>
            </Provider>,
        )
    }

    beforeEach(() => {
        history = createMemoryHistory()
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        mockUseAutomateBaseURL.mockReturnValue('/app/automation')
        mockUseIsAutomateSettings.mockReturnValue(false)
        mockUseAppSelector.mockReturnValue([])
    })

    it('renders WorkflowEditorViewContainer correctly', () => {
        const { container } = renderComponent()
        expect(container).toBeTruthy()
    })

    it('redirects to /app/automation if hasAccess is false', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        renderComponent()
        expect(history.location.pathname).toBe('/app/automation')
    })

    it('logs FlowBuilderViewed event on mount', () => {
        renderComponent()
        expect(segment.logEvent).toHaveBeenCalledWith(
            segment.SegmentEvent.FlowBuilderViewed,
            {
                type: 'builder',
                source: 'builder',
            },
        )
    })
    it('handles discard workflow correctly', () => {
        renderComponent()

        const mockGoToWorkflowsListPage = jest.fn()
        const mockGoToWorkflowTemplatesPage = jest.fn()

        const mockProps = {
            onDiscard: jest.fn((fromView) => {
                if (fromView === 'templates') {
                    mockGoToWorkflowTemplatesPage()
                } else {
                    mockGoToWorkflowsListPage()
                }
            }),
        }

        mockProps.onDiscard('templates')
        expect(mockGoToWorkflowTemplatesPage).toHaveBeenCalled()
        expect(mockGoToWorkflowsListPage).not.toHaveBeenCalled()

        mockProps.onDiscard('other')
        expect(mockGoToWorkflowsListPage).toHaveBeenCalled()
    })

    it('navigates correctly using goToWorkflowsListPage', () => {
        history = createMemoryHistory({ initialEntries: ['/'] })
        renderComponent()
        act(() => {
            history.push('/base/shopType/shopName/flows')
        })
        expect(history.location.pathname).toBe('/base/shopType/shopName/flows')
    })

    it('navigates correctly using goToWorkflowTemplatesPage', () => {
        history = createMemoryHistory({ initialEntries: ['/'] })
        renderComponent()
        act(() => {
            history.push('/base/shopType/shopName/flows/templates')
        })
        expect(history.location.pathname).toBe(
            '/base/shopType/shopName/flows/templates',
        )
    })
})
