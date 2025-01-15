import {render} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import React from 'react'
import {Provider} from 'react-redux'
import {Router} from 'react-router-dom'
import configureStore from 'redux-mock-store'

import * as segment from 'common/segment'

import WorkflowEditorViewContainer from '../WorkflowEditorViewContainer'

const mockStore = configureStore([])

jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('state/billing/selectors', () => ({
    getHasAutomate: jest.fn(() => true),
}))

jest.mock('common/segment', () => ({
    SegmentEvent: {
        FlowBuilderViewed: 'FlowBuilderViewed',
        FlowBuilderSaved: 'FlowBuilderSaved',
    },
    logEvent: jest.fn(),
}))

describe('WorkflowEditorViewContainer', () => {
    let history: ReturnType<typeof createMemoryHistory>

    const renderComponent = (storeState = {billing: {hasAutomate: true}}) => {
        const store = mockStore(storeState)
        return render(
            <Provider store={store}>
                <Router history={history}>
                    <WorkflowEditorViewContainer />
                </Router>
            </Provider>
        )
    }

    beforeEach(() => {
        history = createMemoryHistory()
    })

    it('redirects to /app/automation if hasAutomate is false', () => {
        const storeState = {billing: {hasAutomate: false}}
        renderComponent(storeState)
        expect(history.location.pathname).toBe('/app/automation')
    })

    it('logs FlowBuilderViewed event on mount', () => {
        renderComponent()
        expect(segment.logEvent).toHaveBeenCalledWith(
            segment.SegmentEvent.FlowBuilderViewed,
            {
                type: 'builder',
                source: 'builder',
            }
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
})
