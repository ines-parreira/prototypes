import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { SearchSpotlightTabs } from '../SearchSpotlightTabs'

describe('SearchSpotlightTabs', () => {
    it('renders counts and reports tab changes', async () => {
        const onSelectionChange = vi.fn()
        const { user } = render(
            <SearchSpotlightTabs
                buttonCounts={{
                    all: 10,
                    customers: 3,
                    tickets: 4,
                    calls: 3,
                }}
                selectedSection="all"
                showCalls={true}
                onSelectionChange={onSelectionChange}
            />,
        )

        expect(
            screen.getByRole('radio', { name: /^All 10$/i }),
        ).toHaveAttribute('aria-checked', 'true')
        expect(
            screen.getByRole('radio', { name: /^Customers 3$/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('radio', { name: /^Tickets 4$/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('radio', { name: /^Calls 3$/i }),
        ).toBeInTheDocument()

        await user.click(screen.getByRole('radio', { name: /^Tickets 4$/i }))

        expect(onSelectionChange).toHaveBeenCalledWith('tickets')
    })

    it('omits null counts and the calls tab when calls are hidden', () => {
        render(
            <SearchSpotlightTabs
                buttonCounts={{
                    all: null,
                    customers: null,
                    tickets: 2,
                    calls: null,
                }}
                selectedSection="customers"
                showCalls={false}
                onSelectionChange={vi.fn()}
            />,
        )

        expect(
            screen.queryByRole('radio', { name: /^Calls$/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole('radio', { name: /^Tickets 2$/i }),
        ).toBeInTheDocument()
    })
})
