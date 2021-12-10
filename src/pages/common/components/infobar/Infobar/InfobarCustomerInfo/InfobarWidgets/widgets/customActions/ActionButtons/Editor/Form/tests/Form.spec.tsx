import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'

import {HttpMethod} from '../../../../../../../../../../../../../models/api/types'

import Form from '..'

describe('<Form/>', () => {
    const onClose = jest.fn()
    const onSubmit = jest.fn()
    const button = {
        label: 'label',
        action: {
            method: HttpMethod.Get,
            url: 'www.someurl.com',
            headers: [],
            params: [],
            body: {},
        },
    }
    const index = 2

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render without any data', () => {
        const {container} = render(
            <Form onClose={onClose} onSubmit={onSubmit} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with preloaded data', () => {
        const {container} = render(
            <Form
                index={index}
                button={button}
                onClose={onClose}
                onSubmit={onSubmit}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

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
        fireEvent.change(screen.getByRole('textbox', {name: 'Button title'}), {
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
        fireEvent.click(screen.getAllByRole('button', {name: 'add'})[0])
        fireEvent.change(screen.getByPlaceholderText('Key'), {
            target: {value: newValue},
        })
        fireEvent.click(screen.getByRole('button', {name: 'Save'}))
        expect(onSubmit).toHaveBeenCalledWith(
            {
                ...button,
                action: {
                    ...button.action,
                    headers: [
                        {
                            key: newValue,
                            value: '',
                            label: '',
                            editable: false,
                            mandatory: false,
                        },
                    ],
                },
            },
            2
        )
    })
})
