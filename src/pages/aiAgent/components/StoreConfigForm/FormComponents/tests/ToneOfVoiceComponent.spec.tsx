import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ToneOfVoiceComponent } from '../ToneOfVoiceComponent'

describe('ToneOfVoiceComponent', () => {
    const defaultProps = {
        value: 'Friendly',
        onChange: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render all tone of voice options correctly', () => {
        render(<ToneOfVoiceComponent {...defaultProps} />)

        expect(screen.getByText('Friendly')).toBeInTheDocument()
        expect(screen.getByText('Professional')).toBeInTheDocument()
        expect(screen.getByText('Sophisticated')).toBeInTheDocument()
        expect(screen.getByText('Custom')).toBeInTheDocument()
    })

    it('should display descriptions for each tone of voice', () => {
        render(<ToneOfVoiceComponent {...defaultProps} />)

        expect(
            screen.getByText('Warm, inviting, encouraging'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Precise, polished, authoritative'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Elevated, elegant, refined'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Add your own instructions'),
        ).toBeInTheDocument()
    })

    it('should have appropriate accessibility attributes', () => {
        render(<ToneOfVoiceComponent {...defaultProps} />)

        const container = screen.getByRole('group')
        expect(container).toHaveAttribute(
            'aria-label',
            "Select your AI Agent's tone of voice",
        )
    })

    it('should call onChange when a tone of voice is selected', async () => {
        render(<ToneOfVoiceComponent {...defaultProps} />)

        await userEvent.click(screen.getByText('Professional'))
        expect(defaultProps.onChange).toHaveBeenCalledWith('Professional')
    })

    it('should display the selected tone of voice as checked', () => {
        render(<ToneOfVoiceComponent {...defaultProps} />)

        const friendlyCheckbox = screen.getByLabelText(
            'Friendly: Warm, inviting, encouraging',
        )
        expect(friendlyCheckbox).toBeChecked()
    })

    it('should update selection when value prop changes', () => {
        const { rerender } = render(<ToneOfVoiceComponent {...defaultProps} />)

        rerender(
            <ToneOfVoiceComponent
                value="Professional"
                onChange={defaultProps.onChange}
            />,
        )

        const professionalCheckbox = screen.getByLabelText(
            'Professional: Precise, polished, authoritative',
        )
        expect(professionalCheckbox).toBeChecked()
    })

    it('should handle case when onChange is not provided', async () => {
        render(<ToneOfVoiceComponent value="Friendly" />)

        // Should not throw an error
        expect(() =>
            userEvent.click(screen.getByText('Professional')),
        ).not.toThrow()
    })

    describe('keyboard navigation', () => {
        it('should handle space key press to select an option', async () => {
            render(<ToneOfVoiceComponent {...defaultProps} />)

            const professionalCheckbox = screen.getByLabelText(
                'Professional: Precise, polished, authoritative',
            )

            // Navigate to the Professional checkbox
            await userEvent.tab()
            await userEvent.tab()

            expect(professionalCheckbox).toHaveFocus()

            // Press space to select
            await userEvent.type(professionalCheckbox, ' ')
            expect(defaultProps.onChange).toHaveBeenCalledWith('Professional')
        })

        it('should maintain focus when navigating between options', async () => {
            render(<ToneOfVoiceComponent {...defaultProps} />)

            const friendlyCheckbox = screen.getByLabelText(
                'Friendly: Warm, inviting, encouraging',
            )
            const professionalCheckbox = screen.getByLabelText(
                'Professional: Precise, polished, authoritative',
            )

            // Start at Friendly
            await userEvent.tab()
            expect(friendlyCheckbox).toHaveFocus()

            // Tab to Professional
            await userEvent.tab()
            expect(professionalCheckbox).toHaveFocus()
        })
    })
})
