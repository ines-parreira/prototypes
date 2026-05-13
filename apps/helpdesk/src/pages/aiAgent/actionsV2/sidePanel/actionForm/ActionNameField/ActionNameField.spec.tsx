import { render } from '@repo/testing'
import userEvent from '@testing-library/user-event'

import { ActionNameField } from './ActionNameField'

describe('ActionNameField', () => {
    it('renders the default label', () => {
        const { getByText } = render(
            <ActionNameField value="" onChange={() => {}} />,
        )
        expect(getByText('Action name')).toBeInTheDocument()
    })

    it('forwards the typed value through onChange', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        const { getByRole } = render(
            <ActionNameField value="" onChange={onChange} />,
        )
        await user.type(getByRole('textbox'), 'H')
        expect(onChange).toHaveBeenCalledWith('H')
    })

    it('displays an error message when provided', () => {
        const { getByText } = render(
            <ActionNameField
                value="Bad name"
                onChange={() => {}}
                error="Name must be unique"
            />,
        )
        expect(getByText('Name must be unique')).toBeInTheDocument()
    })
})
