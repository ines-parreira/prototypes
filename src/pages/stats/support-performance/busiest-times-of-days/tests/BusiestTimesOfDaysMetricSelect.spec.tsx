import userEvent from '@testing-library/user-event'
import {act, render, screen} from '@testing-library/react'
import React from 'react'
import {BusiestTimesOfDaysMetricSelect} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysMetricSelect'
import {BusiestTimeOfDaysMetrics} from 'pages/stats/support-performance/busiest-times-of-days/types'

import {metricLabels} from 'pages/stats/support-performance/busiest-times-of-days/utils'

describe('<BusiestTimesOfDaysMetricSelect />', () => {
    it.each(Object.values(BusiestTimeOfDaysMetrics))(
        'should render current selection %metric',
        (metric) => {
            render(
                <BusiestTimesOfDaysMetricSelect
                    selectedMetric={metric}
                    setSelectedMetric={jest.fn()}
                />
            )

            expect(screen.getByText(metricLabels[metric])).toBeInTheDocument()
        }
    )

    it('should call the change callback on click', () => {
        const currentMetric = BusiestTimeOfDaysMetrics.MessagesSent
        const selectedMetric = BusiestTimeOfDaysMetrics.TicketsClosed
        const selectedLabel = metricLabels[selectedMetric]
        const callbackSpy = jest.fn()

        render(
            <BusiestTimesOfDaysMetricSelect
                selectedMetric={currentMetric}
                setSelectedMetric={callbackSpy}
            />
        )
        act(() => {
            userEvent.click(screen.getByRole('button'))
        })
        act(() => {
            userEvent.click(screen.getByText(selectedLabel))
        })

        expect(callbackSpy).toHaveBeenCalledWith(selectedMetric)
    })
})
