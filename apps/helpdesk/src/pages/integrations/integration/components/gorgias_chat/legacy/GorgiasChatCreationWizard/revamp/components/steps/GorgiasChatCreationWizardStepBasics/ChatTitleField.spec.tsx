import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ChatTitleField } from './ChatTitleField'

describe('ChatTitleField', () => {
    const renderComponent = (
        overrides: Partial<React.ComponentProps<typeof ChatTitleField>> = {},
    ) => {
        const props = {
            name: '',
            hasFailedSubmit: false,
            onChange: jest.fn(),
            ...overrides,
        }
        return {
            ...render(<ChatTitleField {...props} />),
            onChange: props.onChange,
        }
    }

    it('renders the label and caption', () => {
        renderComponent()

        expect(
            screen.getByLabelText('Chat title*', { selector: 'input' }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                "Give your chat a name for internal reference. This title won't be visible to customers.",
            ),
        ).toBeInTheDocument()
    })

    it('displays the provided name value', () => {
        renderComponent({ name: 'My Chat' })

        expect(
            screen.getByLabelText('Chat title*', { selector: 'input' }),
        ).toHaveValue('My Chat')
    })

    it('calls onChange when the user types', async () => {
        const user = userEvent.setup()
        const { onChange } = renderComponent()

        await user.type(
            screen.getByLabelText('Chat title*', { selector: 'input' }),
            'New title',
        )

        expect(onChange).toHaveBeenCalled()
    })

    it('shows a required error when hasFailedSubmit is true and name is empty', () => {
        renderComponent({ hasFailedSubmit: true, name: '' })

        expect(screen.getByText('This field is required.')).toBeInTheDocument()
    })

    it('does not show an error when hasFailedSubmit is false and name is empty', () => {
        renderComponent({ hasFailedSubmit: false, name: '' })

        expect(
            screen.queryByText('This field is required.'),
        ).not.toBeInTheDocument()
    })

    it('does not show an error when hasFailedSubmit is true but name is provided', () => {
        renderComponent({ hasFailedSubmit: true, name: 'My Chat' })

        expect(
            screen.queryByText('This field is required.'),
        ).not.toBeInTheDocument()
    })
})
