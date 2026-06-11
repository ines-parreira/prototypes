import React from 'react'

import { render } from '@repo/testing'

import { IconButton } from '../IconButton'

describe('<IconButton />', () => {
    it('should render a button containing an icon', () => {
        const { container } = render(<IconButton>check</IconButton>)

        expect(container.firstChild).toMatchSnapshot()
    })
})
