import { render, userEvent } from '@repo/testing'

import { AddConditionLink } from './AddConditionLink'

describe('AddConditionLink', () => {
    it('renders the default "Add condition" label', () => {
        const { getByRole } = render(<AddConditionLink onClick={() => {}} />)
        expect(
            getByRole('button', { name: 'Add condition' }),
        ).toBeInTheDocument()
    })

    it('renders a custom label when provided', () => {
        const { getByRole } = render(
            <AddConditionLink onClick={() => {}} label="Add another rule" />,
        )
        expect(
            getByRole('button', { name: 'Add another rule' }),
        ).toBeInTheDocument()
    })

    it('invokes onClick when the trigger is activated', async () => {
        const user = userEvent.setup()
        const onClick = jest.fn()
        const { getByRole } = render(<AddConditionLink onClick={onClick} />)
        await user.click(getByRole('button', { name: 'Add condition' }))
        expect(onClick).toHaveBeenCalledTimes(1)
    })
})
