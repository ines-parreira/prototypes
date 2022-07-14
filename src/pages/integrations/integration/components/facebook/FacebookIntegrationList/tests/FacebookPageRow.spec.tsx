import React from 'react'
import {render} from 'enzyme'
import {fromJS, Map} from 'immutable'

import {
    FACEBOOK_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'
import FacebookPageRow from '../FacebookPageRow'

describe('FacebookPageRow component', () => {
    it('should not render non-facebook integration', () => {
        const integration: Map<any, any> = fromJS({
            id: 1,
            name: 'mylittleintegration',
            type: SHOPIFY_INTEGRATION_TYPE,
            created_datetime: '2018-01-01 00:00:00',
        })

        const component = render(<FacebookPageRow integration={integration} />)

        expect(component).toMatchSnapshot()
    })

    it('should render facebook integration', () => {
        const integration: Map<any, any> = fromJS({
            id: 1,
            name: 'mylittleintegration',
            type: FACEBOOK_INTEGRATION_TYPE,
            created_datetime: '2018-01-01 00:00:00',
            meta: {
                name: 'My Page',
                picture: {
                    data: {
                        url: 'https://fake.url/picture.jpg',
                    },
                },
                category: 'Category',
            },
        })

        const component = render(<FacebookPageRow integration={integration} />)

        expect(component).toMatchSnapshot()
    })
})
