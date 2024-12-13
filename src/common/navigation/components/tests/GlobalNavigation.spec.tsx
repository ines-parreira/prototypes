import {render} from '@testing-library/react'
import React from 'react'

import GlobalNavigation from '../GlobalNavigation'

describe('GlobalNavigation', () => {
    it('should render the global navigation', () => {
        const {getByText} = render(<GlobalNavigation />)
        expect(getByText('global nav')).toBeInTheDocument()
    })
})
