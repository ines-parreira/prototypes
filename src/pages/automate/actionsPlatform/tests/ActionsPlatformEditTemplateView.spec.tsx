import {QueryClientProvider} from '@tanstack/react-query'
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {produce} from 'immer'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {ulid} from 'ulidx'

import {
    useDownloadWorkflowConfigurationStepLogs,
    useListActionsApps,
} from 'models/workflows/queries'
import {WorkflowConfigurationBuilder} from 'pages/automate/workflows/models/workflowConfiguration.model'
import {RootState, StoreDispatch} from 'state/types'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import ActionsPlatformEditTemplateView from '../ActionsPlatformEditTemplateView'
import useEditActionTemplate from '../hooks/useEditActionTemplate'
import {ActionTemplate} from '../types'

jest.mock('models/workflows/queries')
jest.mock('../hooks/useEditActionTemplate')

const queryClient = mockQueryClient()
const mockUseEditActionTemplate = jest.mocked(useEditActionTemplate)
const mockUseDownloadWorkflowConfigurationStepLogs = jest.mocked(
    useDownloadWorkflowConfigurationStepLogs
)
const mockUseListActionsApps = jest.mocked(useListActionsApps)
const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])()
const mockEditActionTemplate = jest.fn()

mockUseEditActionTemplate.mockReturnValue({
    editActionTemplate: mockEditActionTemplate,
    isLoading: false,
})
mockUseDownloadWorkflowConfigurationStepLogs.mockReturnValue({
    mutateAsync: jest.fn(),
    isLoading: false,
} as unknown as ReturnType<typeof useDownloadWorkflowConfigurationStepLogs>)

const b = new WorkflowConfigurationBuilder({
    id: ulid(),
    name: 'test template',
    initialStep: {
        id: 'http_request1',
        kind: 'http-request',
        settings: {
            url: 'https://example.com',
            method: 'GET',
            headers: {},
            name: 'test http request',
            variables: [],
        },
    },
    entrypoints: [
        {
            kind: 'llm-conversation',
            trigger: 'llm-prompt',
            settings: {
                instructions: 'test',
                requires_confirmation: false,
            },
            deactivated_datetime: null,
        },
    ],
    triggers: [
        {
            kind: 'llm-prompt',
            settings: {
                custom_inputs: [],
                object_inputs: [],
                outputs: [],
            },
        },
    ],
})
b.insertHttpRequestConditionAndEndStepAndSelect('success')
b.selectParentStep()
b.insertHttpRequestConditionAndEndStepAndSelect('error')

const template = b.build()

describe('<ActionsPlatformEditTemplateView />', () => {
    beforeEach(() => {
        mockUseListActionsApps.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useListActionsApps>)
    })
    const renderApp = (template: ActionTemplate) => {
        render(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionsPlatformEditTemplateView template={template} />
                </QueryClientProvider>
            </Provider>
        )
    }
    it('should render edit template visual builder', () => {
        renderApp(template as ActionTemplate)

        expect(screen.getByDisplayValue(template.name)).toBeInTheDocument()
        expect(screen.getByDisplayValue(template.name)).toBeDisabled()
    })

    it('should render draft badge', () => {
        renderApp(
            produce(template as ActionTemplate, (draft) => {
                draft.is_draft = true
            })
        )

        expect(screen.getByText('draft')).toBeInTheDocument()
    })

    it('should reset graph after successful edit', async () => {
        renderApp(
            produce(template as ActionTemplate, (draft) => {
                draft.is_draft = true
            })
        )

        act(() => {
            fireEvent.click(screen.getByText('Publish'))
        })

        expect(screen.getByText('Are you sure?')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Confirm'))
        })

        await waitFor(() => {
            expect(screen.queryByText('Publish')).not.toBeInTheDocument()
        })
    })

    it('should require confirmation before saving a template', async () => {
        renderApp(template as ActionTemplate)

        act(() => {
            fireEvent.click(screen.getByTestId('rf__node-http_request1'))
        })

        act(() => {
            fireEvent.change(screen.getByDisplayValue('test http request'), {
                target: {value: 'http request'},
            })
        })

        act(() => {
            fireEvent.click(screen.getByText('Save'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Confirm'))
        })

        await waitFor(() => {
            expect(mockEditActionTemplate).toHaveBeenCalled()
        })
    })
})
