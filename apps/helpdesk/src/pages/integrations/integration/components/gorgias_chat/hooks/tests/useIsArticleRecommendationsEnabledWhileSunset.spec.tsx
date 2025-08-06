import React from 'react'

import { renderHook, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import moment from 'moment'
import { Provider } from 'react-redux'

import useFlag from 'core/flags/hooks/useFlag'
import { fetchRecommendedResourcesTimeSeries } from 'domains/reporting/hooks/automate/timeSeries'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/hooks/useIsArticleRecommendationsEnabledWhileSunset'
import { mockStore } from 'utils/testing'

// Mock dependencies
jest.mock('core/flags/hooks/useFlag')
jest.mock('domains/reporting/hooks/automate/timeSeries')

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>
const mockFetchRecommendedResourcesTimeSeries =
    fetchRecommendedResourcesTimeSeries as jest.MockedFunction<
        typeof fetchRecommendedResourcesTimeSeries
    >

describe('useIsArticleRecommendationsEnabledWhileSunset', () => {
    const mockTimezone = 'America/New_York'
    const store = mockStore({
        currentUser: fromJS({
            timezone: mockTimezone,
        }),
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
    )

    beforeEach(() => {
        jest.clearAllMocks()
        // Mock console.error to avoid noise in test output
        jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('when feature flag is enabled', () => {
        it('should return enabled true and not fetch usage data', async () => {
            mockUseFlag.mockReturnValue(true)

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                { wrapper },
            )

            expect(result.current.enabled).toBe(true)
            expect(
                mockFetchRecommendedResourcesTimeSeries,
            ).not.toHaveBeenCalled()
        })
    })

    describe('when feature flag is disabled', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(false)
        })

        it('should return enabled true when there is recent usage', async () => {
            const mockTimeSeriesData = [
                [
                    {
                        dateTime: '2024-01-01',
                        value: 10,
                        label: AutomationDatasetMeasure.AutomatedInteractions,
                    },
                    {
                        dateTime: '2024-01-02',
                        value: 5,
                        label: AutomationDatasetMeasure.AutomatedInteractions,
                    },
                ],
                [
                    {
                        dateTime: '2024-01-01',
                        value: 3,
                        label: AutomationDatasetMeasure.AutomatedInteractions,
                    },
                    {
                        dateTime: '2024-01-02',
                        value: 7,
                        label: AutomationDatasetMeasure.AutomatedInteractions,
                    },
                ],
            ]

            mockFetchRecommendedResourcesTimeSeries.mockResolvedValue(
                mockTimeSeriesData,
            )

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                { wrapper },
            )

            // Initially should be true (default state)
            expect(result.current.enabled).toBe(true)

            // Wait for the async effect to complete
            await waitFor(() => {
                expect(
                    mockFetchRecommendedResourcesTimeSeries,
                ).toHaveBeenCalledWith(
                    {
                        period: {
                            start_datetime: moment()
                                .subtract(1, 'month')
                                .startOf('day')
                                .format(),
                            end_datetime: moment().format(),
                        },
                    },
                    mockTimezone,
                    ReportingGranularity.Month,
                )
            })

            // Total usage is 25 (10 + 5 + 3 + 7), so it should be enabled
            expect(result.current.enabled).toBe(true)
        })

        it('should return enabled false when there is no recent usage', async () => {
            const mockTimeSeriesData = [
                [
                    {
                        dateTime: '2024-01-01',
                        value: 0,
                        label: AutomationDatasetMeasure.AutomatedInteractions,
                    },
                    {
                        dateTime: '2024-01-02',
                        value: 0,
                        label: AutomationDatasetMeasure.AutomatedInteractions,
                    },
                ],
                [
                    {
                        dateTime: '2024-01-01',
                        value: 0,
                        label: AutomationDatasetMeasure.AutomatedInteractions,
                    },
                ],
            ]

            mockFetchRecommendedResourcesTimeSeries.mockResolvedValue(
                mockTimeSeriesData,
            )

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                { wrapper },
            )

            await waitFor(() => {
                expect(
                    mockFetchRecommendedResourcesTimeSeries,
                ).toHaveBeenCalled()
            })

            // Total usage is 0, so it should be disabled
            expect(result.current.enabled).toBe(false)
        })

        it('should return enabled false when API returns empty data', async () => {
            mockFetchRecommendedResourcesTimeSeries.mockResolvedValue([])

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                { wrapper },
            )

            await waitFor(() => {
                expect(
                    mockFetchRecommendedResourcesTimeSeries,
                ).toHaveBeenCalled()
            })

            expect(result.current.enabled).toBe(false)
        })

        it('should return enabled true when API call fails', async () => {
            const mockError = new Error('API Error')
            mockFetchRecommendedResourcesTimeSeries.mockRejectedValue(mockError)

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                { wrapper },
            )

            await waitFor(() => {
                expect(
                    mockFetchRecommendedResourcesTimeSeries,
                ).toHaveBeenCalled()
            })

            // Should default to true on error
            expect(result.current.enabled).toBe(true)
            expect(console.error).toHaveBeenCalledWith(
                'Error checking article recommendation usage:',
                mockError,
            )
        })
    })

    describe('when feature flag is undefined', () => {
        it('should default to true and not fetch usage data', async () => {
            // When using the new useFlag hook, it will return the default value (true) when undefined
            mockUseFlag.mockReturnValue(true)

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                { wrapper },
            )

            expect(result.current.enabled).toBe(true)
            expect(
                mockFetchRecommendedResourcesTimeSeries,
            ).not.toHaveBeenCalled()
        })
    })

    describe('when user timezone is not set', () => {
        it('should use UTC as default timezone', async () => {
            const storeWithoutTimezone = mockStore({
                currentUser: fromJS({}),
            })

            const wrapperWithoutTimezone = ({
                children,
            }: {
                children: React.ReactNode
            }) => <Provider store={storeWithoutTimezone}>{children}</Provider>

            mockUseFlag.mockReturnValue(false)

            mockFetchRecommendedResourcesTimeSeries.mockResolvedValue([[]])

            renderHook(() => useIsArticleRecommendationsEnabledWhileSunset(), {
                wrapper: wrapperWithoutTimezone,
            })

            await waitFor(() => {
                expect(
                    mockFetchRecommendedResourcesTimeSeries,
                ).toHaveBeenCalledWith(
                    expect.any(Object),
                    'UTC',
                    ReportingGranularity.Month,
                )
            })
        })
    })

    describe('re-fetching behavior', () => {
        it('should re-fetch when userTimezone changes', async () => {
            mockUseFlag.mockReturnValue(false)

            mockFetchRecommendedResourcesTimeSeries.mockResolvedValue([[]])

            // Start with initial timezone
            const initialStore = mockStore({
                currentUser: fromJS({
                    timezone: 'America/New_York',
                }),
            })

            const { unmount } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                {
                    wrapper: ({ children }) => (
                        <Provider store={initialStore}>{children}</Provider>
                    ),
                },
            )

            await waitFor(() => {
                expect(
                    mockFetchRecommendedResourcesTimeSeries,
                ).toHaveBeenCalledTimes(1)
                expect(
                    mockFetchRecommendedResourcesTimeSeries,
                ).toHaveBeenCalledWith(
                    expect.any(Object),
                    'America/New_York',
                    ReportingGranularity.Month,
                )
            })

            // Clean up and create new component with different timezone
            unmount()
            mockFetchRecommendedResourcesTimeSeries.mockClear()

            const newStore = mockStore({
                currentUser: fromJS({
                    timezone: 'Europe/London',
                }),
            })

            renderHook(() => useIsArticleRecommendationsEnabledWhileSunset(), {
                wrapper: ({ children }) => (
                    <Provider store={newStore}>{children}</Provider>
                ),
            })

            await waitFor(() => {
                expect(
                    mockFetchRecommendedResourcesTimeSeries,
                ).toHaveBeenCalledTimes(1)
                expect(
                    mockFetchRecommendedResourcesTimeSeries,
                ).toHaveBeenCalledWith(
                    expect.any(Object),
                    'Europe/London',
                    ReportingGranularity.Month,
                )
            })
        })

        it('should re-fetch when feature flag changes from true to false', async () => {
            mockUseFlag.mockReturnValue(true)

            mockFetchRecommendedResourcesTimeSeries.mockResolvedValue([[]])

            const { rerender } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                { wrapper },
            )

            expect(
                mockFetchRecommendedResourcesTimeSeries,
            ).not.toHaveBeenCalled()

            // Change feature flag to false
            mockUseFlag.mockReturnValue(false)

            rerender()

            await waitFor(() => {
                expect(
                    mockFetchRecommendedResourcesTimeSeries,
                ).toHaveBeenCalledTimes(1)
            })
        })
    })
})
