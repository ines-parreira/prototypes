import { render, screen } from '@testing-library/react'

import { FollowUpField } from './FollowUp'

describe('<FollowUpField />', () => {
    it('should accept default value', () => {
        render(<FollowUpField value={2} />)

        const options = screen.getAllByRole('button')

        options.forEach((option) => {
            if (option.textContent !== '2') {
                expect(option).toHaveClass('selectorOption')
            } else {
                expect(option).toHaveClass('selectorOption--selected')
            }
        })
    })
    it('should render field information and info', () => {
        render(<FollowUpField />)
        expect(screen.getByText('Follow-up')).toBeInTheDocument()
        expect(
            screen.getByText('Select the number of follow-ups'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Follow-ups are triggered every 24 hours.'),
        ).toBeInTheDocument()
    })
})
