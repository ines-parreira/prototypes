import React from 'react'
import {fireEvent, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS, Map} from 'immutable'

import {IntegrationType} from 'models/integration/constants'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as articlesState} from 'state/entities/helpCenter/articles/reducer'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {initialState as categoriesState} from 'state/entities/helpCenter/categories/reducer'
import {renderWithRouter} from 'utils/testing'
import {HelpCenter} from 'models/helpCenter/types'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import SelfServiceSection from '../SelfServiceSection'

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const helpCenter: HelpCenter = {
    ...getHelpCentersResponseFixture.data[0],
    self_service_deactivated_datetime: '2021-05-17T18:21:42.022Z',
    shop_name: 'my-shop',
}

const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': helpCenter,
                },
            },
            articles: articlesState,
            categories: categoriesState,
        },
    } as any,
    ui: {helpCenter: {...uiState, currentId: 1}} as any,
}

const mockedUpdateHelpCenter = jest.fn().mockResolvedValue({
    data: helpCenter,
})

jest.mock('models/selfServiceConfiguration/resources', () => ({
    fetchSelfServiceConfiguration: (id: any): SelfServiceConfiguration => ({
        id,
        type: 'shopify',
        shop_name: 'my-shop',
        created_datetime: '2019-11-15 19:00:00.000000',
        updated_datetime: '2019-11-15 19:00:00.000000',
        deactivated_datetime: null,
        report_issue_policy: {
            enabled: true,
            cases: [],
        },
        track_order_policy: {
            enabled: true,
        },
        cancel_order_policy: {
            enabled: true,
            eligibilities: [],
            exceptions: [],
        },
        return_order_policy: {
            enabled: true,
            eligibilities: [],
            exceptions: [],
        },
        quick_response_policies: [],
    }),
}))

const route = {
    path: '/app/settings/help-center/:helpcenterId/appearance',
    route: '/app/settings/help-center/1/appearance',
}

describe('<SelfServiceSection/>', () => {
    const shopifyIntegration = fromJS({
        id: 1,
        name: 'my-integration',
        type: IntegrationType.Shopify,
        meta: {
            shop_name: 'my-shop',
        },
    }) as Map<any, any>

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render the component', () => {
        const {container} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <SelfServiceSection
                    helpCenter={helpCenter}
                    updateHelpCenter={mockedUpdateHelpCenter}
                    updating={false}
                    shopifyIntegration={shopifyIntegration}
                />
            </Provider>,
            route
        )

        expect(container).toMatchSnapshot()
    })

    it("updates help center's self_serve_enabled field", async () => {
        const {getByText} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <SelfServiceSection
                    helpCenter={helpCenter}
                    updateHelpCenter={mockedUpdateHelpCenter}
                    updating={false}
                    shopifyIntegration={shopifyIntegration}
                />
            </Provider>,
            route
        )

        await waitFor(() => {
            fireEvent.click(
                getByText('Enable self-service for this Help Center')
            )
        })

        expect(mockedUpdateHelpCenter).toHaveBeenLastCalledWith({
            self_service_deactivated: false,
        })
    })

    it('disables controls if help center has no connected shop', () => {
        const {getByRole} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <SelfServiceSection
                    helpCenter={{
                        ...helpCenter,
                        shop_name: null,
                    }}
                    updateHelpCenter={mockedUpdateHelpCenter}
                    updating={false}
                    shopifyIntegration={shopifyIntegration}
                />
            </Provider>,
            route
        )
        const button = getByRole('checkbox') as HTMLInputElement

        expect(button.disabled).toBeTruthy()
    })
})
