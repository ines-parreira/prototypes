import {renderHook} from '@testing-library/react-hooks'
import {act} from 'react-dom/test-utils'
import {useLocalStorageTopQuestions} from '../useLocalStorageTopQuestions'

const dateNow = new Date('2024-02-10T08:00:00Z')

const helpCenter1Id = 10
const store1IntegrationId = 100

describe('useLocalStorageTopQuestions', () => {
    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(dateNow)
    })

    afterEach(() => {
        localStorage.clear()
    })

    it('returns a new batch if there is no existing one', () => {
        const {result} = renderHook(() =>
            useLocalStorageTopQuestions(
                store1IntegrationId,
                helpCenter1Id,
                dateNow
            )
        )

        expect(result.current).toEqual({
            viewedOnPages: new Set(),
            dismissedTemplateKeys: new Set(),
            addViewedOnPage: expect.any(Function),
            addDismissedTemplateKey: expect.any(Function),
        })
    })

    it('updates values', () => {
        const {result} = renderHook(() =>
            useLocalStorageTopQuestions(
                store1IntegrationId,
                helpCenter1Id,
                dateNow
            )
        )

        expect(result.current).toEqual({
            viewedOnPages: new Set(),
            dismissedTemplateKeys: new Set(),
            addViewedOnPage: expect.any(Function),
            addDismissedTemplateKey: expect.any(Function),
        })

        act(() => result.current.addViewedOnPage('automate-overview'))
        act(() => result.current.addViewedOnPage('all-recommendations'))
        act(() => result.current.addViewedOnPage('automate-overview'))
        act(() => result.current.addDismissedTemplateKey('ai_Generated_1'))
        act(() => result.current.addDismissedTemplateKey('ai_Generated_2'))
        act(() => result.current.addDismissedTemplateKey('ai_Generated_3'))

        expect(result.current).toEqual({
            viewedOnPages: new Set([
                'automate-overview',
                'all-recommendations',
            ]),
            dismissedTemplateKeys: new Set([
                'ai_Generated_1',
                'ai_Generated_2',
                'ai_Generated_3',
            ]),
            addViewedOnPage: expect.any(Function),
            addDismissedTemplateKey: expect.any(Function),
        })
    })

    it('removes old values from local storage', () => {
        const twoYearsAgo = new Date(dateNow)
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
        jest.useFakeTimers().setSystemTime(twoYearsAgo)

        const {result} = renderHook(() =>
            useLocalStorageTopQuestions(
                store1IntegrationId,
                helpCenter1Id,
                twoYearsAgo
            )
        )

        act(() => result.current.addViewedOnPage('automate-overview'))
        act(() => result.current.addDismissedTemplateKey('ai_Generated_1'))

        expect(result.current).toEqual({
            viewedOnPages: new Set(['automate-overview']),
            dismissedTemplateKeys: new Set(['ai_Generated_1']),
            addViewedOnPage: expect.any(Function),
            addDismissedTemplateKey: expect.any(Function),
        })

        jest.useFakeTimers().setSystemTime(dateNow)

        renderHook(() =>
            useLocalStorageTopQuestions(
                store1IntegrationId,
                helpCenter1Id,
                twoYearsAgo
            )
        )

        expect(result.current).toEqual({
            viewedOnPages: new Set(),
            dismissedTemplateKeys: new Set(),
            addViewedOnPage: expect.any(Function),
            addDismissedTemplateKey: expect.any(Function),
        })
    })

    it('returns a new batch if the existing batch is expired', () => {
        const oneMonthAgo = new Date(dateNow)
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

        const {result} = renderHook(() =>
            useLocalStorageTopQuestions(
                store1IntegrationId,
                helpCenter1Id,
                oneMonthAgo
            )
        )

        act(() => result.current.addViewedOnPage('automate-overview'))
        act(() => result.current.addDismissedTemplateKey('ai_Generated_1'))

        expect(result.current).toEqual({
            viewedOnPages: new Set(['automate-overview']),
            dismissedTemplateKeys: new Set(['ai_Generated_1']),
            addViewedOnPage: expect.any(Function),
            addDismissedTemplateKey: expect.any(Function),
        })

        const {result: newResult} = renderHook(() =>
            useLocalStorageTopQuestions(
                store1IntegrationId,
                helpCenter1Id,
                dateNow
            )
        )

        expect(newResult.current).toEqual({
            viewedOnPages: new Set(),
            dismissedTemplateKeys: new Set(),
            addViewedOnPage: expect.any(Function),
            addDismissedTemplateKey: expect.any(Function),
        })
    })
})
