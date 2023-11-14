import React from 'react'
import {render, screen} from '@testing-library/react'
import OverviewCard, {OverviewCardProps} from '../OverviewCard'

const renderComponent = (props: Partial<OverviewCardProps>) => {
    return render(
        <OverviewCard
            isLoading={false}
            trendValue={2}
            prevTrendValue={1}
            showTip={true}
            title="Article Overview"
            hintTitle="hint"
            startDate="1696516016305"
            endDate="1696516016305"
            tipContent={
                <div>
                    learn about strategies you can use to increase article views
                    for your Help Center
                </div>
            }
            {...props}
        />
    )
}

describe('<OverviewCard />', () => {
    it('should render with trend values', () => {
        const trendValue = 120
        const prevTrendValue = 110
        renderComponent({trendValue, prevTrendValue})

        expect(
            screen.getByText(new RegExp(String(trendValue)))
        ).toBeInTheDocument()
        expect(
            screen.getByText(new RegExp(String(prevTrendValue)))
        ).toBeInTheDocument()
    })

    it('should render default value when no trend values', () => {
        const trendValue = undefined
        const prevTrendValue = undefined
        renderComponent({trendValue, prevTrendValue})

        expect(screen.getByText(new RegExp('from N/A'))).toBeInTheDocument()
    })

    it('should show loader when component loading', () => {
        renderComponent({isLoading: true})

        expect(document.querySelector('.skeleton')).toBeInTheDocument()
    })

    it('should hide tip when showTip is false', () => {
        renderComponent({showTip: false})

        expect(
            screen.queryByText('article views for your Help Center')
        ).not.toBeInTheDocument()
    })

    it('should show no data state', () => {
        renderComponent({
            isLoading: false,
            prevTrendValue: null,
            trendValue: null,
        })

        expect(
            screen.queryByText('No data available for the selected filters.')
        ).toBeInTheDocument()
    })
})
