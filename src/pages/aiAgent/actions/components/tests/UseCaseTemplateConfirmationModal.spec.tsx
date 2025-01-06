import {QueryClientProvider} from '@tanstack/react-query'
import {act, fireEvent, screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {useGetWorkflowConfigurationTemplateByIds} from 'models/workflows/queries'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'

const queryClient = mockQueryClient()

import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {renderWithRouter} from 'utils/testing'

import useUpsertAction from '../../hooks/useUpsertAction'
import {TemplateConfiguration} from '../../types'

import UseCaseTemplateConfirmationModal from '../UseCaseTemplateConfirmationModal'

jest.mock('models/workflows/queries')
jest.mock('common/flags')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('../../hooks/useUpsertAction')

const mockStore = configureMockStore([thunk])

const mockUseApps = jest.mocked(useApps)
const mockUseUpsertAction = jest.mocked(useUpsertAction)
const useGetWorkflowConfigurationTemplateByIdsMock = jest.mocked(
    useGetWorkflowConfigurationTemplateByIds
)

describe('<UseCaseTemplateConfirmationModal />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockFlags({})
        mockUseApps.mockReturnValue({
            isLoading: false,
            apps: [
                {
                    icon: 'https://shopify.com/icon.png',
                    id: 'shopify',
                    name: 'Shopify',
                    type: 'shopify',
                },
            ],
            actionsApps: [],
        } as unknown as ReturnType<typeof useApps>)

        mockUseUpsertAction.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        useGetWorkflowConfigurationTemplateByIdsMock.mockReturnValue([
            {
                data: {
                    name: 'step name',
                    apps: [
                        {
                            type: 'shopify',
                        },
                    ],
                    transitions: [],
                    available_languages: [],
                    created_datetime: '2021-09-01T00:00:00Z',
                    entrypoints: [],
                    id: 'step id',
                    initial_step_id: 'someid',
                    internal_id: 'someid',
                    is_draft: false,
                    steps: [
                        {
                            id: 'someid',
                            kind: 'cancel-order',
                            settings: {
                                order_external_id: 'someid',
                                customer_id: 'someid',
                                integration_id: 'someid',
                            },
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
                    updated_datetime: '2021-09-01T00:00:00Z',
                },
            },
        ] as unknown as ReturnType<
            typeof useGetWorkflowConfigurationTemplateByIds
        >)
    })

    it('should render modal select Steps and create new Action', () => {
        const templateConfiguration: TemplateConfiguration = {
            category: 'some category',
            apps: [],
            available_languages: [],
            created_datetime: '2021-09-01T00:00:00Z',
            entrypoints: [
                {
                    kind: 'llm-conversation',
                    trigger: 'llm-prompt',
                    settings: {
                        instructions: 'test template',
                        requires_confirmation: true,
                    },
                    deactivated_datetime: null,
                },
            ],
            id: 'some id',
            initial_step_id: 'some id',
            internal_id: 'some id',
            is_draft: false,
            transitions: [],
            entrypoint: null,
            name: 'template name',
            steps: [
                {
                    kind: 'reusable-llm-prompt-call',
                    id: 'someid',
                    settings: {
                        configuration_id: 'step id',
                        configuration_internal_id: 'some id',
                        values: {},
                    },
                },
            ],
            triggers: [
                {
                    kind: 'llm-prompt',
                    settings: {
                        conditions: {
                            and: [
                                {
                                    notEqual: [
                                        {
                                            var: 'objects.order.external_status',
                                        },
                                        'fulfilled',
                                    ],
                                },
                            ],
                        },
                        custom_inputs: [],
                        object_inputs: [],
                        outputs: [],
                    },
                },
            ],
            updated_datetime: '2021-09-01T00:00:00Z',
        }
        renderWithRouter(
            <Provider store={mockStore()}>
                <QueryClientProvider client={queryClient}>
                    <UseCaseTemplateConfirmationModal
                        isOpen={true}
                        setOpen={jest.fn()}
                        templateConfiguration={templateConfiguration}
                    />
                </QueryClientProvider>
            </Provider>
        )

        expect(
            screen.getByText(
                'First, select the apps you need to perform this Action'
            )
        ).toBeInTheDocument()

        expect(screen.getByText('template name')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Shopify'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Continue'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Back'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Continue'))
        })

        expect(
            screen.getByText('AI Agent will perform the following steps')
        ).toBeInTheDocument()
        expect(screen.getByText('Action conditions')).toBeInTheDocument()
        expect(
            screen.getByText('Order status is not fulfilled')
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'AI Agent will always ask for customer confirmation before performing the Action'
            )
        ).toBeInTheDocument()

        fireEvent.click(screen.getByText('Create and enable'))

        expect(mockUseUpsertAction).toHaveBeenCalled()
    })

    it('should render modal select Steps and customized Action', () => {
        const templateConfiguration: TemplateConfiguration = {
            category: 'some category',
            apps: [],
            available_languages: [],
            created_datetime: '2021-09-01T00:00:00Z',
            entrypoints: [
                {
                    kind: 'llm-conversation',
                    trigger: 'llm-prompt',
                    settings: {
                        instructions: 'test template',
                        requires_confirmation: true,
                    },
                    deactivated_datetime: null,
                },
            ],
            id: 'TEMPLATE_ID',
            initial_step_id: 'some id',
            internal_id: 'some id',
            is_draft: false,
            transitions: [],
            entrypoint: null,
            name: 'template name',
            steps: [
                {
                    kind: 'reusable-llm-prompt-call',
                    id: 'someid',
                    settings: {
                        configuration_id: 'step id',
                        configuration_internal_id: 'some id',
                        values: {},
                    },
                },
            ],
            triggers: [
                {
                    kind: 'llm-prompt',
                    settings: {
                        conditions: {
                            and: [
                                {
                                    notEqual: [
                                        {
                                            var: 'objects.order.external_status',
                                        },
                                        'fulfilled',
                                    ],
                                },
                            ],
                        },
                        custom_inputs: [],
                        object_inputs: [],
                        outputs: [],
                    },
                },
            ],
            updated_datetime: '2021-09-01T00:00:00Z',
        }
        const history = createMemoryHistory({
            initialEntries: ['/shopify/shopify-store/ai-agent/actions/new'],
        })

        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore()}>
                <QueryClientProvider client={queryClient}>
                    <UseCaseTemplateConfirmationModal
                        isOpen={true}
                        setOpen={jest.fn()}
                        templateConfiguration={templateConfiguration}
                    />
                </QueryClientProvider>
            </Provider>,
            {
                path: `/:shopType/:shopName/ai-agent/actions/`,
                route: '/shopify/shopify-store/ai-agent/actions/',
                history,
            }
        )

        expect(
            screen.getByText(
                'First, select the apps you need to perform this Action'
            )
        ).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Shopify'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Continue'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Customize'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/shopify/shopify-store/ai-agent/actions/new/new?template_id="TEMPLATE_ID"&step_id="step id"'
        )
    })
})
