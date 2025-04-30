import React from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useNotify } from 'hooks/useNotify'
import { ReportingGranularity } from 'models/reporting/types'
import {
    LeadColumn,
    TopProductsPerIntentColumnConfig,
} from 'pages/stats/voice-of-customer/product-insights/placeholder/TopProductsPerIntentConfig'
import { TopProductsPerIntentTable } from 'pages/stats/voice-of-customer/product-insights/placeholder/TopProductsPerIntentTable'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('hooks/useNotify')
const useNotifyMock = assumeMock(useNotify)

describe('TopProductsPerIntentTable', () => {
    const statsFilters = {
        period: {
            start_datetime: '2024-09-14T00:00:00+00:00',
            end_datetime: '2024-09-20T23:59:59+00:00',
        },
    }
    const notifyMock = jest.fn()

    beforeEach(() => {
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        useNotifyMock.mockReturnValue({ info: notifyMock } as any)
    })

    it('should render mocked data', () => {
        render(<TopProductsPerIntentTable intentsCustomFieldId={123} />)

        expect(screen.getAllByRole('row').length).not.toEqual(0)
    })

    it('should render Product in expanded rows', async () => {
        render(<TopProductsPerIntentTable intentsCustomFieldId={123} />)

        act(() => {
            userEvent.click(screen.getAllByText('arrow_right')[0])
        })

        await waitFor(() => {
            expect(
                screen.getByText(
                    'SonicWave Pro Noise-Canceling Headphones SWP-NC500',
                ),
            ).toBeInTheDocument()
        })
    })

    it('should trigger the sorting callback on header click', () => {
        render(<TopProductsPerIntentTable intentsCustomFieldId={123} />)
        userEvent.click(
            screen.getByText(
                TopProductsPerIntentColumnConfig[LeadColumn].title,
            ),
        )

        expect(notifyMock).toHaveBeenCalled()
    })
})
