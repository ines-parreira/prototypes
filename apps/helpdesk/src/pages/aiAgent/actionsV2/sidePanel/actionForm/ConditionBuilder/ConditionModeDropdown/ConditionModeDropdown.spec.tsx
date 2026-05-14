import { render, userEvent } from '@repo/testing'

import { ConditionModeDropdown } from './ConditionModeDropdown'

describe('ConditionModeDropdown', () => {
    it('shows the label for the currently selected mode', () => {
        const { getByLabelText } = render(
            <ConditionModeDropdown value="all" onChange={() => {}} />,
        )
        expect(getByLabelText('Conditions mode')).toHaveTextContent(
            'All conditions are met',
        )
    })

    it('calls onChange with the picked operator id', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        const { getByLabelText, findByRole } = render(
            <ConditionModeDropdown value="none" onChange={onChange} />,
        )
        await user.click(getByLabelText('Conditions mode'))
        await user.click(
            await findByRole('option', { name: 'Any condition is met' }),
        )
        expect(onChange).toHaveBeenCalledWith('any')
    })

    it('uses a custom aria-label when provided', () => {
        const { getByLabelText } = render(
            <ConditionModeDropdown
                value="none"
                onChange={() => {}}
                label="Rule mode"
            />,
        )
        expect(getByLabelText('Rule mode')).toBeInTheDocument()
    })
})
