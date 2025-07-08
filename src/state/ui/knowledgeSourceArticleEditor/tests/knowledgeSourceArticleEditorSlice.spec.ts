import { LocaleCode } from 'models/helpCenter/types'
import { KnowledgePendingCloseType } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { RootState } from 'state/types'

import {
    getCounters,
    getKnowledgeSourceArticleEditorState,
    getLastProcessedArticleId,
    getPendingClose,
    getPendingDeleteLocaleOptionItem,
    initialState,
    knowledgeSourceArticleEditorSlice,
    resetState,
    setCounters,
    setLastProcessedArticleId,
    setPendingClose,
    setPendingDeleteLocaleOptionItem,
} from '../knowledgeSourceArticleEditorSlice'

const createMockRootState = (
    knowledgeSourceArticleEditorState = initialState,
): RootState =>
    ({
        ui: {
            ticketAIAgentFeedback: {
                knowledgeSourceArticleEditor: knowledgeSourceArticleEditorState,
            },
        },
    }) as RootState

describe('knowledgeSourceArticleEditorSlice', () => {
    describe('when testing initial state', () => {
        it('should have correct initial state', () => {
            expect(initialState).toEqual({
                pendingClose: null,
                pendingDeleteLocaleOptionItem: undefined,
                counters: undefined,
                lastProcessedArticleId: null,
            })
        })
    })

    describe('when setting pending close', () => {
        it('should set pending close to discard', () => {
            const state = knowledgeSourceArticleEditorSlice.reducer(
                initialState,
                setPendingClose(KnowledgePendingCloseType.Discard),
            )

            expect(state.pendingClose).toBe(KnowledgePendingCloseType.Discard)
        })

        it('should set pending close to article', () => {
            const state = knowledgeSourceArticleEditorSlice.reducer(
                initialState,
                setPendingClose(KnowledgePendingCloseType.Article),
            )

            expect(state.pendingClose).toBe(KnowledgePendingCloseType.Article)
        })

        it('should set pending close to null', () => {
            const previousState = {
                ...initialState,
                pendingClose: KnowledgePendingCloseType.Discard,
            }

            const state = knowledgeSourceArticleEditorSlice.reducer(
                previousState,
                setPendingClose(null),
            )

            expect(state.pendingClose).toBeNull()
        })
    })

    describe('when setting pending delete locale option item', () => {
        it('should set pending delete locale option item', () => {
            const optionItem = {
                label: 'English (US)',
                value: 'en-US' as const,
                text: 'English (US)',
                isComplete: true,
                canBeDeleted: true,
            }

            const state = knowledgeSourceArticleEditorSlice.reducer(
                initialState,
                setPendingDeleteLocaleOptionItem(optionItem),
            )

            expect(state.pendingDeleteLocaleOptionItem).toEqual(optionItem)
        })

        it('should set pending delete locale option item to undefined', () => {
            const optionItem = {
                label: 'English (US)',
                value: 'en-US' as const,
                text: 'English (US)',
                isComplete: true,
                canBeDeleted: true,
            }
            const previousState = {
                ...initialState,
                pendingDeleteLocaleOptionItem: optionItem,
            }

            const state = knowledgeSourceArticleEditorSlice.reducer(
                previousState,
                setPendingDeleteLocaleOptionItem(undefined),
            )

            expect(state.pendingDeleteLocaleOptionItem).toBeUndefined()
        })
    })

    describe('when setting counters', () => {
        it('should set counters with char count', () => {
            const counters = { charCount: 150 }

            const state = knowledgeSourceArticleEditorSlice.reducer(
                initialState,
                setCounters(counters),
            )

            expect(state.counters).toEqual(counters)
        })

        it('should set counters to undefined', () => {
            const previousState = {
                ...initialState,
                counters: { charCount: 150 },
            }

            const state = knowledgeSourceArticleEditorSlice.reducer(
                previousState,
                setCounters(undefined),
            )

            expect(state.counters).toBeUndefined()
        })
    })

    describe('when setting last processed article id', () => {
        it('should set last processed article id', () => {
            const articleId = 123

            const state = knowledgeSourceArticleEditorSlice.reducer(
                initialState,
                setLastProcessedArticleId(articleId),
            )

            expect(state.lastProcessedArticleId).toBe(articleId)
        })

        it('should set last processed article id to null', () => {
            const previousState = {
                ...initialState,
                lastProcessedArticleId: 123,
            }

            const state = knowledgeSourceArticleEditorSlice.reducer(
                previousState,
                setLastProcessedArticleId(null),
            )

            expect(state.lastProcessedArticleId).toBeNull()
        })
    })

    describe('when resetting state', () => {
        it('should reset all state properties to initial values', () => {
            const previousState = {
                pendingClose: KnowledgePendingCloseType.Article,
                pendingDeleteLocaleOptionItem: {
                    label: 'Spanish',
                    value: 'es-ES' as LocaleCode,
                    text: 'Spanish',
                    isComplete: true,
                    canBeDeleted: true,
                },
                counters: { charCount: 200 },
                lastProcessedArticleId: 456,
            }

            const state = knowledgeSourceArticleEditorSlice.reducer(
                previousState,
                resetState(),
            )

            expect(state).toEqual(initialState)
        })
    })

    describe('selectors', () => {
        describe('when getting knowledge source article editor state', () => {
            it('should return the complete state', () => {
                const mockState = {
                    pendingClose: KnowledgePendingCloseType.Discard,
                    pendingDeleteLocaleOptionItem: {
                        label: 'French',
                        value: 'fr-FR' as LocaleCode,
                        text: 'French',
                        isComplete: false,
                        canBeDeleted: false,
                    },
                    counters: { charCount: 300 },
                    lastProcessedArticleId: 789,
                }
                const rootState = createMockRootState(mockState)

                const result = getKnowledgeSourceArticleEditorState(rootState)

                expect(result).toEqual(mockState)
            })
        })

        describe('when getting pending close', () => {
            it('should return pending close value when set to discard', () => {
                const mockState = {
                    ...initialState,
                    pendingClose: KnowledgePendingCloseType.Discard,
                }
                const rootState = createMockRootState(mockState)

                const result = getPendingClose(rootState)

                expect(result).toBe(KnowledgePendingCloseType.Discard)
            })

            it('should return pending close value when set to article', () => {
                const mockState = {
                    ...initialState,
                    pendingClose: KnowledgePendingCloseType.Article,
                }
                const rootState = createMockRootState(mockState)

                const result = getPendingClose(rootState)

                expect(result).toBe(KnowledgePendingCloseType.Article)
            })

            it('should return null when pending close is not set', () => {
                const rootState = createMockRootState()

                const result = getPendingClose(rootState)

                expect(result).toBeNull()
            })
        })

        describe('when getting pending delete locale option item', () => {
            it('should return pending delete locale option item when set', () => {
                const optionItem = {
                    label: 'German',
                    value: 'de-DE' as LocaleCode,
                    text: 'German',
                    isComplete: true,
                    canBeDeleted: true,
                }
                const mockState = {
                    ...initialState,
                    pendingDeleteLocaleOptionItem: optionItem,
                }
                const rootState = createMockRootState(mockState)

                const result = getPendingDeleteLocaleOptionItem(rootState)

                expect(result).toEqual(optionItem)
            })

            it('should return undefined when pending delete locale option item is not set', () => {
                const rootState = createMockRootState()

                const result = getPendingDeleteLocaleOptionItem(rootState)

                expect(result).toBeUndefined()
            })
        })

        describe('when getting counters', () => {
            it('should return counters when set', () => {
                const counters = { charCount: 450 }
                const mockState = {
                    ...initialState,
                    counters,
                }
                const rootState = createMockRootState(mockState)

                const result = getCounters(rootState)

                expect(result).toEqual(counters)
            })

            it('should return undefined when counters are not set', () => {
                const rootState = createMockRootState()

                const result = getCounters(rootState)

                expect(result).toBeUndefined()
            })
        })

        describe('when getting last processed article id', () => {
            it('should return last processed article id when set', () => {
                const articleId = 999
                const mockState = {
                    ...initialState,
                    lastProcessedArticleId: articleId,
                }
                const rootState = createMockRootState(mockState)

                const result = getLastProcessedArticleId(rootState)

                expect(result).toBe(articleId)
            })

            it('should return null when last processed article id is not set', () => {
                const rootState = createMockRootState()

                const result = getLastProcessedArticleId(rootState)

                expect(result).toBeNull()
            })
        })
    })
})
