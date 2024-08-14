import React from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {QueryClientProvider} from '@tanstack/react-query'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {IntegrationType} from 'models/integration/constants'
import {assumeMock, renderWithRouter} from 'utils/testing'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import {
    generateNewCustomActionConfigurationFormInput,
    getTriggerstByKind,
} from '../utils'
import {StoreIntegration} from '../../../../models/integration/types'
import TemplateActionsForm from '../components/TemplateActionsForm'
import {TemplateConfiguration, TemplateConfigurationFormInput} from '../types'

jest.mock('launchdarkly-react-client-sdk')
jest.mock('pages/automate/common/hooks/useStoreIntegrations')
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
const template = generateNewCustomActionConfigurationFormInput()
const llmPromptTrigger = getTriggerstByKind(template.triggers, 'llm-prompt')

const actionConfiguration: TemplateConfigurationFormInput = {
    name: template?.name,
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
                conditions: llmPromptTrigger?.settings.conditions,
            },
        },
    ],
    steps: [],
    transitions: [],
}
const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <TemplateActionsForm
                    initialConfigurationData={actionConfiguration}
                    templateConfiguration={template as TemplateConfiguration}
                    apiKeyModalIsOpen={false}
                    setApiKeyModalIsOpen={() => {}}
                />
            </QueryClientProvider>
        </Provider>,
        {
            path: `:shopType/:shopName/ai-agent/actions/new`,
            route: 'shopify/test-shop/ai-agent/actions/new',
        }
    )
const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>

describe('CustomActionsForm', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseStoreIntegrations.mockReturnValue(storeIntegrations)
        mockUseFlags.mockReturnValue({})
    })
    it('renders the form ', async () => {
        const {findByLabelText} = renderComponent()

        const nameInput = await findByLabelText('Name', {exact: false})

        expect(nameInput).toBeInTheDocument()
    })
})
