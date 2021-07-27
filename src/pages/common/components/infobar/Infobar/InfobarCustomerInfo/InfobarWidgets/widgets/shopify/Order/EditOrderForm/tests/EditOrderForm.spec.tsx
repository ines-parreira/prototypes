import {render} from '@testing-library/react'

import React from 'react'
import {fromJS} from 'immutable'

import EditOrderFormContainer from '../EditOrderForm'

const minProps = {
    currencyCode: 'USD',
    loading: false,
    calculatedEditOrder: fromJS({}),
    changeNote: jest.fn(),
    notifyCustomer: jest.fn(),
}

describe('<EditOrderForm/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render', () => {
        const {container} = render(<EditOrderFormContainer {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
