import React from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {QueryClientProvider} from '@tanstack/react-query'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {ulid} from 'ulidx'
import {screen, fireEvent, act} from '@testing-library/react'
import {useFlag} from 'common/flags'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {IntegrationType} from 'models/integration/constants'
import {assumeMock, renderWithRouter} from 'utils/testing'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import {StoreIntegration} from 'models/integration/types'

import TemplateActionsForm from '../components/TemplateActionsForm'

jest.mock('launchdarkly-react-client-sdk')
jest.mock('pages/automate/common/hooks/useStoreIntegrations')

jest.mock('common/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

const mockUseStoreIntegrations = assumeMock(useStoreIntegrations)
const storeIntegrations = [
    {
        id: 1,
        name: 'Shopify Store 1',
        type: IntegrationType.Shopify,
        meta: {shop_name: 'test-shop'},
    },
    {
        id: 2,
        name: 'Shopify Store 2',
        type: IntegrationType.Shopify,
        meta: {shop_name: 'Shop2'},
    },
    {
        id: 3,
        name: 'BigCommerce Store 1',
        type: IntegrationType.BigCommerce,
        meta: {store_hash: 'Shop3'},
    },
] as unknown as StoreIntegration[]
const mockStore = configureMockStore([thunk])

const MOCK_EMAIL_ADDRESS = 'test@mail.com'

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Email,
                name: 'My email integration',
                meta: {
                    address: MOCK_EMAIL_ADDRESS,
                },
            },
            {
                id: 1,
                name: 'Shopify Store 1',
                type: IntegrationType.Shopify,
                meta: {shop_name: 'test-shop', oauth: {status: 'success'}},
            },
        ],
    }),
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': {id: 1, name: 'help center 1', type: 'faq'},
                    '2': {id: 2, name: 'help center 2', type: 'faq'},
                },
            },
        },
    },
}

const queryClient = mockQueryClient()

const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>

describe('<TemplateActionsForm />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseStoreIntegrations.mockReturnValue(storeIntegrations)
        mockUseFlags.mockReturnValue({})
        mockUseFlag.mockReturnValue(true)
    })

    it('renders the form', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <TemplateActionsForm
                        initialConfigurationData={{
                            name: '',
                            initial_step_id: null,
                            available_languages: [],
                            is_draft: false,
                            apps: [{type: 'shopify'}],
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
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
                            steps: [],
                            transitions: [],
                        }}
                        templateConfiguration={{
                            name: '',
                            internal_id: ulid(),
                            id: ulid(),
                            initial_step_id: '',
                            is_draft: false,
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
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
                            steps: [],
                            transitions: [],
                            available_languages: [],
                            created_datetime: new Date().toISOString(),
                            updated_datetime: new Date().toISOString(),
                            apps: [{type: 'shopify'}],
                        }}
                    />
                </QueryClientProvider>
            </Provider>,
            {
                path: `/:shopType/:shopName/ai-agent/actions/new`,
                route: '/shopify/test-shop/ai-agent/actions/new',
            }
        )

        expect(
            screen.getByLabelText('Name', {exact: false})
        ).toBeInTheDocument()

        expect(screen.queryByText('View Action Events')).not.toBeInTheDocument()
    })

    it('should open app authentication modal if API key is missing', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <TemplateActionsForm
                        initialConfigurationData={{
                            name: '',
                            initial_step_id: null,
                            available_languages: [],
                            is_draft: false,
                            apps: [
                                {type: 'app', app_id: 'test', api_key: null},
                            ],
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
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
                            steps: [],
                            transitions: [],
                        }}
                        templateConfiguration={{
                            name: '',
                            internal_id: ulid(),
                            id: ulid(),
                            initial_step_id: '',
                            is_draft: false,
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
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
                            steps: [],
                            transitions: [],
                            available_languages: [],
                            created_datetime: new Date().toISOString(),
                            updated_datetime: new Date().toISOString(),
                            apps: [
                                {type: 'app', app_id: 'test', api_key: null},
                            ],
                        }}
                    />
                </QueryClientProvider>
            </Provider>,
            {
                path: `/:shopType/:shopName/ai-agent/actions/new`,
                route: '/shopify/test-shop/ai-agent/actions/new',
            }
        )

        expect(screen.getByText('Action details')).toBeInTheDocument()
    })

    it('should not open app authentication modal if API key is already provided', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <TemplateActionsForm
                        initialConfigurationData={{
                            name: '',
                            initial_step_id: null,
                            available_languages: [],
                            is_draft: false,
                            apps: [
                                {type: 'app', app_id: 'test', api_key: 'test'},
                            ],
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
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
                            steps: [],
                            transitions: [],
                        }}
                        templateConfiguration={{
                            name: '',
                            internal_id: ulid(),
                            id: ulid(),
                            initial_step_id: '',
                            is_draft: false,
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
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
                            steps: [],
                            transitions: [],
                            available_languages: [],
                            created_datetime: new Date().toISOString(),
                            updated_datetime: new Date().toISOString(),
                            apps: [
                                {type: 'app', app_id: 'test', api_key: null},
                            ],
                        }}
                    />
                </QueryClientProvider>
            </Provider>,
            {
                path: `/:shopType/:shopName/ai-agent/actions/new`,
                route: '/shopify/test-shop/ai-agent/actions/new',
            }
        )

        expect(screen.queryByText('Action details')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Connect 3rd party app')
        ).not.toBeInTheDocument()
    })

    it('should display view app authentication button', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <TemplateActionsForm
                        initialConfigurationData={{
                            name: '',
                            initial_step_id: null,
                            internal_id: ulid(),
                            available_languages: [],
                            is_draft: false,
                            apps: [
                                {type: 'app', app_id: 'test', api_key: 'test'},
                            ],
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
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
                            steps: [],
                            transitions: [],
                        }}
                        templateConfiguration={{
                            name: '',
                            internal_id: ulid(),
                            id: ulid(),
                            initial_step_id: '',
                            is_draft: false,
                            entrypoints: [
                                {
                                    kind: 'llm-conversation',
                                    trigger: 'llm-prompt',
                                    settings: {
                                        instructions: '',
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
                            steps: [],
                            transitions: [],
                            available_languages: [],
                            created_datetime: new Date().toISOString(),
                            updated_datetime: new Date().toISOString(),
                            apps: [
                                {type: 'app', app_id: 'test', api_key: null},
                            ],
                        }}
                    />
                </QueryClientProvider>
            </Provider>
        )

        act(() => {
            fireEvent.click(screen.getByText('View App Authentication'))
        })
        expect(screen.queryByText('Connect 3rd party app')).toBeVisible()

        expect(
            screen.getByText('Discard changes').closest('button')
        ).toHaveAttribute('aria-disabled', 'true')

        act(() => {
            fireEvent.change(screen.getByLabelText('API key', {exact: false}), {
                target: {value: 'update test'},
            })
        })

        expect(screen.getByLabelText('API key', {exact: false})).toHaveValue(
            'update test'
        )

        fireEvent.click(screen.getByText('Discard changes'))

        expect(screen.getByLabelText('API key', {exact: false})).toHaveValue(
            'test'
        )
        expect(screen.queryByText('View Action Events')).toBeInTheDocument()
    })
})
