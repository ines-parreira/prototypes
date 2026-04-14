import { renderHook } from '@testing-library/react'

import { useLinkedIntentsSidebarSkill } from './useLinkedIntentsSidebarSkill'

const mockUseSkillEditorStore = jest.fn()
const mockUseIntentLinkButton = jest.fn()
const mockUseIntentConflicts = jest.fn()

jest.mock('../../context/KnowledgeEditorSkillContext', () => ({
    useSkillEditorStore: (selector: Function) =>
        mockUseSkillEditorStore(selector),
}))

jest.mock('./useIntentLinkButton', () => ({
    useIntentLinkButton: () => mockUseIntentLinkButton(),
}))

jest.mock('./useIntentConflicts', () => ({
    useIntentConflicts: () => mockUseIntentConflicts(),
}))

const defaultLinkButton = {
    isDisabled: false,
    disabledTooltip: undefined,
    canUnlink: true,
    isUpdating: false,
}

const createStoreState = (overrides?: Record<string, unknown>) => ({
    state: {
        mode: 'edit',
        intents: ['order::status', 'order::cancel'],
        skill: {
            publishedVersionId: 1,
            draftVersionId: 1,
        },
        historicalVersion: null,
        comparisonVersion: null,
        isFromTemplate: false,
        ...overrides,
    },
})

const setupStore = (
    overrides?: Record<string, unknown>,
    conflicts = new Set<string>(),
) => {
    const storeState = createStoreState(overrides)
    mockUseSkillEditorStore.mockImplementation((selector: Function) =>
        selector(storeState),
    )
    mockUseIntentLinkButton.mockReturnValue(defaultLinkButton)
    mockUseIntentConflicts.mockReturnValue(conflicts)
}

describe('useLinkedIntentsSidebarSkill', () => {
    afterEach(() => jest.clearAllMocks())

    describe('normal mode', () => {
        it('returns items with labels for each intent', () => {
            setupStore()
            const { result } = renderHook(() => useLinkedIntentsSidebarSkill())

            expect(result.current.items).toEqual([
                expect.objectContaining({
                    intentId: 'order::status',
                    label: 'Order / Status',
                }),
                expect.objectContaining({
                    intentId: 'order::cancel',
                    label: 'Order / Cancel',
                }),
            ])
            expect(result.current.showLinkButton).toBe(true)
            expect(result.current.showBanner).toBe(false)
        })

        it('marks conflicting intents with leading dot and tooltip', () => {
            setupStore({}, new Set(['order::cancel']))
            const { result } = renderHook(() => useLinkedIntentsSidebarSkill())

            const conflictItem = result.current.items.find(
                (i) => i.intentId === 'order::cancel',
            )
            expect(conflictItem).toEqual(
                expect.objectContaining({
                    showLeadingDot: true,
                    tooltip: 'Intent already linked to an existing skill',
                    color: undefined,
                }),
            )
            expect(result.current.showBanner).toBe(true)
        })

        it('marks new draft intents with purple color and tooltip', () => {
            setupStore({
                intents: ['order::status', 'order::cancel', 'order::refund'],
                skill: {
                    publishedVersionId: 1,
                    draftVersionId: 2,
                },
                comparisonVersion: {
                    intents: ['order::status', 'order::cancel'],
                },
            })
            const { result } = renderHook(() => useLinkedIntentsSidebarSkill())

            const draftItem = result.current.items.find(
                (i) => i.intentId === 'order::refund',
            )
            expect(draftItem).toEqual(
                expect.objectContaining({
                    color: 'purple',
                    showLeadingDot: false,
                    tooltip:
                        'Intent not yet linked to skill. Publish your changes to link.',
                }),
            )
        })

        it('does not mark intents as draft for template-based skills', () => {
            setupStore({
                intents: ['order::status', 'order::refund'],
                skill: {
                    publishedVersionId: 1,
                    draftVersionId: 2,
                },
                comparisonVersion: {
                    intents: ['order::status'],
                },
                isFromTemplate: true,
            })
            const { result } = renderHook(() => useLinkedIntentsSidebarSkill())

            expect(
                result.current.items.every((i) => i.color === undefined),
            ).toBe(true)
        })

        it('does not show purple for draft-only skill with no published version', () => {
            setupStore({
                intents: ['order::status', 'order::cancel'],
                skill: {
                    publishedVersionId: null,
                    draftVersionId: 2,
                },
            })
            const { result } = renderHook(() => useLinkedIntentsSidebarSkill())

            expect(
                result.current.items.every((i) => i.color === undefined),
            ).toBe(true)
        })

        it('shows historical version intents in default state only', () => {
            setupStore(
                {
                    historicalVersion: {
                        publishedDatetime: '2025-01-01',
                        intents: ['order::status'],
                    },
                },
                new Set(['order::status']),
            )
            const { result } = renderHook(() => useLinkedIntentsSidebarSkill())

            expect(result.current.items).toHaveLength(1)
            expect(result.current.items[0]).toEqual(
                expect.objectContaining({
                    intentId: 'order::status',
                    color: undefined,
                    showLeadingDot: false,
                    tooltip: undefined,
                }),
            )
        })
    })

    describe('diff mode', () => {
        it('shows unchanged intents in default state and added in green', () => {
            setupStore({
                mode: 'diff',
                comparisonVersion: {
                    intents: ['order::status'],
                },
            })
            const { result } = renderHook(() => useLinkedIntentsSidebarSkill())

            expect(result.current.showLinkButton).toBe(false)
            expect(result.current.showBanner).toBe(false)
            expect(result.current.items).toEqual([
                expect.objectContaining({
                    intentId: 'order::status',
                    color: undefined,
                }),
                expect.objectContaining({
                    intentId: 'order::cancel',
                    color: 'green',
                }),
            ])
        })

        it('marks removed intents in red and unchanged in default', () => {
            setupStore({
                mode: 'diff',
                intents: ['order::status'],
                comparisonVersion: {
                    intents: ['order::status', 'order::cancel'],
                },
            })
            const { result } = renderHook(() => useLinkedIntentsSidebarSkill())

            expect(result.current.items).toEqual([
                expect.objectContaining({
                    intentId: 'order::status',
                    color: undefined,
                }),
                expect.objectContaining({
                    intentId: 'order::cancel',
                    color: 'red',
                }),
            ])
        })

        it('never shows banner or leading dots in diff mode', () => {
            setupStore(
                {
                    mode: 'diff',
                    comparisonVersion: {
                        intents: ['order::status'],
                    },
                },
                new Set(['order::cancel']),
            )
            const { result } = renderHook(() => useLinkedIntentsSidebarSkill())

            expect(result.current.showBanner).toBe(false)
            expect(result.current.items.every((i) => !i.showLeadingDot)).toBe(
                true,
            )
        })
    })

    describe('intentsCount', () => {
        it('returns the count of displayed intents', () => {
            setupStore()
            const { result } = renderHook(() => useLinkedIntentsSidebarSkill())

            expect(result.current.intentsCount).toBe(2)
        })
    })
})
