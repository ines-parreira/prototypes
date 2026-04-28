import React from 'react'

import { render } from '@repo/testing'

import { DropText } from '../DropText'

describe('<DropText>', () => {
    it('matches snapshot', () => {
        const { container } = render(<DropText />)
        expect(container).toMatchSnapshot()
    })
})
