import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ulid } from 'ulidx'

import { actionFixture } from 'fixtures/infobarCustomActions'
import { ContentType } from 'models/api/types'

import Form from '..'

jest.mock('lodash/debounce', () => (fn: Record<string, unknown>) => {
    fn.cancel = jest.fn()
    return fn
})

describe('<Form/>', () => {
    const onClose = jest.fn()
    const onSubmit = jest.fn()
    const button = {
        label: 'label',
        action: actionFixture(),
    }
    const index = 2

    it('should call onClose when clicking cancel button', async () => {
        const user = userEvent.setup()
        render(<Form onClose={onClose} onSubmit={onSubmit} />)
        expect(onClose).not.toHaveBeenCalled()
        await act(() => user.click(screen.getByText('Cancel')))
        expect(onClose).toHaveBeenCalled()
    })

    it('should call onSubmit with button’s data and then onClose when submitted', async () => {
        const user = userEvent.setup()
        render(
            <Form
                index={index}
                button={button}
                onClose={onClose}
                onSubmit={onSubmit}
            />,
        )

        await act(() =>
            user.click(screen.getByRole('button', { name: 'Save' })),
        )
        expect(onSubmit).toHaveBeenCalledWith(button, index)
        expect(onClose).toHaveBeenCalled()
    })

    it('should submit updated label', async () => {
        const user = userEvent.setup()
        render(<Form button={button} onClose={onClose} onSubmit={onSubmit} />)
        const newValue = ' newValue '
        await act(async () => {
            const buttonTitle = screen.getByRole('textbox', {
                name: /Button title/,
            })
            await user.clear(buttonTitle)
            await user.type(buttonTitle, newValue)
        })
        await act(() =>
            user.click(screen.getByRole('button', { name: 'Save' })),
        )
        expect(onSubmit).toHaveBeenCalledWith(
            { ...button, label: newValue.trim() },
            undefined,
        )
    })

    it('should submit updated action header', async () => {
        const user = userEvent.setup()
        render(
            <Form
                index={2}
                button={button}
                onClose={onClose}
                onSubmit={onSubmit}
            />,
        )
        const newValue = 'newValue'
        const addHeaderButton = screen.getByRole('button', {
            name: /Add Header/,
        })
        await act(() => user.click(addHeaderButton))
        const key = screen.getAllByPlaceholderText('Key')[0]
        const value = screen.getAllByPlaceholderText('Value')[0]
        await act(() => user.type(key, newValue))
        await act(() => user.type(value, newValue))
        await act(() =>
            user.click(screen.getByRole('button', { name: 'Save' })),
        )

        expect(onSubmit).toHaveBeenCalledWith(
            {
                ...button,
                action: {
                    ...button.action,
                    headers: [
                        {
                            key: newValue,
                            id: expect.any(String),
                            value: newValue,
                            editable: false,
                            mandatory: false,
                        },
                    ],
                },
            },
            2,
        )
    })

    it('should remove duplicates on submit', async () => {
        const user = userEvent.setup()
        const action = actionFixture({ edit: true })
        const button = {
            label: 'label',
            action: {
                ...action,
                params: [...action.params, { ...action.params[0], id: ulid() }],
            },
        }
        render(
            <Form
                index={2}
                button={button}
                onClose={onClose}
                onSubmit={onSubmit}
            />,
        )
        await act(() =>
            user.click(screen.getByRole('button', { name: 'Save' })),
        )
        expect(onSubmit).toHaveBeenCalledWith(
            {
                ...button,
                action,
            },
            2,
        )
    })

    it('should trim leftover body data on submit', async () => {
        const user = userEvent.setup()
        const action = actionFixture()
        action.body[ContentType.Json] = {
            ok: 'sure',
        }
        action.body[ContentType.Form] = [
            {
                key: 'value',
                value: '',
                label: '',
                editable: false,
                mandatory: false,
            },
        ]
        const button = {
            label: 'label',
            action,
        }

        render(
            <Form
                index={2}
                button={button}
                onClose={onClose}
                onSubmit={onSubmit}
            />,
        )

        await act(() =>
            user.click(screen.getByRole('button', { name: 'Save' })),
        )

        expect(onSubmit).toHaveBeenCalledWith(
            {
                ...button,
                action: actionFixture(),
            },
            2,
        )
    })

    it('should trim leftover body form data on submit', async () => {
        const user = userEvent.setup()
        const action = actionFixture()
        action.body[ContentType.Form] = [
            {
                key: 'value',
                value: '',
                label: '',
                editable: false,
                mandatory: false,
            },
        ]
        const button = {
            label: 'label',
            action,
        }
        render(
            <Form
                index={2}
                button={button}
                onClose={onClose}
                onSubmit={onSubmit}
            />,
        )
        await act(() =>
            user.click(screen.getByRole('button', { name: 'Save' })),
        )
        expect(onSubmit).toHaveBeenCalledWith(
            {
                ...button,
                action: actionFixture(),
            },
            2,
        )
    })
})
