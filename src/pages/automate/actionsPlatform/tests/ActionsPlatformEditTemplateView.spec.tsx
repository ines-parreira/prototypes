import {QueryClientProvider} from '@tanstack/react-query'
import {act, fireEvent, screen, waitFor} from '@testing-library/react'
import {produce} from 'immer'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {ulid} from 'ulidx'

import {
    useDownloadWorkflowConfigurationStepLogs,
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
} from 'models/workflows/queries'
import {WorkflowConfigurationBuilder} from 'pages/automate/workflows/models/workflowConfiguration.model'
import {RootState, StoreDispatch} from 'state/types'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {renderWithRouter} from 'utils/testing'

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
const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates
)
const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])({
    integrations: fromJS({
        integrations: [],
    }),
    billing: fromJS({
        products: [],
    }),
} as RootState)
const mockEditActionTemplate = jest.fn()

mockUseEditActionTemplate.mockReturnValue({
    editActionTemplate: mockEditActionTemplate,
    isLoading: false,
})
mockUseDownloadWorkflowConfigurationStepLogs.mockReturnValue({
    mutateAsync: jest.fn(),
    isLoading: false,
} as unknown as ReturnType<typeof useDownloadWorkflowConfigurationStepLogs>)
mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
    data: [],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
mockUseListActionsApps.mockReturnValue({
    data: [],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useListActionsApps>)

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
    const renderApp = (template: ActionTemplate) => {
        renderWithRouter(
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
    })

    it('should render publish button', () => {
        renderApp(
            produce(template as ActionTemplate, (draft) => {
                draft.is_draft = true
            })
        )

        expect(screen.getByText('Publish')).toBeInTheDocument()
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

        await waitFor(() => {
            expect(screen.queryByText('Publish')).not.toBeInTheDocument()
        })
    })

    it('should display errors', () => {
        const mockEditActionTemplate = jest.fn()

        mockUseEditActionTemplate.mockReturnValue({
            editActionTemplate: mockEditActionTemplate,
            isLoading: false,
        })

        renderApp(template as ActionTemplate)

        act(() => {
            fireEvent.change(screen.getByDisplayValue(template.name), {
                target: {value: ''},
            })
        })

        act(() => {
            fireEvent.click(screen.getByText('Save changes'))
        })

        expect(mockEditActionTemplate).not.toHaveBeenCalled()
        expect(screen.getByText('Action name is required')).toBeInTheDocument()
    })
})
