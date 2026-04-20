import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'

import { useListIntents } from 'models/helpCenter/queries'

import { IntentStatus } from '../types'
import { useIntentsMetrics } from './useIntentsMetrics'
import { useIntentsTable } from './useIntentsTable'

jest.mock('models/helpCenter/queries', () => ({
    useListIntents: jest.fn(),
}))

jest.mock('./useIntentsMetrics', () => ({
    useIntentsMetrics: jest.fn(),
}))

const mockUseListIntents = useListIntents as jest.Mock
const mockUseIntentsMetrics = useIntentsMetrics as jest.Mock

describe('useIntentsTable', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) =>
        QueryClientProvider({ client: queryClient, children })

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()

        mockUseIntentsMetrics.mockReturnValue({
            data: new Map(),
            isLoading: false,
            isError: false,
            metricsDateRange: {
                start_datetime: '2024-01-01',
                end_datetime: '2024-01-28',
            },
        })
    })

    it('should return empty array when no intents data', () => {
        mockUseListIntents.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useIntentsTable(123), { wrapper })

        expect(result.current.intents).toEqual([])
    })

    it('should transform intents into L1/L2 hierarchy', () => {
        mockUseListIntents.mockReturnValue({
            data: {
                intents: [
                    {
                        name: 'order::status',
                        status: 'not_linked',
                        help_center_id: 123,
                        articles: [],
                    },
                    {
                        name: 'order::cancel',
                        status: 'linked',
                        help_center_id: 123,
                        articles: [
                            {
                                id: 1,
                                title: 'How to cancel',
                                status: 'published',
                            },
                        ],
                    },
                ],
            },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useIntentsTable(123), { wrapper })

        expect(result.current.intents).toHaveLength(1)
        expect(result.current.intents[0].name).toBe('order')
        expect(result.current.intents[0].children).toHaveLength(2)
    })

    it('should set L2 toggle state to enabled for not_linked status', () => {
        mockUseListIntents.mockReturnValue({
            data: {
                intents: [
                    {
                        name: 'order::status',
                        status: IntentStatus.NotLinked,
                        help_center_id: 123,
                        articles: [],
                    },
                ],
            },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useIntentsTable(123), { wrapper })

        const l2Intent = result.current.intents[0].children?.[0]
        expect(l2Intent?.toggleState).toBe('enabled')
    })

    it('should set L2 toggle state to enabled for linked status', () => {
        mockUseListIntents.mockReturnValue({
            data: {
                intents: [
                    {
                        name: 'order::cancel',
                        status: IntentStatus.Linked,
                        help_center_id: 123,
                        articles: [],
                    },
                ],
            },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useIntentsTable(123), { wrapper })

        const l2Intent = result.current.intents[0].children?.[0]
        expect(l2Intent?.toggleState).toBe('enabled')
    })

    it('should set L2 toggle state to disabled for handover status', () => {
        mockUseListIntents.mockReturnValue({
            data: {
                intents: [
                    {
                        name: 'order::refund',
                        status: IntentStatus.Handover,
                        help_center_id: 123,
                        articles: [],
                    },
                ],
            },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useIntentsTable(123), { wrapper })

        const l2Intent = result.current.intents[0].children?.[0]
        expect(l2Intent?.toggleState).toBe('disabled')
    })

    it('should set L1 toggle state to enabled when all children are enabled', () => {
        mockUseListIntents.mockReturnValue({
            data: {
                intents: [
                    {
                        name: 'order::status',
                        status: IntentStatus.NotLinked,
                        help_center_id: 123,
                        articles: [],
                    },
                    {
                        name: 'order::cancel',
                        status: IntentStatus.Linked,
                        help_center_id: 123,
                        articles: [],
                    },
                ],
            },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useIntentsTable(123), { wrapper })

        const l1Intent = result.current.intents[0]
        expect(l1Intent.toggleState).toBe('enabled')
    })

    it('should set L1 toggle state to disabled when all children are disabled', () => {
        mockUseListIntents.mockReturnValue({
            data: {
                intents: [
                    {
                        name: 'order::status',
                        status: IntentStatus.Handover,
                        help_center_id: 123,
                        articles: [],
                    },
                    {
                        name: 'order::cancel',
                        status: IntentStatus.Handover,
                        help_center_id: 123,
                        articles: [],
                    },
                ],
            },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useIntentsTable(123), { wrapper })

        const l1Intent = result.current.intents[0]
        expect(l1Intent.toggleState).toBe('disabled')
    })

    it('should set L1 toggle state to enabled when at least one child is enabled', () => {
        mockUseListIntents.mockReturnValue({
            data: {
                intents: [
                    {
                        name: 'order::status',
                        status: IntentStatus.NotLinked,
                        help_center_id: 123,
                        articles: [],
                    },
                    {
                        name: 'order::cancel',
                        status: IntentStatus.Handover,
                        help_center_id: 123,
                        articles: [],
                    },
                ],
            },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useIntentsTable(123), { wrapper })

        const l1Intent = result.current.intents[0]
        expect(l1Intent.toggleState).toBe('enabled')
    })

    it('should filter only published articles', () => {
        mockUseListIntents.mockReturnValue({
            data: {
                intents: [
                    {
                        name: 'order::status',
                        status: IntentStatus.Linked,
                        help_center_id: 123,
                        articles: [
                            {
                                id: 1,
                                locale: 'en-US',
                                article_translation_version_id: 456,
                                title: 'Published article',
                                status: 'published',
                                template_key: 'ai_skill_1',
                                visibility_status: 'PUBLIC',
                            },
                            {
                                id: 2,
                                locale: 'en-US',
                                article_translation_version_id: 457,
                                title: 'Draft article',
                                status: 'draft',
                                template_key: null,
                                visibility_status: 'PUBLIC',
                            },
                        ],
                    },
                ],
            },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useIntentsTable(123), { wrapper })

        const l2Intent = result.current.intents[0].children?.[0]
        expect(l2Intent?.articles).toHaveLength(1)
        expect(l2Intent?.articles?.[0].title).toBe('Published article')
    })

    it('should skip intents with invalid name format', () => {
        mockUseListIntents.mockReturnValue({
            data: {
                intents: [
                    {
                        name: 'invalid',
                        status: IntentStatus.NotLinked,
                        help_center_id: 123,
                        articles: [],
                    },
                    {
                        name: 'order::status',
                        status: IntentStatus.NotLinked,
                        help_center_id: 123,
                        articles: [],
                    },
                ],
            },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useIntentsTable(123), { wrapper })

        expect(result.current.intents).toHaveLength(1)
        expect(result.current.intents[0].name).toBe('order')
    })

    it('should format intent names correctly', () => {
        mockUseListIntents.mockReturnValue({
            data: {
                intents: [
                    {
                        name: 'order::missing item',
                        status: IntentStatus.NotLinked,
                        help_center_id: 123,
                        articles: [],
                    },
                ],
            },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useIntentsTable(123), { wrapper })

        const l1Intent = result.current.intents[0]
        const l2Intent = l1Intent.children?.[0]

        expect(l1Intent.formattedName).toBe('Order')
        expect(l2Intent?.formattedName).toBe('Missing Item')
    })

    it('should add descriptions to L2 intents', () => {
        mockUseListIntents.mockReturnValue({
            data: {
                intents: [
                    {
                        name: 'order::status',
                        status: IntentStatus.NotLinked,
                        help_center_id: 123,
                        articles: [],
                    },
                ],
            },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useIntentsTable(123), { wrapper })

        const l2Intent = result.current.intents[0].children?.[0]
        expect(l2Intent?.description).toBe(
            'Questions about order status or tracking information',
        )
    })

    describe('Handover-only intents', () => {
        it('should set toggle disabled for "other::no reply"', () => {
            mockUseListIntents.mockReturnValue({
                data: {
                    intents: [
                        {
                            name: 'other::no reply',
                            status: IntentStatus.NotLinked,
                            help_center_id: 123,
                            articles: [],
                        },
                    ],
                },
                isLoading: false,
                isError: false,
            })

            const { result } = renderHook(() => useIntentsTable(123), {
                wrapper,
            })

            const l2Intent = result.current.intents[0].children?.[0]
            expect(l2Intent?.status).toBe(IntentStatus.NotLinked)
            expect(l2Intent?.toggleState).toBe('disabled')
        })

        it('should set toggle disabled for "other::spam"', () => {
            mockUseListIntents.mockReturnValue({
                data: {
                    intents: [
                        {
                            name: 'other::spam',
                            status: IntentStatus.Linked,
                            help_center_id: 123,
                            articles: [],
                        },
                    ],
                },
                isLoading: false,
                isError: false,
            })

            const { result } = renderHook(() => useIntentsTable(123), {
                wrapper,
            })

            const l2Intent = result.current.intents[0].children?.[0]
            expect(l2Intent?.status).toBe(IntentStatus.Linked)
            expect(l2Intent?.toggleState).toBe('disabled')
        })

        it('should not override status for other handover intents', () => {
            mockUseListIntents.mockReturnValue({
                data: {
                    intents: [
                        {
                            name: 'order::cancel',
                            status: IntentStatus.Handover,
                            help_center_id: 123,
                            articles: [],
                        },
                    ],
                },
                isLoading: false,
                isError: false,
            })

            const { result } = renderHook(() => useIntentsTable(123), {
                wrapper,
            })

            const l2Intent = result.current.intents[0].children?.[0]
            expect(l2Intent?.status).toBe(IntentStatus.Handover)
            expect(l2Intent?.toggleState).toBe('disabled')
        })
    })

    describe('Metrics enrichment', () => {
        it('should enrich L2 intents with metrics data', () => {
            const metricsMap = new Map([
                [
                    'order::status',
                    {
                        ticketVolume: 100,
                        ticketVolumePercent: 50,
                        handoverCount: 20,
                        handoverPercent: 20,
                    },
                ],
            ])

            mockUseIntentsMetrics.mockReturnValue({
                data: metricsMap,
                isLoading: false,
                isError: false,
                metricsDateRange: {
                    start_datetime: '2024-01-01',
                    end_datetime: '2024-01-28',
                },
            })

            mockUseListIntents.mockReturnValue({
                data: {
                    intents: [
                        {
                            name: 'order::status',
                            status: IntentStatus.NotLinked,
                            help_center_id: 123,
                            articles: [],
                        },
                    ],
                },
                isLoading: false,
                isError: false,
            })

            const { result } = renderHook(() => useIntentsTable(123), {
                wrapper,
            })

            const l2Intent = result.current.intents[0].children?.[0]
            expect(l2Intent?.metrics).toEqual({
                ticketVolume: 100,
                ticketVolumePercent: 50,
                handoverCount: 20,
                handoverPercent: 20,
            })
        })

        it('should aggregate L2 metrics into L1 metrics', () => {
            const metricsMap = new Map([
                [
                    'order::status',
                    {
                        ticketVolume: 100,
                        ticketVolumePercent: 50,
                        handoverCount: 20,
                        handoverPercent: 20,
                    },
                ],
                [
                    'order::cancel',
                    {
                        ticketVolume: 50,
                        ticketVolumePercent: 25,
                        handoverCount: 10,
                        handoverPercent: 20,
                    },
                ],
                [
                    'order',
                    {
                        ticketVolume: 150,
                        ticketVolumePercent: 75,
                        handoverCount: 30,
                        handoverPercent: 20,
                    },
                ],
            ])

            mockUseIntentsMetrics.mockReturnValue({
                data: metricsMap,
                isLoading: false,
                isError: false,
                metricsDateRange: {
                    start_datetime: '2024-01-01',
                    end_datetime: '2024-01-28',
                },
            })

            mockUseListIntents.mockReturnValue({
                data: {
                    intents: [
                        {
                            name: 'order::status',
                            status: IntentStatus.NotLinked,
                            help_center_id: 123,
                            articles: [],
                        },
                        {
                            name: 'order::cancel',
                            status: IntentStatus.NotLinked,
                            help_center_id: 123,
                            articles: [],
                        },
                    ],
                },
                isLoading: false,
                isError: false,
            })

            const { result } = renderHook(() => useIntentsTable(123), {
                wrapper,
            })

            const l1Intent = result.current.intents[0]
            expect(l1Intent.metrics?.ticketVolume).toBe(150)
            expect(l1Intent.metrics?.handoverCount).toBe(30)
            expect(l1Intent.metrics?.ticketVolumePercent).toBe(75)
            expect(l1Intent.metrics?.handoverPercent).toBe(20)
        })

        it('should not add metrics to L1 when children have no metrics', () => {
            mockUseIntentsMetrics.mockReturnValue({
                data: new Map(),
                isLoading: false,
                isError: false,
                metricsDateRange: {
                    start_datetime: '2024-01-01',
                    end_datetime: '2024-01-28',
                },
            })

            mockUseListIntents.mockReturnValue({
                data: {
                    intents: [
                        {
                            name: 'order::status',
                            status: IntentStatus.NotLinked,
                            help_center_id: 123,
                            articles: [],
                        },
                    ],
                },
                isLoading: false,
                isError: false,
            })

            const { result } = renderHook(() => useIntentsTable(123), {
                wrapper,
            })

            const l1Intent = result.current.intents[0]
            expect(l1Intent.metrics).toBeUndefined()
        })

        it('should return metrics loading state', () => {
            mockUseIntentsMetrics.mockReturnValue({
                data: new Map(),
                isLoading: true,
                isError: false,
                metricsDateRange: {
                    start_datetime: '2024-01-01',
                    end_datetime: '2024-01-28',
                },
            })

            mockUseListIntents.mockReturnValue({
                data: {
                    intents: [],
                },
                isLoading: false,
                isError: false,
            })

            const { result } = renderHook(() => useIntentsTable(123), {
                wrapper,
            })

            expect(result.current.isMetricsLoading).toBe(true)
        })

        it('should return metrics error state', () => {
            mockUseIntentsMetrics.mockReturnValue({
                data: new Map(),
                isLoading: false,
                isError: true,
                metricsDateRange: {
                    start_datetime: '2024-01-01',
                    end_datetime: '2024-01-28',
                },
            })

            mockUseListIntents.mockReturnValue({
                data: {
                    intents: [],
                },
                isLoading: false,
                isError: false,
            })

            const { result } = renderHook(() => useIntentsTable(123), {
                wrapper,
            })

            expect(result.current.isMetricsError).toBe(true)
        })
    })
})
