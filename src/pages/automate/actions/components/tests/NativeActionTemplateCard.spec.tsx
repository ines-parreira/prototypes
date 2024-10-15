import React from 'react'
import {render, screen} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {RootState} from 'state/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import NativeActionTemplateCard from '../NativeActionTemplateCard'

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])

describe('<NativeActionTemplateCard />', () => {
    const storeState = {
        integrations: fromJS({
            integrations: [
                {
                    type: 'shopify',
                    meta: {
                        shop_name: 'shop-name',
                        oauth: {status: 'success'},
                    },
                },
            ],
        }),
    } as RootState
    it('should render component', () => {
        render(
            <Provider store={mockStore(storeState)}>
                <QueryClientProvider client={queryClient}>
                    <NativeActionTemplateCard
                        app={{type: 'shopify'}}
                        shopName="shop-name"
                        templateId="1"
                        templateName="test template"
                    />
                </QueryClientProvider>
            </Provider>
        )

        expect(screen.getByText('test template')).toBeInTheDocument()
    })
})
