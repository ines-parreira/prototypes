import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import Detail from 'pages/common/components/ProductDetail'

import { dummyProduct, infoCardBannerText } from './fixtures'

describe(`Detail`, () => {
    it('should render', () => {
        const { container } = render(<Detail {...dummyProduct} />)

        expect(container).toMatchSnapshot()
    })

    it('should not display info card block', () => {
        render(
            <Detail
                {...{
                    ...dummyProduct,
                    infocard: {
                        ...dummyProduct.infocard,
                        isHidden: true,
                    },
                }}
            />,
        )
        expect(screen.getByText(dummyProduct.title))
        expect(screen.queryByText(infoCardBannerText)).toBe(null)
    })

    it('renders the setupCards slot in the right rail when provided', () => {
        render(
            <Detail
                {...dummyProduct}
                setupCards={<div>setup-cards-content</div>}
            />,
        )

        expect(screen.getByText('setup-cards-content')).toBeInTheDocument()
    })
})
