import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { ulid } from 'ulidx'

import { useFlag } from 'core/flags'
import {
    useDownloadWorkflowConfigurationStepLogs,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'
import { WorkflowConfigurationBuilder } from 'pages/automate/workflows/models/workflowConfiguration.model'
import { RootState, StoreDispatch } from 'state/types'

import ActionsPlatformEditStepView from '../ActionsPlatformEditStepView'
import useApps from '../hooks/useApps'
import useEditActionTemplate from '../hooks/useEditActionTemplate'
import { ActionTemplate } from '../types'

jest.mock('core/flags')
jest.mock('models/workflows/queries')
jest.mock('../hooks/useEditActionTemplate')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')

const mockUseFlag = jest.mocked(useFlag)
const mockUseApps = jest.mocked(useApps)
const mockUseEditActionTemplate = jest.mocked(useEditActionTemplate)
const mockUseDownloadWorkflowConfigurationStepLogs = jest.mocked(
    useDownloadWorkflowConfigurationStepLogs,
)
const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])()
const mockEditActionTemplate = jest.fn()
const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)

// Setup default mocks
mockUseApps.mockReturnValue({
    apps: [
        {
            icon: 'https://ok.com/1.png',
            id: 'someid',
            name: 'My test app',
            type: 'app',
        },
    ],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useApps>)

mockUseEditActionTemplate.mockReturnValue({
    editActionTemplate: mockEditActionTemplate,
    isLoading: false,
} as unknown as ReturnType<typeof useEditActionTemplate>)

mockUseDownloadWorkflowConfigurationStepLogs.mockReturnValue({
    error: null,
    isInitialLoading: false,
    isLoading: false,
    data: null,
    refetch: jest.fn(),
    dataUpdatedAt: 0,
    isError: false,
    isRefetching: false,
    isRefetchError: false,
    isSuccess: false,
    downloadWorkflowConfigurationStepLogs: jest.fn(),
} as unknown as ReturnType<typeof useDownloadWorkflowConfigurationStepLogs>)

mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
    error: null,
    isInitialLoading: false,
    isLoading: false,
    data: {
        items: [],
    },
    refetch: jest.fn(),
    dataUpdatedAt: 0,
    isError: false,
    isRefetching: false,
    isRefetchError: false,
    isSuccess: false,
} as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)

afterEach(() => {
    jest.clearAllMocks()
})

// Create a template with reusable_llm_prompt_trigger
const b = new WorkflowConfigurationBuilder({
    id: ulid(),
    name: 'test step',
    initialStep: {
        id: 'http_request1',
        kind: 'http-request',
        settings: {
            url: 'https://test.com',
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
                conditions: null,
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
    is_draft: false,
    available_languages: [],
})
b.insertHttpRequestConditionAndEndStepAndSelect('success')
b.selectParentStep()
b.insertHttpRequestConditionAndEndStepAndSelect('error')

const template = b.build()

describe('Liquid Template in Actions Platform', () => {
    describe('when liquid template feature flag is enabled for actionsPlatform', () => {
        beforeEach(() => {
            mockUseFlag.mockImplementation((flag, defaultValue) => {
                if (flag === FeatureFlagKey.LiquidTemplateStep) {
                    return {
                        actions: false,
                        actionsPlatform: true,
                        flows: false,
                    }
                }
                return defaultValue
            })
        })

        it('should show liquid template menu item when clicking add node button', async () => {
            render(
                <Provider store={mockStore}>
                    <ActionsPlatformEditStepView
                        template={template as ActionTemplate}
                    />
                </Provider>,
            )

            // Wait for the visual builder to render
            await waitFor(() => {
                expect(
                    screen.getByTestId('rf__node-http_request1'),
                ).toBeInTheDocument()
            })

            // Find and click the add node button (the + icon)
            const addNodeButtons = screen.getAllByText('add')
            // Click the first add button
            act(() => {
                fireEvent.click(addNodeButtons[0])
            })

            // Wait for the menu to open and check if liquid template option is visible
            await waitFor(() => {
                expect(
                    screen.getByText('Use Liquid templates to transform data'),
                ).toBeInTheDocument()
            })
        })
    })

    describe('when liquid template feature flag is disabled for actionsPlatform', () => {
        beforeEach(() => {
            mockUseFlag.mockImplementation((flag, defaultValue) => {
                if (flag === FeatureFlagKey.LiquidTemplateStep) {
                    return {
                        actions: false,
                        actionsPlatform: false,
                        flows: false,
                    }
                }
                return defaultValue
            })
        })

        it('should not show liquid template menu item', async () => {
            render(
                <Provider store={mockStore}>
                    <ActionsPlatformEditStepView
                        template={template as ActionTemplate}
                    />
                </Provider>,
            )

            // Wait for the visual builder to render
            await waitFor(() => {
                expect(
                    screen.getByTestId('rf__node-http_request1'),
                ).toBeInTheDocument()
            })

            // Find and click the add node button (the + icon)
            const addNodeButtons = screen.getAllByText('add')
            // Click the first add button
            act(() => {
                fireEvent.click(addNodeButtons[0])
            })

            // Wait for the menu to open and check liquid template option is NOT visible
            await waitFor(() => {
                expect(
                    screen.queryByText(
                        'Use Liquid templates to transform data',
                    ),
                ).not.toBeInTheDocument()
            })
        })
    })
})
