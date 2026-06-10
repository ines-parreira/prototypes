import { render } from '@repo/testing/vitest'
import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, vi } from 'vitest'

import {
    DEFAULT_BADGE_TEXT,
    TREND_BADGE_FORMAT,
    UNDEFINED_VARIATION_TEXT,
} from '../../constants'
import { formatMetricTrend, formatMetricValue } from '../../utils/helpers'
import { TrendBadge } from './TrendBadge'

describe('<TrendBadge />', () => {
    it('should render the badge with default value when no values provided', () => {
        render(<TrendBadge />)

        expect(screen.getByText(DEFAULT_BADGE_TEXT)).toBeInTheDocument()
    })

    it('should render the loading skeleton', () => {
        const { container } = render(<TrendBadge isLoading />)

        expect(
            container.querySelector('[data-name="skeleton"]'),
        ).toBeInTheDocument()
    })

    it('should render undefined variation text when prev value is zero and current value is non-zero', () => {
        const value = 2.3
        const prevValue = 0

        render(<TrendBadge value={value} prevValue={prevValue} />)

        expect(screen.getByText(UNDEFINED_VARIATION_TEXT)).toBeInTheDocument()
    })

    it('should render 0% when both values are zero', () => {
        render(<TrendBadge value={0} prevValue={0} />)

        expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should not display trend icon when showing undefined variation', () => {
        render(<TrendBadge value={50} prevValue={0} />)

        expect(screen.getByText(UNDEFINED_VARIATION_TEXT)).toBeInTheDocument()
        expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    describe('tooltip', () => {
        beforeEach(() => {
            vi.useFakeTimers()
        })

        afterEach(() => {
            vi.runOnlyPendingTimers()
            vi.useRealTimers()
        })

        it('should render Badge tooltip', async () => {
            const user = userEvent.setup({
                advanceTimers: vi.advanceTimersByTime,
            })
            const value = 5
            const prevValue = 10
            const tooltipData = { period: 'random text' }
            const tooltipResultingText = `Compared to ${formatMetricValue(prevValue)} on ${tooltipData.period}`

            render(
                <TrendBadge
                    interpretAs="more-is-better"
                    value={value}
                    prevValue={prevValue}
                    tooltipData={tooltipData}
                />,
            )

            await user.tab()

            await act(async () => {
                await vi.runAllTimersAsync()
            })

            expect(screen.getByRole('tooltip')).toHaveTextContent(
                tooltipResultingText,
            )
        })
    })

    it('should render a formatted value when a value is provided', () => {
        const value = 10
        const prevValue = 5

        render(<TrendBadge value={value} prevValue={prevValue} />)

        const formattedValue =
            formatMetricTrend(value, prevValue, TREND_BADGE_FORMAT)
                .formattedTrend ?? ''

        expect(screen.getByText(formattedValue)).toBeTruthy()
        expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('should not render trend Icon when values are equal', async () => {
        const badgeClass = 'badge'
        const value = 5
        const prevValue = 5

        render(
            <TrendBadge
                className={badgeClass}
                interpretAs="more-is-better"
                value={value}
                prevValue={prevValue}
            />,
        )

        const svg = screen.queryByRole('img')
        expect(svg).not.toBeInTheDocument()
    })

    it('should render TrendingUp icon when value is greater than prevValue', async () => {
        const badgeClass = 'badge'
        const value = 5
        const prevValue = 2

        render(
            <TrendBadge
                className={badgeClass}
                interpretAs="more-is-better"
                value={value}
                prevValue={prevValue}
            />,
        )

        const svg = screen.getByRole('img')
        expect(svg).toBeInTheDocument()
        expect(svg.querySelector('use')).toHaveAttribute(
            'href',
            expect.stringContaining(`#${'trending-up'}`),
        )
    })

    it('should render TrendingDown icon when value is less than prevValue', async () => {
        const badgeClass = 'badge'
        const value = 5
        const prevValue = 20

        render(
            <TrendBadge
                className={badgeClass}
                interpretAs="more-is-better"
                value={value}
                prevValue={prevValue}
            />,
        )

        const svg = screen.getByRole('img')
        expect(svg).toBeInTheDocument()
        expect(svg.querySelector('use')).toHaveAttribute(
            'href',
            expect.stringContaining(`#${'trending-down'}`),
        )
    })
})
