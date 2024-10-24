import {render} from '@testing-library/react'

import {fromJS} from 'immutable'
import React from 'react'

import OrderTotals from '../OrderTotals'

const minProps = {
    currencyCode: 'USD',
    loading: false,
    calculatedEditOrder: fromJS({}),
}

describe('<OrderTotals/>', () => {
    it('should render not loading', () => {
        const {container} = render(<OrderTotals {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render loading', () => {
        const props = minProps
        props.loading = true
        const {container} = render(<OrderTotals {...props} />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
