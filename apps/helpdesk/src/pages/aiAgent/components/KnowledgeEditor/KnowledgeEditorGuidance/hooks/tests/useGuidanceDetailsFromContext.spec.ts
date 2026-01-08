import { renderHook } from '@testing-library/react'

import type { GuidanceContextValue } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context/types'
import type { GuidanceArticle } from 'pages/aiAgent/types'

import { useGuidanceContext } from '../../context'
import { useToggleVisibility } from '../../context/useToggleVisibility'
import { useGuidanceDetailsFromContext } from '../useGuidanceDetailsFromContext'

jest.mock('../../context', () => ({
    useGuidanceContext: jest.fn(),
}))

jest.mock('../../context/useToggleVisibility', () => ({
    useToggleVisibility: jest.fn(),
}))

const mockUseGuidanceContext = useGuidanceContext as jest.Mock
const mockUseToggleVisibility = useToggleVisibility as jest.Mock

describe('useGuidanceDetailsFromContext', () => {
    const mockToggleVisibility = jest.fn()

    const mockGuidanceArticle: GuidanceArticle = {
        id: 123,
        title: 'Test Guidance',
        content: '<p>Test content</p>',
        locale: 'en-US',
        visibility: 'PUBLIC',
        createdDatetime: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-15T00:00:00Z',
        templateKey: null,
        isCurrent: true,
        draftVersionId: null,
        publishedVersionId: 1,
    }

    const defaultState = {
        visibility: true,
        guidance: mockGuidanceArticle,
        isUpdating: false,
        isAutoSaving: false,
    }

    const defaultContextValue: Partial<GuidanceContextValue> = {
        state: defaultState as GuidanceContextValue['state'],
        guidanceArticle: mockGuidanceArticle,
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseGuidanceContext.mockReturnValue(defaultContextValue)
        mockUseToggleVisibility.mockReturnValue({
            toggleVisibility: mockToggleVisibility,
            isAtLimit: false,
            limitMessage: 'You have reached the limit',
        })
    })

    describe('aiAgentStatus', () => {
        it('should return visibility value from state', () => {
            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current.aiAgentStatus.value).toBe(true)
        })

        it('should return false when visibility is false', () => {
            mockUseGuidanceContext.mockReturnValue({
                ...defaultContextValue,
                state: { ...defaultState, visibility: false },
            })

            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current.aiAgentStatus.value).toBe(false)
        })

        it('should return toggleVisibility function as onChange', () => {
            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current.aiAgentStatus.onChange).toBe(
                mockToggleVisibility,
            )
        })

        it('should return false when viewing a draft even if visibility is true', () => {
            const draftGuidance = {
                ...mockGuidanceArticle,
                isCurrent: false,
            }
            mockUseGuidanceContext.mockReturnValue({
                ...defaultContextValue,
                state: {
                    ...defaultState,
                    visibility: true,
                    guidance: draftGuidance,
                },
                guidanceArticle: draftGuidance,
            })

            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current.aiAgentStatus.value).toBe(false)
        })

        describe('tooltip', () => {
            it('should return undefined when not at limit and not a draft', () => {
                const { result } = renderHook(() =>
                    useGuidanceDetailsFromContext(),
                )

                expect(result.current.aiAgentStatus.tooltip).toBeUndefined()
            })

            it('should return limit message when at limit and visibility is false', () => {
                mockUseToggleVisibility.mockReturnValue({
                    toggleVisibility: mockToggleVisibility,
                    isAtLimit: true,
                    limitMessage: 'You have reached the limit',
                })
                mockUseGuidanceContext.mockReturnValue({
                    ...defaultContextValue,
                    state: { ...defaultState, visibility: false },
                })

                const { result } = renderHook(() =>
                    useGuidanceDetailsFromContext(),
                )

                expect(result.current.aiAgentStatus.tooltip).toBe(
                    'You have reached the limit',
                )
            })

            it('should return undefined when at limit but visibility is already true', () => {
                mockUseToggleVisibility.mockReturnValue({
                    toggleVisibility: mockToggleVisibility,
                    isAtLimit: true,
                    limitMessage: 'You have reached the limit',
                })

                const { result } = renderHook(() =>
                    useGuidanceDetailsFromContext(),
                )

                expect(result.current.aiAgentStatus.tooltip).toBeUndefined()
            })

            it('should return draft tooltip when viewing a draft', () => {
                const draftGuidance = {
                    ...mockGuidanceArticle,
                    isCurrent: false,
                }
                mockUseGuidanceContext.mockReturnValue({
                    ...defaultContextValue,
                    state: {
                        ...defaultState,
                        guidance: draftGuidance,
                    },
                    guidanceArticle: draftGuidance,
                })

                const { result } = renderHook(() =>
                    useGuidanceDetailsFromContext(),
                )

                expect(result.current.aiAgentStatus.tooltip).toBe(
                    'Only published versions can be enabled for AI Agent. Publish this version to enable it for AI Agent.',
                )
            })

            it('should prioritize draft tooltip over limit message', () => {
                const draftGuidance = {
                    ...mockGuidanceArticle,
                    isCurrent: false,
                }
                mockUseToggleVisibility.mockReturnValue({
                    toggleVisibility: mockToggleVisibility,
                    isAtLimit: true,
                    limitMessage: 'You have reached the limit',
                })
                mockUseGuidanceContext.mockReturnValue({
                    ...defaultContextValue,
                    state: {
                        ...defaultState,
                        visibility: false,
                        guidance: draftGuidance,
                    },
                    guidanceArticle: draftGuidance,
                })

                const { result } = renderHook(() =>
                    useGuidanceDetailsFromContext(),
                )

                expect(result.current.aiAgentStatus.tooltip).toBe(
                    'Only published versions can be enabled for AI Agent. Publish this version to enable it for AI Agent.',
                )
            })
        })
    })

    describe('createdDatetime', () => {
        it('should return Date object from guidanceArticle.createdDatetime', () => {
            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current.createdDatetime).toEqual(
                new Date('2024-01-01T00:00:00Z'),
            )
        })

        it('should return undefined when guidanceArticle is undefined', () => {
            mockUseGuidanceContext.mockReturnValue({
                ...defaultContextValue,
                guidanceArticle: undefined,
            })

            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current.createdDatetime).toBeUndefined()
        })
    })

    describe('lastUpdatedDatetime', () => {
        it('should return Date object from guidanceArticle.lastUpdated', () => {
            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current.lastUpdatedDatetime).toEqual(
                new Date('2024-01-15T00:00:00Z'),
            )
        })

        it('should return undefined when guidanceArticle is undefined', () => {
            mockUseGuidanceContext.mockReturnValue({
                ...defaultContextValue,
                guidanceArticle: undefined,
            })

            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current.lastUpdatedDatetime).toBeUndefined()
        })
    })

    describe('isUpdating', () => {
        it('should return false when not updating, not auto-saving, not at limit, and not a draft', () => {
            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current.isUpdating).toBe(false)
        })

        it('should return true when isUpdating is true', () => {
            mockUseGuidanceContext.mockReturnValue({
                ...defaultContextValue,
                state: { ...defaultState, isUpdating: true },
            })

            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current.isUpdating).toBe(true)
        })

        it('should return true when isAutoSaving is true', () => {
            mockUseGuidanceContext.mockReturnValue({
                ...defaultContextValue,
                state: { ...defaultState, isAutoSaving: true },
            })

            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current.isUpdating).toBe(true)
        })

        it('should return true when at limit and visibility is false', () => {
            mockUseToggleVisibility.mockReturnValue({
                toggleVisibility: mockToggleVisibility,
                isAtLimit: true,
                limitMessage: 'You have reached the limit',
            })
            mockUseGuidanceContext.mockReturnValue({
                ...defaultContextValue,
                state: { ...defaultState, visibility: false },
            })

            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current.isUpdating).toBe(true)
        })

        it('should return true when viewing a draft', () => {
            const draftGuidance = {
                ...mockGuidanceArticle,
                isCurrent: false,
            }
            mockUseGuidanceContext.mockReturnValue({
                ...defaultContextValue,
                state: {
                    ...defaultState,
                    guidance: draftGuidance,
                },
                guidanceArticle: draftGuidance,
            })

            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current.isUpdating).toBe(true)
        })

        it('should return false when at limit but visibility is already true', () => {
            mockUseToggleVisibility.mockReturnValue({
                toggleVisibility: mockToggleVisibility,
                isAtLimit: true,
                limitMessage: 'You have reached the limit',
            })

            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current.isUpdating).toBe(false)
        })
    })

    describe('isDraft', () => {
        it('should return false when isCurrent is true', () => {
            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current.isDraft).toBe(false)
        })

        it('should return true when isCurrent is false', () => {
            const draftGuidance = {
                ...mockGuidanceArticle,
                isCurrent: false,
            }
            mockUseGuidanceContext.mockReturnValue({
                ...defaultContextValue,
                state: {
                    ...defaultState,
                    guidance: draftGuidance,
                },
            })

            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current.isDraft).toBe(true)
        })

        it('should return false when isCurrent is undefined', () => {
            const undefinedCurrentGuidance = {
                ...mockGuidanceArticle,
                isCurrent: undefined,
            }
            mockUseGuidanceContext.mockReturnValue({
                ...defaultContextValue,
                state: {
                    ...defaultState,
                    guidance: undefinedCurrentGuidance,
                },
            })

            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current.isDraft).toBe(false)
        })

        it('should return false when guidance is undefined', () => {
            mockUseGuidanceContext.mockReturnValue({
                ...defaultContextValue,
                state: {
                    ...defaultState,
                    guidance: undefined,
                },
            })

            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current.isDraft).toBe(false)
        })
    })

    describe('memoization', () => {
        it('should return same reference when dependencies do not change', () => {
            const { result, rerender } = renderHook(() =>
                useGuidanceDetailsFromContext(),
            )

            const firstResult = result.current
            rerender()
            const secondResult = result.current

            expect(firstResult).toBe(secondResult)
        })

        it('should return new reference when visibility changes', () => {
            const { result, rerender } = renderHook(() =>
                useGuidanceDetailsFromContext(),
            )

            const firstResult = result.current

            mockUseGuidanceContext.mockReturnValue({
                ...defaultContextValue,
                state: { ...defaultState, visibility: false },
            })

            rerender()
            const secondResult = result.current

            expect(firstResult).not.toBe(secondResult)
            expect(secondResult.aiAgentStatus.value).toBe(false)
        })
    })

    describe('return value shape', () => {
        it('should return all expected properties', () => {
            const { result } = renderHook(() => useGuidanceDetailsFromContext())

            expect(result.current).toHaveProperty('aiAgentStatus')
            expect(result.current).toHaveProperty('aiAgentStatus.value')
            expect(result.current).toHaveProperty('aiAgentStatus.onChange')
            expect(result.current).toHaveProperty('aiAgentStatus.tooltip')
            expect(result.current).toHaveProperty('createdDatetime')
            expect(result.current).toHaveProperty('lastUpdatedDatetime')
            expect(result.current).toHaveProperty('isUpdating')
            expect(result.current).toHaveProperty('isDraft')
        })
    })
})
