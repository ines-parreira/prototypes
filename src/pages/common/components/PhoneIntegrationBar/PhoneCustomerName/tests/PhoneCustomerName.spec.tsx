import React from 'react'
import {render} from '@testing-library/react'

import PhoneCustomerName from '../PhoneCustomerName'

describe('<PhoneCustomerName/>', () => {
    it.each(['+14158880101', '+33611223344'])(
        'should render',
        (phoneNumber) => {
            const {container} = render(
                <PhoneCustomerName name="Bob" phoneNumber={phoneNumber} />
            )

            expect(container.firstChild).toMatchSnapshot()
        }
    )
})
