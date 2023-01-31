import React from 'react'
import {render} from '@testing-library/react'

import {ProductStockQuantity} from '../ProductStockQuantity'

describe('<ProductStockQuantity/>', () => {
    describe('rendering', () => {
        it.each([
            [0, 'danger', false],
            [1, 'grey', false],
            [10, 'success', false],
            [10, 'grey', true],
        ])(
            'should render with given CSS class',
            (value, className, disabled) => {
                const {getByText} = render(
                    <ProductStockQuantity value={value} disabled={disabled} />
                )

                expect(getByText(value.toString())).toHaveClass(className)
            }
        )
    })
})
