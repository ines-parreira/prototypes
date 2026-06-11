import React from 'react'

import { render } from '@repo/testing'

import { LinkButton } from '../LinkButton'

describe('<LinkButton />', () => {
    it('should render a link button', () => {
        const { container } = render(<LinkButton>foo</LinkButton>)

        expect(container.firstChild).toMatchSnapshot()
    })
})
