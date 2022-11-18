import React from 'react'
import {render} from '@testing-library/react'

import TaxDisclaimer from '../TaxDisclaimer'

describe('<TaxDisclaimer/>', () => {
    it('should display', () => {
        const {container} = render(<TaxDisclaimer />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
