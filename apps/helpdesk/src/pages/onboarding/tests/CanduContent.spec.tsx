import React from 'react'

import { render } from '@repo/testing'

import { CanduContent } from '../CanduContent'

describe('<CanduContent />', () => {
    it('should display an empty container', () => {
        const { container } = render(
            <CanduContent title="Candu content" containerId="candu-content" />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
