import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PersonalitySelector } from '../PersonalitySelector'

describe('PersonalitySelector', () => {
    it('should render all personality options', () => {
        render(<PersonalitySelector />)

        expect(
            screen.getByRole('checkbox', {
                name: /Friendly: Warm, inviting, encouraging/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('checkbox', {
                name: /Professional: Precise, polished, authoritative/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('checkbox', {
                name: /Sophisticated: Elevated, elegant, refined/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('checkbox', {
                name: /Custom: Customize your personality/i,
            }),
        ).toBeInTheDocument()
    })

    it('should display personality titles and descriptions', () => {
        render(<PersonalitySelector />)

        expect(screen.getByText('Friendly')).toBeInTheDocument()
        expect(
            screen.getByText('Warm, inviting, encouraging'),
        ).toBeInTheDocument()

        expect(screen.getByText('Professional')).toBeInTheDocument()
        expect(
            screen.getByText('Precise, polished, authoritative'),
        ).toBeInTheDocument()

        expect(screen.getByText('Sophisticated')).toBeInTheDocument()
        expect(
            screen.getByText('Elevated, elegant, refined'),
        ).toBeInTheDocument()

        expect(screen.getByText('Custom')).toBeInTheDocument()
        expect(
            screen.getByText('Customize your personality'),
        ).toBeInTheDocument()
    })

    it('should call onChange when a personality is selected', async () => {
        const user = userEvent.setup()
        const handleChange = jest.fn()

        render(<PersonalitySelector onChange={handleChange} />)

        await user.click(
            screen.getByRole('checkbox', {
                name: /Friendly: Warm, inviting, encouraging/i,
            }),
        )

        expect(handleChange).toHaveBeenCalledWith('Friendly')
    })

    it('should call onChange with different personalities', async () => {
        const user = userEvent.setup()
        const handleChange = jest.fn()

        render(<PersonalitySelector onChange={handleChange} />)

        await user.click(
            screen.getByRole('checkbox', {
                name: /Professional: Precise, polished, authoritative/i,
            }),
        )
        expect(handleChange).toHaveBeenCalledWith('Professional')

        await user.click(
            screen.getByRole('checkbox', {
                name: /Sophisticated: Elevated, elegant, refined/i,
            }),
        )
        expect(handleChange).toHaveBeenCalledWith('Sophisticated')

        await user.click(
            screen.getByRole('checkbox', {
                name: /Custom: Customize your personality/i,
            }),
        )
        expect(handleChange).toHaveBeenCalledWith('Custom')
    })

    it('should show the selected personality as checked', () => {
        render(<PersonalitySelector value="Friendly" />)

        const friendlyCheckbox = screen.getByRole('checkbox', {
            name: /Friendly: Warm, inviting, encouraging/i,
        })
        const professionalCheckbox = screen.getByRole('checkbox', {
            name: /Professional: Precise, polished, authoritative/i,
        })

        expect(friendlyCheckbox).toBeChecked()
        expect(professionalCheckbox).not.toBeChecked()
    })

    it('should update checked state when value prop changes', () => {
        const { rerender } = render(<PersonalitySelector value="Friendly" />)

        expect(
            screen.getByRole('checkbox', {
                name: /Friendly: Warm, inviting, encouraging/i,
            }),
        ).toBeChecked()

        rerender(<PersonalitySelector value="Professional" />)

        expect(
            screen.getByRole('checkbox', {
                name: /Friendly: Warm, inviting, encouraging/i,
            }),
        ).not.toBeChecked()
        expect(
            screen.getByRole('checkbox', {
                name: /Professional: Precise, polished, authoritative/i,
            }),
        ).toBeChecked()
    })

    it('should have proper accessibility attributes', () => {
        render(<PersonalitySelector />)

        const group = screen.getByRole('group', {
            name: /Select personality/i,
        })

        expect(group).toHaveAttribute(
            'aria-describedby',
            'personality-description',
        )
    })

    it('should not call onChange when no handler is provided', async () => {
        const user = userEvent.setup()

        render(<PersonalitySelector />)

        await user.click(
            screen.getByRole('checkbox', {
                name: /Friendly: Warm, inviting, encouraging/i,
            }),
        )
    })

    it('should work with all personality options', async () => {
        const user = userEvent.setup()
        const handleChange = jest.fn()

        render(<PersonalitySelector onChange={handleChange} />)

        const personalities = [
            {
                name: /Friendly: Warm, inviting, encouraging/i,
                value: 'Friendly',
            },
            {
                name: /Professional: Precise, polished, authoritative/i,
                value: 'Professional',
            },
            {
                name: /Sophisticated: Elevated, elegant, refined/i,
                value: 'Sophisticated',
            },
            {
                name: /Custom: Customize your personality/i,
                value: 'Custom',
            },
        ]

        for (const personality of personalities) {
            handleChange.mockClear()
            await user.click(
                screen.getByRole('checkbox', { name: personality.name }),
            )
            expect(handleChange).toHaveBeenCalledWith(personality.value)
        }
    })
})
