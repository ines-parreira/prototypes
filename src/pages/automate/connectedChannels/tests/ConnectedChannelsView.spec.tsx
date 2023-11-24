import {render, screen} from '@testing-library/react'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import _keyBy from 'lodash/keyBy'
import {BrowserRouter} from 'react-router-dom'
import {billingState} from 'fixtures/billing'
import {selfServiceConfiguration1} from 'fixtures/self_service_configurations'
import ConnectedChannelsView from '../ConnectedChannelsView'
import {IntegrationType} from '../../../../models/integration/constants'
import {ContactFormFixture} from '../../../settings/contactForm/fixtures/contacForm'
import {getSingleHelpCenterResponseFixture} from '../../../settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {initialState as articlesState} from '../../../../state/entities/helpCenter/articles'
import {initialState as categoriesState} from '../../../../state/entities/helpCenter/categories'
import {Components} from '../../../../rest_api/help_center_api/client.generated'
import {ShopType} from '../../../../models/selfServiceConfiguration/types'

const mockHistoryPush = jest.fn()

const SHOP_NAME = 'test-shop'

const mockSelfServiceConfiguration = {
    ...selfServiceConfiguration1,
    type: 'shopify' as ShopType,
    shop_name: 'my-shop',
}
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
jest.mock('pages/automate/common/hooks/useWorkflowConfigurations', () => {
    return {
        __esModule: true,
        default: () => ({
            isFetchPending: false,
            workflowConfigurations: [],
        }),
    }
})
jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useParams: jest.fn().mockReturnValue({
        shopType: 'shopify',
        shopName: SHOP_NAME,
    }),
    useLocation: () => '/',
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

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
                contactFormsAutomationSettings: {},
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

    render(
        <BrowserRouter>
            <Provider store={mockedStore}>
                <ConnectedChannelsView />
            </Provider>
        </BrowserRouter>
    )
}

describe('ConnectedChannelsView', () => {
    it('show connected channel when only contact form channels', () => {
        renderComponent({
            ...ContactFormFixture,
            shop_name: SHOP_NAME,
            help_center_id: null,
        })

        expect(screen.getByTestId('connected-channels')).toBeInTheDocument()
    })
})
