import {QueryClientProvider} from '@tanstack/react-query'
import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import _keyBy from 'lodash/keyBy'
import React from 'react'
import {Provider} from 'react-redux'
import * as ReactRouterDom from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {billingState} from 'fixtures/billing'
import {selfServiceConfiguration1} from 'fixtures/self_service_configurations'
import {
    useListWorkflowEntryPoints,
    useGetWorkflowConfigurations,
} from 'models/workflows/queries'
import useSelfServiceHelpCenterChannels, {
    SelfServiceHelpCenterChannel,
} from 'pages/automate/common/hooks/useSelfServiceHelpCenterChannels'
import {Components} from 'rest_api/help_center_api/client.generated'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {IntegrationType} from '../../../../models/integration/constants'
import {ShopType} from '../../../../models/selfServiceConfiguration/types'
import {initialState as articlesState} from '../../../../state/entities/helpCenter/articles'
import {initialState as categoriesState} from '../../../../state/entities/helpCenter/categories'
import {ContactFormFixture} from '../../../settings/contactForm/fixtures/contacForm'
import {getSingleHelpCenterResponseFixture} from '../../../settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import ConnectedChannelsView from '../DEPRECATED_ConnectedChannelsView'

const mockHistoryPush = jest.fn()

const SHOP_NAME = 'test-shop'
const OTHER_SHOP_NAME = 'other-shop'

const mockHelpCenterChannels = [
    {
        type: 'help-center',
        value: {
            created_datetime: '2023-12-21T13:01:16.097Z',
            updated_datetime: '2024-04-26T09:16:46.329Z',
            deleted_datetime: null,
            automation_settings_id: 7,
            deactivated_datetime: null,
            default_locale: 'en-US',
            email_integration: {
                id: 5,
                email: 'zp7d01g9zorymjke@email-itay.gorgi.us',
            },
            id: 1,
            name: 'Acme Help Center',
            powered_by_deactivated_datetime: null,
            search_deactivated_datetime: null,
            self_service_deactivated_datetime: null,
            shop_name: SHOP_NAME,
            subdomain: 'acme',
            supported_locales: ['en-US'],
            type: 'faq',
            layout: 'default',
            account_id: 1,
            translations: [],
            redirects: [],
        },
    },
] as unknown as SelfServiceHelpCenterChannel[]

const mockSelfServiceConfiguration = {
    ...selfServiceConfiguration1,
    type: 'shopify' as ShopType,
    shop_name: SHOP_NAME,
}
jest.mock('models/workflows/queries', () => ({
    useGetWorkflowConfigurations: jest.fn(),
}))
jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration', () => {
    return {
        __esModule: true,
        default: () => ({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: mockSelfServiceConfiguration,
            handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
        }),
    }
})
jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useParams: jest.fn(),
    useLocation: () => '/',
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))
const mockUseParams = jest.spyOn(ReactRouterDom, 'useParams')
jest.mock('models/workflows/queries', () => ({
    useListWorkflowEntryPoints: jest.fn(),
    useGetWorkflowConfigurations: jest.fn(),
}))
jest.mock('pages/automate/common/hooks/useSelfServiceHelpCenterChannels')
const mockedUseListWorkflowEntryPoints = jest.mocked(useListWorkflowEntryPoints)
const mockedUseWorkflowConfigurations = jest.mocked(
    useGetWorkflowConfigurations
)
const mockedUseSelfServiceHelpCenterChannels = jest.mocked(
    useSelfServiceHelpCenterChannels
)

const {BrowserRouter} = ReactRouterDom

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Shopify,
                meta: {
                    shop_name: SHOP_NAME,
                },
            },
        ],
    }),
    billing: fromJS(billingState),
}

const mockStore = configureMockStore([thunk])

const renderComponent = (
    contactForm: Components.Schemas.ContactFormDto = ContactFormFixture
) => {
    const mockedStore = mockStore({
        ...defaultState,
        entities: {
            contactForm: {
                contactFormsAutomationSettings: {
                    automationSettingsByContactFormId: {
                        [contactForm.id]: {
                            workflows: [],
                            order_management: {enabled: false},
                        },
                    },
                },
                contactForms: {
                    contactFormById: _keyBy([contactForm], 'id'),
                },
            },
            selfServiceConfigurations: {},
            helpCenter: {
                helpCenters: {
                    helpCentersById: {
                        '1': getSingleHelpCenterResponseFixture,
                    },
                },
                helpCentersAutomationSettings: {},
                articles: articlesState,
                categories: categoriesState,
            },
        },
    })
    mockedUseWorkflowConfigurations.mockReturnValue({
        isLoading: false,
        data: [mockSelfServiceConfiguration],
    } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)

    const queryClientMock = mockQueryClient()

    render(
        <QueryClientProvider client={queryClientMock}>
            <BrowserRouter>
                <Provider store={mockedStore}>
                    <ConnectedChannelsView />
                </Provider>
            </BrowserRouter>
        </QueryClientProvider>
    )
}

describe('ConnectedChannelsView', () => {
    beforeEach(() => {
        mockUseParams.mockReturnValue({
            shopType: 'shopify',
            shopName: SHOP_NAME,
        })
        mockedUseListWorkflowEntryPoints.mockReturnValue({
            isLoading: false,
            data: {},
        } as unknown as ReturnType<typeof useListWorkflowEntryPoints>)
        mockedUseSelfServiceHelpCenterChannels.mockReturnValue(
            mockHelpCenterChannels
        )
    })
    it('show connected channel with only contact form channel', () => {
        mockedUseSelfServiceHelpCenterChannels.mockReturnValue(
            [] as unknown as SelfServiceHelpCenterChannel[]
        )
        renderComponent({
            ...ContactFormFixture,
            shop_name: SHOP_NAME,
            help_center_id: null,
        })

        expect(screen.getByTestId('connected-channels')).toBeInTheDocument()
        expect(screen.getByText('Connect a Chat')).toBeInTheDocument()
        expect(screen.getByText('Connect a Help Center')).toBeInTheDocument()
        expect(
            screen.getByText('Contact Form: SF Bicycles Contact Form')
        ).toBeInTheDocument()
    })
    it('show connected channel with only Help Center channel', () => {
        renderComponent(ContactFormFixture)

        expect(screen.getByTestId('connected-channels')).toBeInTheDocument()
        expect(screen.getByText('Connect a Chat')).toBeInTheDocument()
        expect(screen.getByText('Connect a Contact Form')).toBeInTheDocument()
        expect(
            screen.getByText('Help Center: Acme Help Center')
        ).toBeInTheDocument()
    })
    it('show Order Management toggle when Help Center channel connected to Shopify store', () => {
        renderComponent(ContactFormFixture)

        expect(
            screen.getByText('Help Center: Acme Help Center')
        ).toBeInTheDocument()
        expect(screen.getByText('Order Management')).toBeInTheDocument()
    })
    it('hide Order Management toggle when Help Center channel connected to non Shopify store', () => {
        mockUseParams.mockReturnValue({
            shopType: 'bigcommerce',
            shopName: OTHER_SHOP_NAME,
        })
        renderComponent(ContactFormFixture)

        expect(
            screen.getByText('Help Center: Acme Help Center')
        ).toBeInTheDocument()
        expect(screen.queryByText('Order Management')).not.toBeInTheDocument()
    })
})
