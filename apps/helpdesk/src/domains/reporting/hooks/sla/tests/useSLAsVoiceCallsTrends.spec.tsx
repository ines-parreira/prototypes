import { assumeMock, renderHook } from '@repo/testing'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    fetchBreachedSlaVoiceCallsTrend,
    fetchSlaAchievementRateVoiceCallsTrend,
    useBreachedSlaVoiceCallsTrend,
    useSlaAchievementRateVoiceCallsTrend,
} from 'domains/reporting/hooks/sla/useSLAsVoiceCallsTrends'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    breachedVoiceCallsQueryV2Factory,
    voiceCallsSlaAchievementRateQueryV2Factory,
} from 'domains/reporting/models/scopes/voiceSLA'
import type { RootState, StoreDispatch } from 'state/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('domains/reporting/hooks/useStatsMetricTrend')
const useStatsMetricTrendMock = assumeMock(useStatsMetricTrend)
const fetchStatsMetricTrendMock = assumeMock(fetchStatsMetricTrend)

jest.mock('domains/reporting/models/scopes/voiceSLA')
const breachedVoiceCallsQueryV2FactoryMock = assumeMock(
    breachedVoiceCallsQueryV2Factory,
)
const voiceCallsSlaAchievementRateQueryV2FactoryMock = assumeMock(
    voiceCallsSlaAchievementRateQueryV2Factory,
)

describe('useSLAsVoiceCallsTrends', () => {
    const startDate = '2021-05-01T00:00:00+02:00'
    const endDate = '2021-05-04T23:59:59+02:00'
    const filters = {
        period: {
            start_datetime: startDate,
            end_datetime: endDate,
        },
    }
    const userTimezone = 'UTC'
    const mockQuery = { metricName: 'test', measures: ['test'] }

    beforeEach(() => {
        breachedVoiceCallsQueryV2FactoryMock.mockReturnValue(mockQuery)
        voiceCallsSlaAchievementRateQueryV2FactoryMock.mockReturnValue(
            mockQuery,
        )
    })

    describe('useBreachedSlaVoiceCallsTrend', () => {
        it('should call useStatsMetricTrend with current and previous period queries', () => {
            renderHook(
                () => useBreachedSlaVoiceCallsTrend(filters, userTimezone),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore({})}>{children}</Provider>
                    ),
                },
            )

            expect(breachedVoiceCallsQueryV2FactoryMock).toHaveBeenCalledTimes(
                2,
            )
            expect(breachedVoiceCallsQueryV2FactoryMock).toHaveBeenCalledWith({
                filters,
                timezone: userTimezone,
            })
            expect(useStatsMetricTrendMock).toHaveBeenCalledWith(
                mockQuery,
                mockQuery,
            )
        })
    })

    describe('fetchBreachedSlaVoiceCallsTrend', () => {
        it('should call fetchStatsMetricTrend with current and previous period queries', async () => {
            await fetchBreachedSlaVoiceCallsTrend(filters, userTimezone)

            expect(breachedVoiceCallsQueryV2FactoryMock).toHaveBeenCalledTimes(
                2,
            )
            expect(breachedVoiceCallsQueryV2FactoryMock).toHaveBeenCalledWith({
                filters,
                timezone: userTimezone,
            })
            expect(fetchStatsMetricTrendMock).toHaveBeenCalledWith(
                mockQuery,
                mockQuery,
            )
        })
    })

    describe('useSlaAchievementRateVoiceCallsTrend', () => {
        it('should call useStatsMetricTrend with current and previous period queries', () => {
            renderHook(
                () =>
                    useSlaAchievementRateVoiceCallsTrend(filters, userTimezone),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore({})}>{children}</Provider>
                    ),
                },
            )

            expect(
                voiceCallsSlaAchievementRateQueryV2FactoryMock,
            ).toHaveBeenCalledTimes(2)
            expect(
                voiceCallsSlaAchievementRateQueryV2FactoryMock,
            ).toHaveBeenCalledWith({
                filters,
                timezone: userTimezone,
            })
            expect(useStatsMetricTrendMock).toHaveBeenCalledWith(
                mockQuery,
                mockQuery,
            )
        })
    })

    describe('fetchSlaAchievementRateVoiceCallsTrend', () => {
        it('should call fetchStatsMetricTrend with current and previous period queries', async () => {
            await fetchSlaAchievementRateVoiceCallsTrend(filters, userTimezone)

            expect(
                voiceCallsSlaAchievementRateQueryV2FactoryMock,
            ).toHaveBeenCalledTimes(2)
            expect(
                voiceCallsSlaAchievementRateQueryV2FactoryMock,
            ).toHaveBeenCalledWith({
                filters,
                timezone: userTimezone,
            })
            expect(fetchStatsMetricTrendMock).toHaveBeenCalledWith(
                mockQuery,
                mockQuery,
            )
        })
    })
})
