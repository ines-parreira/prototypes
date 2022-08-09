import React, {useState} from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {GoogleAnalyticsSection} from '../GoogleAnalyticsSection'

describe('<GoogleAnalyticsSection />', () => {
    it('should render the section in its initial state', () => {
        render(
            <GoogleAnalyticsSection
                gaid=""
                onChange={jest.fn()}
                onDelete={null}
            />
        )

        screen.getByText(/Google Universal Analytics ID/i)
        screen.getByText(/Learn more/i)
        screen.getByPlaceholderText(/Ex: UA-123456789-1 or G-ABCD1234E/i)
    })

    it('should change the text input value when typing', async () => {
        const MockComponent = () => {
            const [text, setText] = useState('initial value')

            return (
                <GoogleAnalyticsSection
                    gaid={text}
                    onChange={(value) => setText(value)}
                    onDelete={null}
                />
            )
        }

        render(<MockComponent />)

        let input = screen.getByDisplayValue(/initial value/i)
        expect(input.getAttribute('name')).toBe('gaid-input')

        userEvent.clear(input)
        await userEvent.type(input, 'new value')

        input = screen.getByDisplayValue(/new value/i)
        expect(input.getAttribute('name')).toBe('gaid-input')
    })

    it('should not display the delete icon if onDelete is null', () => {
        const MockComponent = () => {
            const [text, setText] = useState('initial value')

            return (
                <GoogleAnalyticsSection
                    gaid={text}
                    onChange={(value) => setText(value)}
                    onDelete={null}
                />
            )
        }

        render(<MockComponent />)

        expect(screen.queryByTestId('delete-ga-btn')).toBeNull()
    })

    it('should display the delete icon if onDelete is not null', () => {
        const MockComponent = () => {
            const [text, setText] = useState('initial value')
            const handleDelete = jest.fn()

            return (
                <GoogleAnalyticsSection
                    gaid={text}
                    onChange={(value) => setText(value)}
                    onDelete={handleDelete}
                />
            )
        }

        render(<MockComponent />)

        screen.getByTestId('delete-ga-btn')
    })
})
