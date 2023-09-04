import React from 'react'
import {act, render, screen} from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import TrendBadge from '../TrendBadge'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid="skeleton" />
))

describe('<TrendBadge />', () => {
    it('should not render the badge when no values provided', () => {
        const {container} = render(<TrendBadge />)

        expect(container).toBeEmpty()
    })

    it('should render the loading skeleton', () => {
        const {getAllByTestId} = render(<TrendBadge isLoading />)

        expect(getAllByTestId('skeleton')).toHaveLength(1)
    })

    it('should not render when prev value is zero and the format is percent', () => {
        const {container} = render(
            <TrendBadge value={2.3} prevValue={0} format="percent" />
        )

        expect(container.firstChild).toBe(null)
    })

    it('should render with positive color when more-is-better', () => {
        const {container} = render(
            <TrendBadge interpretAs="more-is-better" value={2} prevValue={1} />
        )

        expect(container.firstChild).toHaveClass('positive')
    })

    it('should render with negative color when less-is-better', () => {
        const {container} = render(
            <TrendBadge interpretAs="less-is-better" value={2} prevValue={1} />
        )

        expect(container.firstChild).toHaveClass('negative')
    })

    it('should render with negative color when more-is-better', () => {
        const {container} = render(
            <TrendBadge interpretAs="more-is-better" value={1} prevValue={2} />
        )
        expect(container.firstChild).toHaveClass('negative')
    })
    it('should render with positive color when less-is-better', () => {
        const {container} = render(
            <TrendBadge interpretAs="less-is-better" value={1} prevValue={2} />
        )
        expect(container.firstChild).toHaveClass('positive')
    })

    it('should render with neutral color when less-is-better', () => {
        const {container} = render(
            <TrendBadge interpretAs="less-is-better" value={0} prevValue={0} />
        )
        expect(container.firstChild).toHaveClass('neutral')
    })

    it('should render with neutral color when more-is-better', () => {
        const {container} = render(
            <TrendBadge interpretAs="more-is-better" value={0} prevValue={0} />
        )

        expect(container.firstChild).toHaveClass('neutral')
    })

    it('should render Badge tooltip', async () => {
        const badgeClass = 'badge'
        const tooltip = 'some tooltip text'

        render(
            <TrendBadge
                className={badgeClass}
                interpretAs="more-is-better"
                value={5}
                prevValue={10}
                tooltip={tooltip}
            />
        )
        const badge = document.querySelector(`[class*=${badgeClass}]`)

        act(() => {
            badge && userEvent.hover(badge)
        })

        expect(await screen.findByRole('tooltip')).toHaveTextContent(tooltip)
    })
})
