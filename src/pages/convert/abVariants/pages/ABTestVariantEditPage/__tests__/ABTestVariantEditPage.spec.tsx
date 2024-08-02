import React from 'react'
import {render} from '@testing-library/react'

import ABTestVariantEditPage from '../ABTestVariantEditPage'

describe('<ABTestVariantEditPage />', () => {
    it('renders', () => {
        const {getByText} = render(<ABTestVariantEditPage />)
        expect(getByText('AB Test Edit Page')).toBeInTheDocument()
    })
})
