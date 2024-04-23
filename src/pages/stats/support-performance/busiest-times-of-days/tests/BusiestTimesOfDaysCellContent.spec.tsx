import {render, screen} from '@testing-library/react'
import React from 'react'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {BusiestTimesOfDaysCellContent} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysCellContent'
import {
    BusiestTimeOfDaysMetrics,
    DayOfWeek,
    HOUR_COLUMN,
} from 'pages/stats/support-performance/busiest-times-of-days/types'
import {hourFromHourIndex} from 'pages/stats/support-performance/busiest-times-of-days/utils'

describe('<BusiestTimesOfDaysCellContent />', () => {
    const defaultProps = {
        isLoading: false,
        metricValue: 1,
        metricName: BusiestTimeOfDaysMetrics.TicketsClosed,
        hour: 1,
        day: DayOfWeek.TUESDAY,
        isHeatmapMode: false,
        decile: 0,
        isWorkingHour: false,
    }
    it('should render loading skeleton', () => {
        render(
            <BusiestTimesOfDaysCellContent {...defaultProps} isLoading={true} />
        )
    })

    it('should render hour label', () => {
        render(
            <BusiestTimesOfDaysCellContent
                {...defaultProps}
                day={HOUR_COLUMN}
            />
        )

        expect(
            screen.getByText(hourFromHourIndex(defaultProps.hour))
        ).toBeInTheDocument()
    })

    it('should render formatted metric', () => {
        render(<BusiestTimesOfDaysCellContent {...defaultProps} />)

        expect(
            screen.getByText(
                formatMetricValue(
                    defaultProps.metricValue,
                    'integer',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )
        )
    })

    it('should render heatmap', () => {
        render(
            <BusiestTimesOfDaysCellContent
                {...defaultProps}
                isHeatmapMode={true}
            />
        )

        expect(
            document.querySelector(`.p${defaultProps.decile}`)
        ).toBeInTheDocument()
        expect(document.querySelector('.heatmap')).toBeInTheDocument()
    })

    it('should render business Hour indicator', () => {
        render(
            <BusiestTimesOfDaysCellContent
                {...defaultProps}
                isWorkingHour={true}
            />
        )

        expect(
            document.querySelector('.redTransparentStripesPseudoElement')
        ).toBeInTheDocument()
        expect(document.querySelector('.heatmap')).toBeInTheDocument()
    })
})
