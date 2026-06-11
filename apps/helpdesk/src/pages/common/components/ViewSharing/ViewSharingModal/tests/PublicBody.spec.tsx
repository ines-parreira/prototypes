import React from 'react'

import { render } from '@repo/testing'

import { PublicBody } from '../PublicBody'

describe('<PublicBody/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const { container } = render(<PublicBody />)

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
