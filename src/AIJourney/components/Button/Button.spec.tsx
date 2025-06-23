import React from 'react'

import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { Button } from './Button'

describe('<Button />', () => {
    it('should render the label', () => {
        render(<Button label="Click me" onClick={jest.fn()} />)
        expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('should trigger onClick when enabled', async () => {
        const onClick = jest.fn()
        render(<Button label="Click me" onClick={onClick} />)
        const button = screen.getByRole('button')
        await userEvent.click(button)
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', async () => {
        const onClick = jest.fn()
        render(<Button label="Click me" onClick={onClick} isDisabled />)
        const button = screen.getByRole('button')
        await userEvent.click(button)
        expect(onClick).not.toHaveBeenCalled()
    })

    it('should disable when isDisabled is true', () => {
        render(<Button label="Click me" onClick={jest.fn()} isDisabled />)
        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
    })
})
