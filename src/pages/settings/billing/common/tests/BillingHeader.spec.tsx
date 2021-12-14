import React from 'react'
import {render} from '@testing-library/react'

import BillingHeader from '../BillingHeader'

describe('<BillingHeader />', () => {
    it('should render', () => {
        const {container} = render(
            <BillingHeader icon="test">Foo</BillingHeader>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
