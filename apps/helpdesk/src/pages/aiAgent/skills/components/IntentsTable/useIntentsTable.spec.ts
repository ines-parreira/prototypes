import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'

import { useListIntents } from 'models/helpCenter/queries'

import { IntentStatus } from '../../types'
import { useIntentsTable } from './useIntentsTable'

jest.mock('models/helpCenter/queries', () => ({
    useListIntents: jest.fn(),
}))

const mockUseListIntents = useListIntents as jest.Mock

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

    it('should set L1 toggle state to indeterminate when some children are enabled', () => {
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
        expect(l1Intent.toggleState).toBe('indeterminate')
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
        it('should force "other::no reply" to handover status', () => {
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
            expect(l2Intent?.status).toBe(IntentStatus.Handover)
            expect(l2Intent?.toggleState).toBe('disabled')
        })

        it('should force "other::spam" to handover status', () => {
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
            expect(l2Intent?.status).toBe(IntentStatus.Handover)
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
})
