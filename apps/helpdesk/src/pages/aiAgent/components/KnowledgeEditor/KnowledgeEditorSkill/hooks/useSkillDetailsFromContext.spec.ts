import { renderHook } from '@testing-library/react'

import { useSkillEditorStore } from '../context/KnowledgeEditorSkillContext'
import { useSkillDetailsFromContext } from './useSkillDetailsFromContext'

jest.mock('../context/KnowledgeEditorSkillContext', () => ({
    useSkillEditorStore: jest.fn(),
}))

const mockUseSkillEditorStore = useSkillEditorStore as jest.Mock

const defaultSkill = {
    id: 1,
    title: 'Test Skill',
    content: '<p>content</p>',
    locale: 'en-US',
    visibility: 'PUBLIC',
    createdDatetime: '2024-03-01T00:00:00Z',
    lastUpdated: '2024-03-15T00:00:00Z',
    templateKey: null,
    isCurrent: true,
    draftVersionId: null,
    publishedVersionId: 1,
}

const setStoreData = (
    skillOverrides?: Partial<typeof defaultSkill> | undefined,
    stateOverrides?: Record<string, unknown>,
    configOverrides?: Record<string, unknown>,
) => {
    const skill =
        skillOverrides === undefined
            ? undefined
            : { ...defaultSkill, ...skillOverrides }

    mockUseSkillEditorStore.mockImplementation((selector: Function) =>
        selector({
            skill,
            state: {
                mode: 'read',
                skill,
                historicalVersion: null,
                ...stateOverrides,
            },
            config: {
                isPreviewMode: false,
                ...configOverrides,
            },
        }),
    )
}

describe('useSkillDetailsFromContext', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        setStoreData({})
    })

    describe('status', () => {
        it('should return enabled when visibility is PUBLIC', () => {
            const { result } = renderHook(() => useSkillDetailsFromContext())

            expect(result.current.status).toBe('enabled')
        })

        it('should return disabled when visibility is UNLISTED', () => {
            setStoreData({ visibility: 'UNLISTED' })

            const { result } = renderHook(() => useSkillDetailsFromContext())

            expect(result.current.status).toBe('disabled')
        })
    })

    describe('isDraft', () => {
        it('should return false when isCurrent is true', () => {
            const { result } = renderHook(() => useSkillDetailsFromContext())

            expect(result.current.isDraft).toBe(false)
        })

        it('should return true when isCurrent is false', () => {
            setStoreData({ isCurrent: false })

            const { result } = renderHook(() => useSkillDetailsFromContext())

            expect(result.current.isDraft).toBe(true)
        })

        it('should return false when skill is undefined', () => {
            setStoreData(undefined)

            const { result } = renderHook(() => useSkillDetailsFromContext())

            expect(result.current.isDraft).toBe(false)
        })
    })

    describe('dates', () => {
        it('should return parsed dates from skill', () => {
            const { result } = renderHook(() => useSkillDetailsFromContext())

            expect(result.current.createdDatetime).toEqual(
                new Date('2024-03-01T00:00:00Z'),
            )
            expect(result.current.lastUpdatedDatetime).toEqual(
                new Date('2024-03-15T00:00:00Z'),
            )
        })

        it('should return undefined dates when skill is undefined', () => {
            setStoreData(undefined)

            const { result } = renderHook(() => useSkillDetailsFromContext())

            expect(result.current.createdDatetime).toBeUndefined()
            expect(result.current.lastUpdatedDatetime).toBeUndefined()
        })
    })

    describe('isPreview', () => {
        it('returns false when isPreviewMode is not set', () => {
            const { result } = renderHook(() => useSkillDetailsFromContext())

            expect(result.current.isPreview).toBe(false)
        })

        it('returns true when isPreviewMode is set in config', () => {
            setStoreData({}, {}, { isPreviewMode: true })

            const { result } = renderHook(() => useSkillDetailsFromContext())

            expect(result.current.isPreview).toBe(true)
        })
    })
})
