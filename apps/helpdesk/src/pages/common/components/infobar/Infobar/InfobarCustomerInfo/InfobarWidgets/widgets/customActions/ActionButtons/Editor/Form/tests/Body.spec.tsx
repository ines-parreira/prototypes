import { act, fireEvent, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { ContentType } from 'models/api/types'

import Body from '../Body'

describe('<Body/>', () => {
    const onChange = jest.fn()

    it('should call onChange when clicking on the other radio button', async () => {
        const user = userEvent.setup()
        render(
            <Body
                onChange={onChange}
                body={{
                    contentType: ContentType.Json,
                    [ContentType.Json]: {},
                    [ContentType.Form]: [],
                }}
            />,
        )

        await act(() =>
            user.click(
                screen.getByRole('radio', {
                    name: ContentType.Form,
                }),
            ),
        )

        expect(onChange).toHaveBeenCalledWith(
            'body.contentType',
            ContentType.Form,
        )
    })

    it('should call onChange when editing the JSON', async () => {
        render(
            <Body
                onChange={onChange}
                body={{
                    contentType: ContentType.Json,
                    [ContentType.Json]: {},
                    [ContentType.Form]: [],
                }}
            />,
        )

        await act(() =>
            fireEvent.change(screen.getByRole('textbox'), {
                target: { value: '{"ok": "ok"}' },
            }),
        )
        expect(onChange).toHaveBeenCalled()
    })

    it('should call onChange when editing the parameter', async () => {
        const user = userEvent.setup()
        render(
            <Body
                onChange={onChange}
                body={{
                    contentType: ContentType.Form,
                    [ContentType.Form]: [],
                    [ContentType.Json]: {},
                }}
            />,
        )

        await act(() =>
            user.click(
                screen.getByRole('button', {
                    name: /Add Body Parameter/,
                }),
            ),
        )
        expect(onChange).toHaveBeenCalled()
    })
})
