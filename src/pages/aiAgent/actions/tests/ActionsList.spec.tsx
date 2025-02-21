import {fireEvent, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import {BrowserRouter as Router} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    useGetStoreApps,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'
import useAddStoreApp from 'pages/aiAgent/actions/hooks/useAddStoreApp'
import useDeleteAction from 'pages/aiAgent/actions/hooks/useDeleteAction'
import useUpsertAction from 'pages/aiAgent/actions/hooks/useUpsertAction'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'

import ActionsList from '../components/ActionsList'

import {StoresWorkflowConfiguration} from '../types'

jest.mock('models/workflows/queries')
jest.mock('pages/aiAgent/actions/hooks/useAddStoreApp')
jest.mock('pages/aiAgent/actions/hooks/useDeleteAction')
jest.mock('pages/aiAgent/actions/hooks/useUpsertAction')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')

const mockUseGetStoreApps = jest.mocked(useGetStoreApps)
const mockUseAddStoreApp = jest.mocked(useAddStoreApp)
const mockUseApps = jest.mocked(useApps)
const mockUseUpsertAction = jest.mocked(useUpsertAction)
const mockUseDeleteAction = jest.mocked(useDeleteAction)
const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates
)
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

const defaultState = {
    integrations: fromJS({integrations: []}),
} as RootState

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

describe('ActionsList', () => {
    beforeEach(() => {
        mockUseGetStoreApps.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetStoreApps>)
        mockUseAddStoreApp.mockReturnValue(jest.fn())
        mockUseApps.mockReturnValue({
            apps: [],
            isLoading: false,
            actionsApps: [],
        })
        mockUseDeleteAction.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof useDeleteAction>)
        mockUseUpsertAction.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
    })

    it('sorts actions by updated date in ascending order', () => {
        renderWithQueryClientProvider(
            <Router>
                <Provider store={mockStore(defaultState)}>
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
                <Provider store={mockStore(defaultState)}>
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
