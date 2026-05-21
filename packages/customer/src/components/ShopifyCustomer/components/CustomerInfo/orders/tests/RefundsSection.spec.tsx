import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import type { OrderRefund } from '../../../../types'
import type { OrderDetailsData } from '../../types'
import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'
import { RefundsSection } from '../sections/RefundsSection'

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

vi.mock('@repo/preferences', () => ({
    useUserDateTimePreferences: () => ({
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '24h',
        timezone: undefined,
    }),
}))

const mockUseOrderFieldPreferences = vi.mocked(useOrderFieldPreferences)

function makeRefund(overrides: Partial<OrderRefund> = {}): OrderRefund {
    return {
        id: 1,
        order_id: 100,
        created_at: '2024-01-15T10:00:00Z',
        processed_at: '2024-01-15T10:00:00Z',
        note: null,
        refund_line_items: [],
        transactions: [
            { id: 1, amount: '25.00', kind: 'refund', status: 'success' },
        ],
        ...overrides,
    }
}

function makeOrder(
    overrides: Partial<OrderDetailsData> = {},
): OrderDetailsData {
    return { id: 1, ...overrides }
}

function mockSectionVisible(sectionVisible = true) {
    mockUseOrderFieldPreferences.mockReturnValue({
        preferences: {
            sections: { refunds: { fields: [], sectionVisible } },
        },
        getVisibleFields: vi.fn(),
        savePreferences: vi.fn(),
        isLoading: false,
    })
}

describe('RefundsSection', () => {
    beforeEach(() => mockSectionVisible())

    it('renders nothing when sectionVisible is false', () => {
        mockSectionVisible(false)

        const { container } = render(
            <RefundsSection order={makeOrder({ refunds: [makeRefund()] })} />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing when the order has no refunds', () => {
        const { container } = render(<RefundsSection order={makeOrder()} />)

        expect(container).toBeEmptyDOMElement()
    })

    it('renders the section heading and refund amount', () => {
        render(
            <RefundsSection
                order={makeOrder({
                    currency: 'USD',
                    refunds: [makeRefund()],
                })}
            />,
        )

        expect(screen.getByText('Refunds')).toBeInTheDocument()
        expect(screen.getByText('$25.00')).toBeInTheDocument()
    })

    it('sums amounts from multiple transactions in one refund', () => {
        render(
            <RefundsSection
                order={makeOrder({
                    currency: 'EUR',
                    refunds: [
                        makeRefund({
                            transactions: [
                                {
                                    id: 1,
                                    amount: '10.00',
                                    kind: 'refund',
                                    status: 'success',
                                },
                                {
                                    id: 2,
                                    amount: '5.50',
                                    kind: 'refund',
                                    status: 'success',
                                },
                            ],
                        }),
                    ],
                })}
            />,
        )

        expect(screen.getByText('€15.50')).toBeInTheDocument()
    })

    it('shows a Note row when the refund has a note', () => {
        render(
            <RefundsSection
                order={makeOrder({
                    refunds: [makeRefund({ note: 'Damaged item' })],
                })}
            />,
        )

        expect(screen.getByText('Note')).toBeInTheDocument()
        expect(screen.getByText('Damaged item')).toBeInTheDocument()
    })

    it('hides the Note row when the refund note is null', () => {
        render(
            <RefundsSection
                order={makeOrder({ refunds: [makeRefund({ note: null })] })}
            />,
        )

        expect(screen.queryByText('Note')).not.toBeInTheDocument()
    })

    it('copies the refund amount to the clipboard', async () => {
        const writeTextSpy = vi
            .spyOn(navigator.clipboard, 'writeText')
            .mockResolvedValue(undefined)

        const { user } = render(
            <RefundsSection
                order={makeOrder({
                    currency: 'USD',
                    refunds: [makeRefund()],
                })}
            />,
        )

        await user.click(
            screen.getByRole('button', { name: /copy refund amount/i }),
        )

        expect(writeTextSpy).toHaveBeenCalledWith('$25.00')
    })
})
