import { screen } from '@testing-library/react'

import {
    getDefaultSetOfRanges,
    PAST_7_DAYS,
    PAST_30_DAYS,
    PAST_60_DAYS,
} from 'pages/stats/constants'
import { PeriodShortcutSelector } from 'pages/stats/voice-of-customer/side-panel/TrendOverviewReport/PeriodShortcutSelector'
import { mergeStatsFilters } from 'state/stats/statsSlice'
import { renderWithStore } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

describe('PeriodShortcutSelector', () => {
    it('should render the component with "Show Date Range" button', () => {
        renderWithStore(<PeriodShortcutSelector />, {})

        expect(screen.getByText('Show Date Range')).toBeInTheDocument()
    })

    it('should open dropdown when button is clicked', () => {
        renderWithStore(<PeriodShortcutSelector />, {})

        const button = screen.getByText('Show Date Range')
        userEvent.click(button)

        expect(screen.getByText(PAST_7_DAYS)).toBeInTheDocument()
        expect(screen.getByText(PAST_30_DAYS)).toBeInTheDocument()
        expect(screen.getByText(PAST_60_DAYS)).toBeInTheDocument()
    })

    it('should dispatch mergeStatsFilters with correct period when a period is selected', () => {
        const { store } = renderWithStore(<PeriodShortcutSelector />, {})

        const button = screen.getByText('Show Date Range')
        userEvent.click(button)

        userEvent.click(screen.getByText(PAST_7_DAYS))

        const periods = getDefaultSetOfRanges()
        const periodDates = periods[PAST_7_DAYS]

        expect(store.getActions()).toContainEqual(
            mergeStatsFilters({
                period: {
                    start_datetime: periodDates[0].format(),
                    end_datetime: periodDates[1].format(),
                },
            }),
        )
    })

    it('should dispatch mergeStatsFilters with correct period for each option', () => {
        const { store } = renderWithStore(<PeriodShortcutSelector />, {})

        const periods = getDefaultSetOfRanges()
        const button = screen.getByText('Show Date Range')

        const periodOptions = [PAST_7_DAYS, PAST_30_DAYS, PAST_60_DAYS]

        for (const periodOption of periodOptions) {
            jest.clearAllMocks()

            userEvent.click(button)
            userEvent.click(screen.getByText(periodOption))

            const periodDates = periods[periodOption]

            expect(store.getActions()).toContainEqual(
                mergeStatsFilters({
                    period: {
                        start_datetime: periodDates[0].format(),
                        end_datetime: periodDates[1].format(),
                    },
                }),
            )
        }
    })
})
