import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {useForm} from 'react-hook-form'

import {ActionsApp} from '../../types'
import UrlInput from '../UrlInput'

const TestComponent = () => {
    const {control} = useForm<ActionsApp>()

    return (
        <UrlInput
            control={control}
            name="auth_settings.url"
            label="Instructions URL"
            caption="Enter a valid URL"
            placeholder="https://link.gorgias.com/xyz"
        />
    )
}

describe('UrlInput Component', () => {
    test('renders with correct label and placeholder', () => {
        render(<TestComponent />)

        const input = screen.getByPlaceholderText(
            'https://link.gorgias.com/xyz'
        )
        expect(input).toBeInTheDocument()

        const label = screen.getByText('Instructions URL')
        expect(label).toBeInTheDocument()
    })

    test('validates a correct URL input', async () => {
        render(<TestComponent />)

        const input = screen.getByPlaceholderText(
            'https://link.gorgias.com/xyz'
        )
        await userEvent.type(input, 'https://valid-url.com')

        expect(input).toHaveValue('https://valid-url.com')
    })
})
