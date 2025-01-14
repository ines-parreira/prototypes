import {waitFor} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'

import {TicketChannel} from 'business/types/ticket'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {useDistributionTrendReportData} from 'hooks/reporting/common/useDistributionTrendReportData'
import {LegacyStatsFilters} from 'models/stat/types'
import {NOT_AVAILABLE_LABEL} from 'services/reporting/constants'

describe('useDistributionTrendReportData', () => {
    const defaultStatsFilters: LegacyStatsFilters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
        channels: [TicketChannel.Chat],
        integrations: [integrationsState.integrations[0].id],
        agents: [agents[0].id],
        tags: [1],
    }

    const emailResult = {
        label: 'email',
        value: 1,
    }
    const facebookResult = {
        label: 'facebook',
        value: 5,
    }
    const emailPreviousResult = {
        label: 'email',
        value: 2,
    }
    const facebookPreviousResult = {
        label: 'facebook',
        value: 8,
    }
    const workloadData = [emailResult, facebookResult]
    const workloadPreviousData = [emailPreviousResult, facebookPreviousResult]
    const labelPrefix = 'someLabel'

    it('should fetch and format results', async () => {
        const distributionsConfig = {
            fetchCurrentDistribution: jest
                .fn()
                .mockResolvedValue({data: workloadData}),
            fetchPreviousDistribution: jest
                .fn()
                .mockResolvedValue({data: workloadPreviousData}),
            labelPrefix,
        }

        const {result} = renderHook(() =>
            useDistributionTrendReportData(
                defaultStatsFilters,
                'UTC',
                distributionsConfig
            )
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                data: [
                    {
                        label: `${labelPrefix} - ${emailResult.label}`,
                        value: emailResult.value,
                        prevValue: emailPreviousResult.value,
                    },
                    {
                        label: `${labelPrefix} - ${facebookResult.label}`,
                        value: facebookResult.value,
                        prevValue: facebookPreviousResult.value,
                    },
                ],
            })
        })
    })

    it('should mark unavailable data', async () => {
        const distributionsConfig = {
            fetchCurrentDistribution: jest
                .fn()
                .mockResolvedValue({data: workloadData}),
            fetchPreviousDistribution: jest.fn().mockResolvedValue({data: []}),
            labelPrefix,
        }

        const {result} = renderHook(() =>
            useDistributionTrendReportData(
                defaultStatsFilters,
                'UTC',
                distributionsConfig
            )
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                data: [
                    {
                        label: `${labelPrefix} - ${emailResult.label}`,
                        value: emailResult.value,
                        prevValue: NOT_AVAILABLE_LABEL,
                    },
                    {
                        label: `${labelPrefix} - ${facebookResult.label}`,
                        value: facebookResult.value,
                        prevValue: NOT_AVAILABLE_LABEL,
                    },
                ],
            })
        })
    })

    it('should return empty data on fetch error', async () => {
        const distributionsConfig = {
            fetchCurrentDistribution: jest.fn().mockRejectedValue({}),
            fetchPreviousDistribution: jest.fn().mockRejectedValue({}),
            labelPrefix,
        }
        const {result} = renderHook(() =>
            useDistributionTrendReportData(
                defaultStatsFilters,
                'UTC',
                distributionsConfig
            )
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                data: [],
            })
        })
    })

    it('should return empty data when no fetch config provided', async () => {
        const {result} = renderHook(() =>
            useDistributionTrendReportData(
                defaultStatsFilters,
                'UTC',
                undefined
            )
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                data: [],
            })
        })
    })
})
