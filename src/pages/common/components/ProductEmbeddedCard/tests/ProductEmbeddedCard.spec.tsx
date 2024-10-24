import {render} from '@testing-library/react'
import React from 'react'

import ProductEmbeddedCard from 'pages/common/components/ProductEmbeddedCard/ProductEmbeddedCard'

jest.mock('react-rating-stars-component', () => () => null)

const defaultPropsWithImages = {
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

const defaultPropsEmptyImages = {
    product: {
        average_score: 4.3,
        category: {name: 'electronics'},
        description: 'economic washing machine',
        images: [],
        name: 'Tandem washing machine',
        total_reviews: 100,
        url: 'www.yotpo.com/product/GGGGG',
    },
}

const defaultPropsNoImages = {
    product: {
        average_score: 4.3,
        category: {name: 'electronics'},
        description: 'economic washing machine',
        name: 'Tandem washing machine',
        total_reviews: 100,
        url: 'www.yotpo.com/product/GGGGG',
    },
}

describe('<ProductEmbeddedCard/>', () => {
    it.each([
        defaultPropsWithImages,
        defaultPropsEmptyImages,
        defaultPropsNoImages,
    ])('Should render a product card', (defaultProps) => {
        const {container} = render(<ProductEmbeddedCard {...defaultProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })
})
