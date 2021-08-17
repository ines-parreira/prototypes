import React from 'react'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {useRouteMatch} from 'react-router-dom'

import {fromJS} from 'immutable'

import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {ShopType} from '../../../../../../state/self_service/types'
import {generateConfiguration} from '../../../utils/generateConfiguration'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import {useReorderDnD} from '../../../../../settings/helpCenter/hooks/useReorderDnD'

import ReportIssuePolicyView from '../ReportIssuePolicyView'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('react-router')
jest.mock('../../../../../settings/helpCenter/hooks/useReorderDnD')

const useRouteMatchMock = useRouteMatch as jest.MockedFunction<
    typeof useRouteMatch
>
const useReorderDnDMock = useReorderDnD as jest.MockedFunction<
    typeof useReorderDnD
>

const createShopifyIntegrationFixtures = (length: number) => {
    return Array.from({length}, (_, i) => ({
        id: i + 1,
        type: 'shopify',
        meta: {
            shop_name: `mystore${i + 1}`,
        },
        uri: `/api/integrations/${i + 1}/`,
    }))
}
const createSelfServiceConfigurationFixtures = (length: number) => {
    return Array.from({length}, (_, i) =>
        generateConfiguration(i + 1, 'shopify' as ShopType, `mystore${i + 1}`)
    )
}

describe('<ReportIssuePolicyView />', () => {
    const shopifyIntegrations = createShopifyIntegrationFixtures(4)
    const selfServiceConfigurations = createSelfServiceConfigurationFixtures(4)

    beforeEach(() => {
        useRouteMatchMock.mockReturnValue({
            isExact: false,
            path: '',
            url: '',
            params: {
                shopName: shopifyIntegrations[0]['meta']['shop_name'],
                integrationType: 'shopify',
            },
        })
        useReorderDnDMock.mockReturnValue({
            dragRef: {current: null},
            dropRef: {current: null},
            handlerId: null,
            isDragging: false,
        })
    })

    describe('render()', () => {
        it('should render report issue policy cases', () => {
            const {container} = render(
                <Provider
                    store={mockStore({
                        integrations: fromJS({
                            integrations: shopifyIntegrations,
                        }),
                        selfService: {
                            loading: false,
                            self_service_configurations: selfServiceConfigurations,
                        },
                    })}
                >
                    <ReportIssuePolicyView />
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })
    })
})
