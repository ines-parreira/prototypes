import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'

import Form from '../Form'

describe('<Form/>', () => {
    const onClose = jest.fn()
    const onSubmit = jest.fn()
    const button = {label: 'label'}
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

    it('should disable button when invalid', () => {
        render(<Form onClose={onClose} onSubmit={onSubmit} />)
        expect(
            screen.getByRole('button', {name: 'Save'}).hasAttribute('disabled')
        ).toBeTruthy()
    })

    it('should call onSubmit when valid and submitted', () => {
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
})
