import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import { EcommerceStore } from 'models/customerEcommerceData/types'

import { shopperCustomization } from '../Shopper'

const ecomStore: EcommerceStore = {
    deleted_datetime: null,
    display_name: 'woo-generously-electronic-soul.wpcomstaging.com',
    helpdesk_integration_id: 333,
    name: 'woo-generously-electronic-soul.wpcomstaging.com',
    default_currency: 'usd',
    currencies: ['usd'],
    url: 'https://woo-generously-electronic-soul.wpcomstaging.com',
    created_datetime: '2023-09-29T09:00:33.333568+00:00',
    type: 'woocommerce',
    id: 105,
    uuid: '5f240ffc-6a11-4d81-95ee-3ff1a90ed854',
    updated_datetime: null,
}

let mockEcomStore: EcommerceStore | undefined = ecomStore

jest.mock('../../hooks/useStore', () => {
    return {
        useStore: () => {
            return mockEcomStore
        },
    }
})

describe('Shopper card', () => {
    describe('<TitleWrapper/>', () => {
        const TitleWrapper = shopperCustomization.TitleWrapper!
        it('should render it children, plus woocommerce logo and title', () => {
            const { container } = render(
                <TitleWrapper source={fromJS({ external_id: '1234' })}>
                    Shopper
                </TitleWrapper>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should not render because the store is missing', () => {
            mockEcomStore = undefined
            const { container } = render(
                <TitleWrapper source={fromJS({ external_id: '1234' })}>
                    Shopper
                </TitleWrapper>,
            )

            expect(container.firstChild).toBeNull()
        })
    })
})
