import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {produce} from 'immer'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {ulid} from 'ulidx'

import {useDownloadWorkflowConfigurationStepLogs} from 'models/workflows/queries'
import {WorkflowConfigurationBuilder} from 'pages/automate/workflows/models/workflowConfiguration.model'
import {RootState, StoreDispatch} from 'state/types'

import ActionsPlatformEditStepView from '../ActionsPlatformEditStepView'
import useEditActionTemplate from '../hooks/useEditActionTemplate'
import {ActionTemplate} from '../types'

jest.mock('models/workflows/queries')
jest.mock('../hooks/useEditActionTemplate')

const mockUseEditActionTemplate = jest.mocked(useEditActionTemplate)
const mockUseDownloadWorkflowConfigurationStepLogs = jest.mocked(
    useDownloadWorkflowConfigurationStepLogs
)
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
    name: 'test step',
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
            kind: 'reusable-llm-prompt-call-step',
            trigger: 'reusable-llm-prompt',
            settings: {
                requires_confirmation: false,
            },
            deactivated_datetime: null,
        },
    ],
    triggers: [
        {
            kind: 'reusable-llm-prompt',
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

describe('<ActionsPlatformEditStepView />', () => {
    it('should render edit step visual builder', () => {
        render(
            <Provider store={mockStore}>
                <ActionsPlatformEditStepView
                    template={template as ActionTemplate}
                />
            </Provider>
        )

        expect(screen.getByDisplayValue(template.name)).toBeInTheDocument()
        expect(screen.getByDisplayValue(template.name)).toBeDisabled()
    })

    it('should render draft badge', () => {
        render(
            <Provider store={mockStore}>
                <ActionsPlatformEditStepView
                    template={produce(template as ActionTemplate, (draft) => {
                        draft.is_draft = true
                    })}
                />
            </Provider>
        )

        expect(screen.getByText('draft')).toBeInTheDocument()
    })

    it('should reset graph after successful edit', async () => {
        render(
            <Provider store={mockStore}>
                <ActionsPlatformEditStepView
                    template={produce(template as ActionTemplate, (draft) => {
                        draft.is_draft = true
                    })}
                />
            </Provider>
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

    it('should require confirmation before saving a step', async () => {
        render(
            <Provider store={mockStore}>
                <ActionsPlatformEditStepView
                    template={template as ActionTemplate}
                />
            </Provider>
        )

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
