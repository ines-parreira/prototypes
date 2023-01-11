import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import {customer} from 'fixtures/customer'

import SpotlightCustomerRow from '../SpotlightCustomerRow'

describe('<SpotlightCustomerRow/>', () => {
    const defaultProps: ComponentProps<typeof SpotlightCustomerRow> = {
        item: customer,
        onCloseModal: jest.fn(),
    }

    it('should render render customer information', () => {
        const {container} = render(<SpotlightCustomerRow {...defaultProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with customer id when no customer name is available', () => {
        const {container} = render(
            <SpotlightCustomerRow
                {...defaultProps}
                item={{...customer, name: ''}}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render customer mail and phone sections if not available', () => {
        const {container} = render(
            <SpotlightCustomerRow
                {...defaultProps}
                item={{...customer, email: null, channels: []}}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
