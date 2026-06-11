import React from 'react'

import { render } from '@repo/testing'

import { DeactivatedViewMessage } from '../DeactivatedViewMessage'

describe('<DeactivatedViewMessage/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const { container } = render(<DeactivatedViewMessage />)

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
