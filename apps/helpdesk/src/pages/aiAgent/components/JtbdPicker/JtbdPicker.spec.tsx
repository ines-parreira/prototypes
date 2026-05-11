import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { AiAgentScopes } from 'pages/aiAgent/Onboarding_V2/types'

import { JtbdPicker } from './JtbdPicker'

describe('JtbdPicker', () => {
    it('renders the heading and both options', () => {
        render(<JtbdPicker onSelect={() => {}} />)

        expect(
            screen.getByRole('heading', {
                name: /What do you want AI Agent to handle first/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Resolve support questions automatically/i),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Turn shopper conversations into sales/i),
        ).toBeInTheDocument()
    })

    it.each([
        {
            name: /Resolve support questions automatically/i,
            expected: AiAgentScopes.SUPPORT,
        },
        {
            name: /Turn shopper conversations into sales/i,
            expected: AiAgentScopes.SALES,
        },
    ])(
        'calls onSelect with $expected when its option is clicked',
        async ({ name, expected }) => {
            const user = userEvent.setup()
            const onSelect = jest.fn()
            render(<JtbdPicker onSelect={onSelect} />)

            await user.click(screen.getByText(name))

            expect(onSelect).toHaveBeenCalledWith(expected)
        },
    )
})
