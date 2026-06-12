import type { ComponentProps } from 'react'
import React from 'react'

import { render, userEvent } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import { noop } from '@gorgias/toolkit'
import { JsonField } from '../JsonField'

describe('JsonField', () => {
    const minProps: ComponentProps<typeof JsonField> = {
        value: 'value',
        onChange: noop,
    }

    it('should render input', () => {
        const { container } = render(<JsonField {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('display invalid message', async () => {
        const { container } = render(<JsonField {...minProps} />)

        await act(async () => {
            await userEvent.type(screen.getByRole('textbox'), 'some input')
        })

        expect(container.firstChild).toMatchSnapshot()
    })
})
