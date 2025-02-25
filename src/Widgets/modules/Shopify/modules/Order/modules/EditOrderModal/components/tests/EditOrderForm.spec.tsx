import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import EditOrderFormContainer from '../EditOrderForm'

const minProps = {
    currencyCode: 'USD',
    loading: false,
    calculatedEditOrder: fromJS({}),
    changeNote: jest.fn(),
    notifyCustomer: jest.fn(),
}

describe('<EditOrderForm/>', () => {
    it('should render', () => {
        const { container } = render(<EditOrderFormContainer {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
