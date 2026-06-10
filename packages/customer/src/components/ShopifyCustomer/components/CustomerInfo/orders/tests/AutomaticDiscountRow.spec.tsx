import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import type { AutomaticDiscountRowProps } from '../sections/AutomaticDiscountRow'
import { AutomaticDiscountRow } from '../sections/AutomaticDiscountRow'

vi.mock('@gorgias/toolkit-react', async (importOriginal) => ({
    ...((await importOriginal()) as Record<string, unknown>),
    useCopyToClipboard: () => [
        {},
        (text: string) => navigator.clipboard.writeText(text),
    ],
}))

function makeProps(
    overrides: Partial<AutomaticDiscountRowProps> = {},
): AutomaticDiscountRowProps {
    return {
        application: {
            title: 'Summer sale',
            value: '20.0',
            value_type: 'percentage',
        },
        moneySymbol: '$',
        ...overrides,
    }
}

describe('AutomaticDiscountRow', () => {
    it('renders the title', () => {
        render(<AutomaticDiscountRow {...makeProps()} />)

        expect(screen.getByText('Title')).toBeInTheDocument()
        expect(screen.getByText('Summer sale')).toBeInTheDocument()
    })

    it('renders a percentage discount value', () => {
        render(
            <AutomaticDiscountRow
                {...makeProps({
                    application: {
                        title: '35% off!',
                        value: '35.0',
                        value_type: 'percentage',
                    },
                })}
            />,
        )

        expect(screen.getByText('Discount')).toBeInTheDocument()
        expect(screen.getByText('35%')).toBeInTheDocument()
    })

    it('renders a fixed amount discount value', () => {
        render(
            <AutomaticDiscountRow
                {...makeProps({
                    application: {
                        title: '$10 off',
                        value: '10.00',
                        value_type: 'fixed_amount',
                    },
                    moneySymbol: '$',
                })}
            />,
        )

        expect(screen.getByText('Discount')).toBeInTheDocument()
        expect(screen.getByText('$10.00 off')).toBeInTheDocument()
    })

    it('omits the Discount row when the application has no value', () => {
        render(
            <AutomaticDiscountRow
                {...makeProps({
                    application: { title: 'free gift!' },
                })}
            />,
        )

        expect(screen.getByText('free gift!')).toBeInTheDocument()
        expect(screen.queryByText('Discount')).not.toBeInTheDocument()
    })

    it('copies the title to the clipboard', async () => {
        const writeTextSpy = vi
            .spyOn(navigator.clipboard, 'writeText')
            .mockResolvedValue(undefined)

        const { user } = render(<AutomaticDiscountRow {...makeProps()} />)

        await user.click(
            screen.getByRole('button', { name: /copy discount title/i }),
        )

        expect(writeTextSpy).toHaveBeenCalledWith('Summer sale')
    })

    it('copies the discount value to the clipboard', async () => {
        const writeTextSpy = vi
            .spyOn(navigator.clipboard, 'writeText')
            .mockResolvedValue(undefined)

        const { user } = render(<AutomaticDiscountRow {...makeProps()} />)

        await user.click(
            screen.getByRole('button', { name: /copy discount$/i }),
        )

        expect(writeTextSpy).toHaveBeenCalledWith('20%')
    })
})
