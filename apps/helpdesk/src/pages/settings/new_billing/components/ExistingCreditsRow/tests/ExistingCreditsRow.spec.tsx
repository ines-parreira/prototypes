import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ExistingCreditsRow } from '../ExistingCreditsRow'

describe('ExistingCreditsRow', () => {
    it('renders the label and the formatted credit amount', () => {
        render(<ExistingCreditsRow existingCredits={5000} currency="USD" />)

        expect(screen.getByText('Existing credits')).toBeInTheDocument()
        expect(screen.getByText('$50')).toBeInTheDocument()
    })

    it('keeps cents in the formatted amount when the credit is not a whole dollar', () => {
        render(<ExistingCreditsRow existingCredits={1234} currency="EUR" />)

        expect(screen.getByText('€12.34')).toBeInTheDocument()
    })

    it('shows the explanatory tooltip on focus of the info button', async () => {
        const user = userEvent.setup()

        render(<ExistingCreditsRow existingCredits={5000} currency="USD" />)

        await act(() => user.tab())

        expect(
            await screen.findByText(
                /these credits will be applied to your balance due/i,
            ),
        ).toBeVisible()
    })
})
