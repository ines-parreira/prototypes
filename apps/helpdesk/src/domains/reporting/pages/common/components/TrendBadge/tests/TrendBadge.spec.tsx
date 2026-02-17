import React from 'react'

import { userEvent } from '@repo/testing'
import { act, render, screen } from '@testing-library/react'

import TrendBadge, {
    DEFAULT_BADGE_TEXT,
} from 'domains/reporting/pages/common/components/TrendBadge/TrendBadge'
import { formatMetricValue } from 'domains/reporting/pages/common/utils'

jest.mock(
    '@gorgias/axiom',
    () =>
        ({
            ...jest.requireActual('@gorgias/axiom'),
            Skeleton: () => <div data-testid="skeleton" />,
        }) as typeof import('@gorgias/axiom'),
)

describe('<TrendBadge />', () => {
    it('should render the badge with default value when no values provided', () => {
        render(<TrendBadge />)

        expect(screen.getByText(DEFAULT_BADGE_TEXT)).toBeInTheDocument()
    })

    it('should render the loading skeleton', () => {
        const { getAllByTestId } = render(<TrendBadge isLoading />)

        expect(getAllByTestId('skeleton')).toHaveLength(1)
    })

    it('should render undefined variation text when prev value is zero and current value is non-zero', () => {
        const value = 2.3
        const prevValue = 0

        const { container } = render(
            <TrendBadge value={value} prevValue={prevValue} />,
        )

        expect(container.firstChild).not.toBe(null)
        expect(container.firstChild?.textContent).toEqual('-%')
    })

    it('should render 0% when both values are zero', () => {
        const { container } = render(<TrendBadge value={0} prevValue={0} />)

        expect(container.firstChild?.textContent).toEqual('0%')
    })

    it('should render unchanged color when showing undefined variation', () => {
        const { container } = render(<TrendBadge value={50} prevValue={0} />)

        expect(container.firstChild?.textContent).toEqual('-%')
        expect(container.firstChild).toHaveClass('unchanged')
    })

    it('should render with positive color when more-is-better', () => {
        const { container } = render(
            <TrendBadge interpretAs="more-is-better" value={2} prevValue={1} />,
        )

        expect(container.firstChild).toHaveClass('positive')
    })

    it('should render with negative color when less-is-better', () => {
        const { container } = render(
            <TrendBadge interpretAs="less-is-better" value={2} prevValue={1} />,
        )

        expect(container.firstChild).toHaveClass('negative')
    })

    it('should render with negative color when more-is-better', () => {
        const { container } = render(
            <TrendBadge interpretAs="more-is-better" value={1} prevValue={2} />,
        )
        expect(container.firstChild).toHaveClass('negative')
    })
    it('should render with positive color when less-is-better', () => {
        const { container } = render(
            <TrendBadge interpretAs="less-is-better" value={1} prevValue={2} />,
        )
        expect(container.firstChild).toHaveClass('positive')
    })

    it('should render with unchanged color when less-is-better', () => {
        const { container } = render(
            <TrendBadge interpretAs="less-is-better" value={0} prevValue={0} />,
        )
        expect(container.firstChild).toHaveClass('unchanged')
    })

    it('should render with unchanged color when more-is-better', () => {
        const { container } = render(
            <TrendBadge interpretAs="more-is-better" value={0} prevValue={0} />,
        )

        expect(container.firstChild).toHaveClass('unchanged')
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

        act(() => {
            badge && userEvent.hover(badge)
        })

        expect(await screen.findByRole('tooltip')).toHaveTextContent(
            tooltipResultingText,
        )
    })
})
