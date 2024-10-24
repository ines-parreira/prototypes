import {render, fireEvent, screen} from '@testing-library/react'
import React from 'react'

import {actionFixture} from 'fixtures/infobarCustomActions'
import {ContentType} from 'models/api/types'

import Form from '..'

jest.mock('lodash/debounce', () => (fn: Record<string, unknown>) => {
    fn.cancel = jest.fn()
    return fn
})

jest.mock('ulidx', () => ({
    ulid: jest.fn(() => 'ulid-generated-id'),
}))

describe('<Form/>', () => {
    const onClose = jest.fn()
    const onSubmit = jest.fn()
    const button = {
        label: 'label',
        action: actionFixture(),
    }
    const index = 2

    it('should call onClose when clicking cancel button', () => {
        render(<Form onClose={onClose} onSubmit={onSubmit} />)
        expect(onClose).not.toHaveBeenCalled()
        fireEvent.click(screen.getByText('Cancel'))
        expect(onClose).toHaveBeenCalled()
    })

    it('should call onSubmit with button’s data and then onClose when submitted', () => {
        render(
            <Form
                index={index}
                button={button}
                onClose={onClose}
                onSubmit={onSubmit}
            />
        )

        fireEvent.click(screen.getByRole('button', {name: 'Save'}))
        expect(onSubmit).toHaveBeenCalledWith(button, index)
        expect(onClose).toHaveBeenCalled()
    })

    it('should submit updated label', () => {
        render(<Form button={button} onClose={onClose} onSubmit={onSubmit} />)
        const newValue = ' newValue '
        fireEvent.change(screen.getByRole('textbox', {name: /Button title/}), {
            target: {value: newValue},
        })
        fireEvent.click(screen.getByRole('button', {name: 'Save'}))
        expect(onSubmit).toHaveBeenCalledWith(
            {...button, label: newValue.trim()},
            undefined
        )
    })

    it('should submit updated action header', () => {
        render(
            <Form
                index={2}
                button={button}
                onClose={onClose}
                onSubmit={onSubmit}
            />
        )
        const newValue = 'newValue'
        fireEvent.click(screen.getAllByRole('button', {name: /Add Header/})[0])
        fireEvent.change(screen.getByPlaceholderText('Key'), {
            target: {value: newValue},
        })
        fireEvent.submit(screen.getByRole('button', {name: 'Save'}))
        expect(onSubmit).toHaveBeenCalledWith(
            {
                ...button,
                action: {
                    ...button.action,
                    headers: [
                        {
                            key: newValue,
                            id: 'ulid-generated-id',
                            value: '',
                            editable: false,
                            mandatory: false,
                        },
                    ],
                },
            },
            2
        )
    })

    it('should remove duplicates on submit', () => {
        const action = actionFixture({edit: true})
        action.params.push(action.params[0])
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
            />
        )
        fireEvent.click(screen.getByRole('button', {name: 'Save'}))
        expect(onSubmit).toHaveBeenCalledWith(
            {
                ...button,
                action: actionFixture({edit: true}),
            },
            2
        )
    })

    it('should trim leftover body data on submit', () => {
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
            />
        )
        fireEvent.click(screen.getByRole('button', {name: 'Save'}))
        expect(onSubmit).toHaveBeenCalledWith(
            {
                ...button,
                action: actionFixture(),
            },
            2
        )
    })

    it('should trim leftover body form data on submit', () => {
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
            />
        )
        fireEvent.click(screen.getByRole('button', {name: 'Save'}))
        expect(onSubmit).toHaveBeenCalledWith(
            {
                ...button,
                action: actionFixture(),
            },
            2
        )
    })
})
