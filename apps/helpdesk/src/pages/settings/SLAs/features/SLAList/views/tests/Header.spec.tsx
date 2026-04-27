import React from 'react'

import { render } from '@repo/testing'

import Header from '../Header'

describe('</Header>', () => {
    it('should render', () => {
        const { getByText } = render(<Header />)

        expect(getByText('Service level agreements')).toBeInTheDocument()
        expect(
            getByText('SLAs (service level agreements) are used to establish', {
                exact: false,
            }),
        ).toBeInTheDocument()
    })
})
