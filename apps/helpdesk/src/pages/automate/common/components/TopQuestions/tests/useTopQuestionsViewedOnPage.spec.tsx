import { renderHook } from '@repo/testing'

import { useTopQuestionsViewedOnPage } from '../useTopQuestionsViewedOnPage'

const dateNow = new Date('2022-02-10T08:00:00Z')
const dateLater = new Date('2022-02-11T08:00:00Z')
const date2YearsLater = new Date('2024-02-10T08:00:00Z')

const helpCenter1Id = 10
const helpCenter2Id = 20

const store1IntegrationId = 100
const store2IntegrationId = 200

type Params = Parameters<typeof useTopQuestionsViewedOnPage>

describe('useTopQuestionsViewedOnPage', () => {
    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(dateNow)
        localStorage.clear()
    })

    it('returns false if called for the first time', () => {
        const { result } = renderHook(
            (params: Params) => useTopQuestionsViewedOnPage(...params),
            {
                initialProps: [
                    store1IntegrationId,
                    helpCenter1Id,
                    'ai-agent-overview',
                    dateNow,
                ],
            },
        )

        expect(result.current).toEqual(false)
    })

    it('sets page as viewed if store integration changes', () => {
        const { rerender, result } = renderHook(
            (params: Params) => useTopQuestionsViewedOnPage(...params),
            {
                initialProps: [
                    store1IntegrationId,
                    helpCenter1Id,
                    'ai-agent-overview',
                    dateNow,
                ],
            },
        )

        expect(result.current).toEqual(false)

        rerender([
            store2IntegrationId,
            helpCenter1Id,
            'ai-agent-overview',
            dateNow,
        ])

        expect(result.current).toEqual(false)

        rerender([
            store1IntegrationId,
            helpCenter1Id,
            'ai-agent-overview',
            dateNow,
        ])

        expect(result.current).toEqual(true)
    })

    it('sets page as viewed if help-center changes', () => {
        const { rerender, result } = renderHook(
            (params: Params) => useTopQuestionsViewedOnPage(...params),
            {
                initialProps: [
                    store1IntegrationId,
                    helpCenter1Id,
                    'ai-agent-overview',
                    dateNow,
                ],
            },
        )

        expect(result.current).toEqual(false)

        rerender([
            store1IntegrationId,
            helpCenter2Id,
            'ai-agent-overview',
            dateNow,
        ])

        expect(result.current).toEqual(false)

        rerender([
            store1IntegrationId,
            helpCenter1Id,
            'ai-agent-overview',
            dateNow,
        ])

        expect(result.current).toEqual(true)
    })

    it('sets page as viewed if page changes', () => {
        const { rerender, result } = renderHook(
            (params: Params) => useTopQuestionsViewedOnPage(...params),
            {
                initialProps: [
                    store1IntegrationId,
                    helpCenter1Id,
                    'ai-agent-overview',
                    dateNow,
                ],
            },
        )

        expect(result.current).toEqual(false)

        rerender([
            store1IntegrationId,
            helpCenter1Id,
            'all-recommendations',
            dateNow,
        ])

        expect(result.current).toEqual(false)

        rerender([
            store1IntegrationId,
            helpCenter1Id,
            'ai-agent-overview',
            dateNow,
        ])

        expect(result.current).toEqual(true)
    })

    it('returns false if visited before the current batch', () => {
        const { rerender, result } = renderHook(
            (params: Params) => useTopQuestionsViewedOnPage(...params),
            {
                initialProps: [
                    store1IntegrationId,
                    helpCenter1Id,
                    'ai-agent-overview',
                    dateNow,
                ],
            },
        )

        expect(result.current).toEqual(false)

        rerender([
            store1IntegrationId,
            helpCenter1Id,
            'all-recommendations',
            dateNow,
        ])

        expect(result.current).toEqual(false)

        rerender([
            store1IntegrationId,
            helpCenter1Id,
            'ai-agent-overview',
            dateNow,
        ])

        expect(result.current).toEqual(true)

        rerender([
            store1IntegrationId,
            helpCenter1Id,
            'ai-agent-overview',
            dateLater,
        ])

        expect(result.current).toEqual(false)
    })

    it('sets page as viewed on unmount', () => {
        const { result, unmount } = renderHook(
            (params: Params) => useTopQuestionsViewedOnPage(...params),
            {
                initialProps: [
                    store1IntegrationId,
                    helpCenter1Id,
                    'ai-agent-overview',
                    dateNow,
                ],
            },
        )

        expect(result.current).toEqual(false)

        unmount()

        const { result: nextResult } = renderHook(
            (params: Params) => useTopQuestionsViewedOnPage(...params),
            {
                initialProps: [
                    store1IntegrationId,
                    helpCenter1Id,
                    'ai-agent-overview',
                    dateNow,
                ],
            },
        )

        expect(nextResult.current).toEqual(true)
    })

    it('sets page as viewed on page unload', () => {
        const { result } = renderHook(
            (params: Params) => useTopQuestionsViewedOnPage(...params),
            {
                initialProps: [
                    store1IntegrationId,
                    helpCenter1Id,
                    'ai-agent-overview',
                    dateNow,
                ],
            },
        )

        expect(result.current).toEqual(false)

        window.dispatchEvent(new Event('beforeunload'))

        const { result: nextResult } = renderHook(
            (params: Params) => useTopQuestionsViewedOnPage(...params),
            {
                initialProps: [
                    store1IntegrationId,
                    helpCenter1Id,
                    'ai-agent-overview',
                    dateNow,
                ],
            },
        )

        expect(nextResult.current).toEqual(true)
    })

    it('purges values older than 1 year', () => {
        const { rerender } = renderHook(
            (params: Params) => useTopQuestionsViewedOnPage(...params),
            {
                initialProps: [
                    store1IntegrationId,
                    helpCenter1Id,
                    'ai-agent-overview',
                    dateNow,
                ],
            },
        )

        rerender([
            store2IntegrationId,
            helpCenter1Id,
            'ai-agent-overview',
            dateNow,
        ])

        rerender([
            store1IntegrationId,
            helpCenter1Id,
            'ai-agent-overview',
            dateNow,
        ])

        renderHook((params: Params) => useTopQuestionsViewedOnPage(...params), {
            initialProps: [
                store1IntegrationId,
                helpCenter1Id,
                'ai-agent-overview',
                dateNow,
            ],
        })

        expect(localStorage.getItem('gorgias-aao-top-questions')).toEqual(
            '\
{"key-100-10":{"viewedOnPages":["ai-agent-overview"],"latestBatchDatetime":"2022-02-10T08:00:00.000Z"},\
"key-200-10":{"viewedOnPages":["ai-agent-overview"],"latestBatchDatetime":"2022-02-10T08:00:00.000Z"}}',
        )

        jest.setSystemTime(date2YearsLater)

        renderHook((params: Params) => useTopQuestionsViewedOnPage(...params), {
            initialProps: [
                store1IntegrationId,
                helpCenter1Id,
                'ai-agent-overview',
                dateNow,
            ],
        })

        expect(localStorage.getItem('gorgias-aao-top-questions')).toEqual('{}')
    })
})
