import React, { ComponentProps } from 'react'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _noop from 'lodash/noop'

import JsonField from '../JsonField'

describe('JsonField', () => {
    const minProps: ComponentProps<typeof JsonField> = {
        value: 'value',
        onChange: _noop,
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
