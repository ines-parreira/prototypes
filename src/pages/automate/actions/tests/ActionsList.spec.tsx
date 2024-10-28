import React from 'react'
import {fireEvent, screen} from '@testing-library/react'
import {BrowserRouter as Router} from 'react-router-dom'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {StoresWorkflowConfiguration} from '../types'
import ActionsList from '../components/ActionsList'

const mockActions: StoresWorkflowConfiguration = [
    {
        id: '1',
        internal_id: '1',
        name: 'Action 1',
        account_id: 1,
        steps: [],
        is_draft: false,
        transitions: [],
        available_languages: ['en-US'],
        triggers: [],
        entrypoints: [
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: {
                    instructions: 'instructions',
                    requires_confirmation: false,
                },
            },
        ],
        updated_datetime: '2023-01-01T00:00:00Z',
        short_description: 'Action 1 short description',
    },
    {
        id: '2',
        internal_id: '2',
        name: 'Action 2',
        account_id: 1,
        steps: [],
        is_draft: false,
        transitions: [],
        available_languages: ['en-US'],
        triggers: [],
        entrypoints: [
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: {
                    instructions: 'instructions',
                    requires_confirmation: false,
                },
            },
        ],
        updated_datetime: '2023-01-02T00:00:00Z',
        short_description: 'Action 2 short description',
    },
]

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

describe('ActionsList', () => {
    it('sorts actions by updated date in ascending order', () => {
        renderWithQueryClientProvider(
            <Router>
                <Provider store={mockStore()}>
                    <ActionsList actions={mockActions} />
                </Provider>
            </Router>
        )

        // Initial order should be descending
        const sortedActions = screen.getAllByText(/Action \d/)
        expect(sortedActions[0]).toHaveTextContent('Action 2')
        expect(sortedActions[1]).toHaveTextContent('Action 1')

        // Click to sort ascending
        const lastUpdatedHeader = screen.getByText('LAST UPDATED')
        fireEvent.click(lastUpdatedHeader)

        const sortedActionsAsc = screen.getAllByText(/Action \d/)
        expect(sortedActionsAsc[0]).toHaveTextContent('Action 1')
        expect(sortedActionsAsc[1]).toHaveTextContent('Action 2')
    })

    it('sorts actions by updated date in descending order', () => {
        renderWithQueryClientProvider(
            <Router>
                <Provider store={mockStore()}>
                    <ActionsList actions={mockActions} />
                </Provider>
            </Router>
        )

        // Click to sort ascending
        const lastUpdatedHeader = screen.getByText('LAST UPDATED')
        fireEvent.click(lastUpdatedHeader)
        fireEvent.click(lastUpdatedHeader)

        const sortedActionsDesc = screen.getAllByText(/Action \d/)
        expect(sortedActionsDesc[0]).toHaveTextContent('Action 2')
        expect(sortedActionsDesc[1]).toHaveTextContent('Action 1')
    })
})
