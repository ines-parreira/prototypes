import React from 'react'
import {render} from '@testing-library/react'

import RequestABTest from '../RequestABTest'

describe('RequestABTest', () => {
    it('renders', () => {
        const {getByText} = render(<RequestABTest />)

        expect(getByText('Request A/B Test')).toBeInTheDocument()
    })
})
