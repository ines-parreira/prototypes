import React from 'react'

import { render } from '@repo/testing'

import { CardHeaderStatusLabel } from '../CardHeaderStatusLabel'

describe('<CardHeaderStatusLabel/>', () => {
    describe('render()', () => {
        it('should render children', () => {
            const { container } = render(
                <CardHeaderStatusLabel>123</CardHeaderStatusLabel>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
