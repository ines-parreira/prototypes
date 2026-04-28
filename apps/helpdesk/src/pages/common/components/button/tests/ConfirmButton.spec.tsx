import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@repo/testing'

import ConfirmButton from '../ConfirmButton'

describe('<ConfirmButton />', () => {
    const defaultProps: Omit<
        ComponentProps<typeof ConfirmButton>,
        'children'
    > = {
        id: 'foo',
        confirmationContent: 'Are you sure?',
        confirmationTitle: "I'm a title",
        onConfirm: jest.fn(),
    }

    it('should render', () => {
        const { container } = render(
            <ConfirmButton {...defaultProps}>Click me!</ConfirmButton>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
