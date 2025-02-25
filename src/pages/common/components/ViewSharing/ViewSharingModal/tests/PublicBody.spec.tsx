import React from 'react'

import { render } from '@testing-library/react'

import PublicBody from '../PublicBody'

describe('<PublicBody/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const { container } = render(<PublicBody />)

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
