import {act, fireEvent, screen, waitFor} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {IntegrationType} from 'models/integration/constants'
import {
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
} from 'models/workflows/queries'
import {RootState, StoreDispatch} from 'state/types'

import {renderWithRouterAndDnD} from 'utils/testing'

import ActionsPlatformCreateUseCaseTemplateView from '../ActionsPlatformCreateUseCaseTemplateView'
import useApps from '../hooks/useApps'
import useCreateActionTemplate from '../hooks/useCreateActionTemplate'

jest.mock('models/workflows/queries')
jest.mock('../hooks/useApps')
jest.mock('../hooks/useCreateActionTemplate')

const mockUseListActionsApps = jest.mocked(useListActionsApps)
const mockUseApps = jest.mocked(useApps)
const mockUseCreateActionTemplate = jest.mocked(useCreateActionTemplate)
const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates
)
const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])({
    integrations: fromJS({
        integrations: [],
    }),
} as RootState)

mockUseListActionsApps.mockReturnValue({
    data: [
        {
            id: 'someid2',
            auth_type: 'api-key',
            auth_settings: {
                url: 'https://example.com',
            },
        },
    ],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useListActionsApps>)
mockUseApps.mockReturnValue({
    apps: [
        {
            id: 'someid2',
            name: 'test app',
            icon: '/assets/img/integrations/app.png',
            type: IntegrationType.App,
        },
        {
            icon: '/assets/img/integrations/shopify.png',
            id: 'shopify',
            name: 'Shopify',
            type: IntegrationType.Shopify,
        },
        {
            icon: '/assets/img/integrations/recharge.png',
            id: 'recharge',
            name: 'Recharge',
            type: IntegrationType.Recharge,
        },
    ],
    isLoading: false,
} as unknown as ReturnType<typeof mockUseApps>)
mockUseCreateActionTemplate.mockReturnValue({
    createActionTemplate: jest.fn(),
    isLoading: false,
})
mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
    data: [
        {
            name: 'Cancel order',
            apps: [
                {
                    type: 'shopify',
                },
            ],
            transitions: [],
            available_languages: [],
            created_datetime: '2021-09-01T00:00:00Z',
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
            id: 'someid',
            initial_step_id: 'someid',
            internal_id: 'someid',
            is_draft: false,
            steps: [],
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
            updated_datetime: '2021-09-01T00:00:00Z',
        },
    ],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)

describe('<ActionsPlatformCreateUseCaseTemplateView />', () => {
    it('should render create use case template simplified step builder', () => {
        renderWithRouterAndDnD(
            <Provider store={mockStore}>
                <ActionsPlatformCreateUseCaseTemplateView />
            </Provider>
        )

        expect(screen.getByText('Add Step')).toBeInTheDocument()
    })

    it('should create Action use case template', async () => {
        const mockCreateActionTemplate = jest.fn()

        mockUseCreateActionTemplate.mockReturnValue({
            createActionTemplate: mockCreateActionTemplate,
            isLoading: false,
        })

        const history = createMemoryHistory()
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouterAndDnD(
            <Provider store={mockStore}>
                <ActionsPlatformCreateUseCaseTemplateView />
            </Provider>,
            {
                history,
            }
        )

        act(() => {
            fireEvent.focus(screen.getByRole('combobox'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Orders'))
        })

        act(() => {
            fireEvent.change(screen.queryAllByRole('textbox')[0], {
                target: {value: 'Some name'},
            })
        })

        act(() => {
            fireEvent.change(screen.queryAllByRole('textbox')[1], {
                target: {value: 'Some description'},
            })
        })

        act(() => {
            fireEvent.change(screen.queryAllByRole('textbox')[0], {
                target: {value: 'Some name'},
            })
        })

        act(() => {
            fireEvent.change(screen.queryAllByRole('textbox')[1], {
                target: {value: 'Some description'},
            })
        })

        act(() => {
            fireEvent.click(screen.getByText('Add Step'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Shopify'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Cancel order'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Create Action'))
        })

        expect(mockCreateActionTemplate).toHaveBeenCalledWith([
            {
                internal_id: expect.any(String),
            },
            expect.objectContaining({
                name: 'Some name',
                steps: [
                    {
                        id: expect.any(String),
                        kind: 'reusable-llm-prompt-call',
                        settings: expect.objectContaining({
                            configuration_id: 'someid',
                            configuration_internal_id: 'someid',
                            custom_inputs: {},
                            objects: {},
                            values: {},
                        }),
                    },
                    {
                        id: expect.any(String),
                        kind: 'end',
                        settings: {
                            success: true,
                        },
                    },
                    {
                        id: expect.any(String),
                        kind: 'end',
                        settings: {
                            success: false,
                        },
                    },
                ],
                entrypoints: [
                    {
                        kind: 'llm-conversation',
                        trigger: 'llm-prompt',
                        settings: {
                            instructions: 'Some description',
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
                            conditions: null,
                        },
                    },
                ],
                category: 'Orders',
            }),
        ])

        await waitFor(() => {
            expect(historyPushSpy).toHaveBeenCalledWith(
                '/app/automation/actions-platform/use-cases'
            )
        })
    })

    it('should display errors', () => {
        const mockCreateActionTemplate = jest.fn()

        mockUseCreateActionTemplate.mockReturnValue({
            createActionTemplate: mockCreateActionTemplate,
            isLoading: false,
        })

        renderWithRouterAndDnD(
            <Provider store={mockStore}>
                <ActionsPlatformCreateUseCaseTemplateView />
            </Provider>
        )

        act(() => {
            fireEvent.click(screen.getByText('Create Action'))
        })

        expect(mockCreateActionTemplate).not.toHaveBeenCalled()
        expect(screen.getByText('Action name is required')).toBeInTheDocument()
    })
})
