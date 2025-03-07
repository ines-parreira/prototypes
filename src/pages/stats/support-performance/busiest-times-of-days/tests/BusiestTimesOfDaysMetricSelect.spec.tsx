import React from 'react'

import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useFlag } from 'core/flags'
import { BusiestTimesOfDaysMetricSelect } from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysMetricSelect'
import { BusiestTimeOfDaysMetrics } from 'pages/stats/support-performance/busiest-times-of-days/types'
import { metricLabels } from 'pages/stats/support-performance/busiest-times-of-days/utils'
import { RootState } from 'state/types'
import {
    busiestTimesSlice,
    setSelectedMetric,
} from 'state/ui/stats/busiestTimesSlice'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('core/flags')
const mockUseFlag = assumeMock(useFlag)

describe('<BusiestTimesOfDaysMetricSelect />', () => {
    it.each(Object.values(BusiestTimeOfDaysMetrics))(
        'should render current selection %metric',
        (metric) => {
            const state = {
                ui: {
                    stats: {
                        [busiestTimesSlice.name]: { selectedMetric: metric },
                    },
                },
            } as RootState

            renderWithStore(<BusiestTimesOfDaysMetricSelect />, state)

            expect(screen.getByText(metricLabels[metric])).toBeInTheDocument()
        },
    )

    it('should show Messages Received metric when feature flag enabled', () => {
        mockUseFlag.mockReturnValue(true)
        const currentMetric = BusiestTimeOfDaysMetrics.TicketsClosed
        const selectedMetric = BusiestTimeOfDaysMetrics.MessagesReceived
        const selectedLabel = metricLabels[selectedMetric]
        const state = {
            ui: {
                stats: {
                    [busiestTimesSlice.name]: { selectedMetric: currentMetric },
                },
            },
        } as RootState

        const { store } = renderWithStore(
            <BusiestTimesOfDaysMetricSelect />,
            state,
        )
        act(() => {
            userEvent.click(screen.getByRole('button'))
        })
        act(() => {
            userEvent.click(screen.getByText(selectedLabel))
        })

        expect(store.getActions()).toContainEqual(
            setSelectedMetric(selectedMetric),
        )
    })

    it('should call the change callback on click', () => {
        const currentMetric = BusiestTimeOfDaysMetrics.MessagesSent
        const selectedMetric = BusiestTimeOfDaysMetrics.TicketsClosed
        const selectedLabel = metricLabels[selectedMetric]
        const state = {
            ui: {
                stats: {
                    [busiestTimesSlice.name]: { selectedMetric: currentMetric },
                },
            },
        } as RootState

        const { store } = renderWithStore(
            <BusiestTimesOfDaysMetricSelect />,
            state,
        )
        act(() => {
            userEvent.click(screen.getByRole('button'))
        })
        act(() => {
            userEvent.click(screen.getByText(selectedLabel))
        })

        expect(store.getActions()).toContainEqual(
            setSelectedMetric(selectedMetric),
        )
    })
})
