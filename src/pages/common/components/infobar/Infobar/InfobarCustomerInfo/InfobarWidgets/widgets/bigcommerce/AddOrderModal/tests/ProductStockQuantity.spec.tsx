import React from 'react'
import {render} from '@testing-library/react'

import {ProductStockQuantity} from '../ProductStockQuantity'

describe('<ProductStockQuantity/>', () => {
    describe('rendering', () => {
        it.each([
            [0, 'danger'],
            [1, 'grey'],
            [10, 'success'],
        ])('should render with given CSS class', (value, className) => {
            const {getByText} = render(<ProductStockQuantity value={value} />)
            const element = getByText(value.toString() + ' in stock')

            expect(element.classList.contains(className)).toBe(true)
        })
    })
})
