import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import type { OrderDetailsData } from '../../types'
import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'
import { DiscountsSection } from '../sections/DiscountsSection'

vi.mock('@repo/hooks', async (importOriginal) => ({
    ...((await importOriginal()) as Record<string, unknown>),
    useCopyToClipboard: () => [
        {},
        (text: string) => navigator.clipboard.writeText(text),
    ],
}))

vi.mock('../../widget/useOrderFieldPreferences', () => ({
    useOrderFieldPreferences: vi.fn(),
}))

const mockUseOrderFieldPreferences = vi.mocked(useOrderFieldPreferences)

function makeOrder(
    overrides: Partial<OrderDetailsData> = {},
): OrderDetailsData {
    return { id: 1, ...overrides }
}

function mockSectionVisible(sectionVisible = true) {
    mockUseOrderFieldPreferences.mockReturnValue({
        preferences: {
            sections: { discounts: { fields: [], sectionVisible } },
        },
        getVisibleFields: vi.fn(),
        savePreferences: vi.fn(),
        isLoading: false,
    })
}

describe('DiscountsSection', () => {
    beforeEach(() => mockSectionVisible())

    it('renders nothing when sectionVisible is false', () => {
        mockSectionVisible(false)

        const { container } = render(
            <DiscountsSection
                order={makeOrder({
                    discount_codes: [
                        {
                            code: 'SAVE10',
                            amount: '10.00',
                            type: 'fixed_amount',
                        },
                    ],
                })}
            />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing when the order has no discounts', () => {
        const { container } = render(<DiscountsSection order={makeOrder()} />)

        expect(container).toBeEmptyDOMElement()
    })

    it('renders Code, Discount, and Saved rows for a percentage discount', () => {
        render(
            <DiscountsSection
                order={makeOrder({
                    currency: 'EUR',
                    discount_codes: [
                        { code: 'MAMA25', amount: '13.44', type: 'percentage' },
                    ],
                    discount_applications: [
                        {
                            code: 'MAMA25',
                            value: '25',
                            value_type: 'percentage',
                        },
                    ],
                })}
            />,
        )

        expect(screen.getByText('Discounts')).toBeInTheDocument()
        expect(screen.getByText('Code')).toBeInTheDocument()
        expect(screen.getByText('MAMA25')).toBeInTheDocument()
        expect(screen.getByText('Discount')).toBeInTheDocument()
        expect(screen.getByText('25%')).toBeInTheDocument()
        expect(screen.getByText('Saved')).toBeInTheDocument()
        expect(screen.getByText(/13\.44/)).toBeInTheDocument()
    })

    it('renders Code and "X off" row for a fixed amount discount', () => {
        render(
            <DiscountsSection
                order={makeOrder({
                    currency: 'USD',
                    discount_codes: [
                        {
                            code: 'FLAT10',
                            amount: '10.00',
                            type: 'fixed_amount',
                        },
                    ],
                    discount_applications: [
                        {
                            code: 'FLAT10',
                            value: '10',
                            value_type: 'fixed_amount',
                        },
                    ],
                })}
            />,
        )

        expect(screen.getByText('FLAT10')).toBeInTheDocument()
        expect(screen.getByText('$10.00 off')).toBeInTheDocument()
        expect(screen.queryByText('Saved')).not.toBeInTheDocument()
    })

    it('renders "Free shipping" for a shipping type discount', () => {
        render(
            <DiscountsSection
                order={makeOrder({
                    discount_codes: [
                        { code: 'FREESHIP', amount: '0.00', type: 'shipping' },
                    ],
                })}
            />,
        )

        expect(screen.getByText('FREESHIP')).toBeInTheDocument()
        expect(screen.getByText('Free shipping')).toBeInTheDocument()
    })

    it('copies the discount code to the clipboard', async () => {
        const writeTextSpy = vi
            .spyOn(navigator.clipboard, 'writeText')
            .mockResolvedValue(undefined)

        const { user } = render(
            <DiscountsSection
                order={makeOrder({
                    discount_codes: [
                        { code: 'MAMA25', amount: '13.44', type: 'percentage' },
                    ],
                    discount_applications: [
                        {
                            code: 'MAMA25',
                            value: '25',
                            value_type: 'percentage',
                        },
                    ],
                })}
            />,
        )

        await user.click(screen.getByRole('button', { name: /copy code/i }))

        expect(writeTextSpy).toHaveBeenCalledWith('MAMA25')
    })
})
