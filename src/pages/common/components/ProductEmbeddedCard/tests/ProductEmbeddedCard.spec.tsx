import {shallow} from 'enzyme'

import React from 'react'

import ProductEmbeddedCard from '../ProductEmbeddedCard'

const defaultProps = {
    product: {
        average_score: 4.3,
        category: {name: 'electronics'},
        description: 'economic washing machine',
        images: [
            {
                original: 'string',
                square: 'string',
            },
        ],
        name: 'Tandem washing machine',
        total_reviews: 100,
        url: 'www.yotpo.com/product/GGGGG',
    },
}

describe('<ProductEmbeddedCard/>', () => {
    it('Should render a product card', () => {
        const component = shallow(
            <ProductEmbeddedCard {...defaultProps} />
        ).dive()

        expect(component).toMatchSnapshot()
    })
})
