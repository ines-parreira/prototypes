import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'

import { IconName } from '@gorgias/axiom'

import { DEFAULT_BADGE_TEXT, TREND_BADGE_FORMAT } from '../../constants'
import { formatMetricTrend, formatMetricValue } from '../../utils/helpers'
import { TrendBadge } from './TrendBadge'

vi.mock('@gorgias/axiom', async (importOriginal) => {
    const originalModule =
        (await importOriginal()) as typeof import('@gorgias/axiom')

    return {
        IconName: originalModule.IconName,
        Icon: originalModule.Icon,
        Skeleton: () => <div role="progressbar" />,
        LegacyTooltip: ({ children }: { children: React.ReactNode }) => (
            <div role="tooltip">{children}</div>
        ),
    }
})

describe('<TrendBadge />', () => {
    it('should render the badge with default value when no values provided', () => {
        render(<TrendBadge />)

        expect(screen.getByText(DEFAULT_BADGE_TEXT)).toBeInTheDocument()
    })

    it('should render the loading skeleton', () => {
        render(<TrendBadge isLoading />)

        expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should render when prev value is zero and the format is percent', () => {
        const value = 2.3
        const prevValue = 0

        render(<TrendBadge value={value} prevValue={prevValue} />)

        expect(screen.getByText(DEFAULT_BADGE_TEXT)).toBeInTheDocument()
    })

    it('should render Badge tooltip', async () => {
        const badgeClass = 'badge'
        const value = 5
        const prevValue = 10
        const tooltipData = { period: 'random text' }
        const tooltipResultingText = `Vs. ${formatMetricValue(prevValue)} on ${
            tooltipData.period
        }`

        render(
            <TrendBadge
                className={badgeClass}
                interpretAs="more-is-better"
                value={value}
                prevValue={prevValue}
                tooltipData={tooltipData}
            />,
        )
        const badge = document.querySelector(`[class*=${badgeClass}]`)

        if (badge) {
            await act(async () => {
                await userEvent.hover(badge)
            })
        }

        expect(await screen.findByRole('tooltip')).toHaveTextContent(
            tooltipResultingText,
        )
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
            expect.stringContaining(`#${IconName.TrendingUp}`),
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
            expect.stringContaining(`#${IconName.TrendingDown}`),
        )
    })
})
