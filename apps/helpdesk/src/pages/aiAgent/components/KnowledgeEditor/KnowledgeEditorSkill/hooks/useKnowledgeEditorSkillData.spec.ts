import { renderHook } from '@repo/testing'

import {
    useGetArticleTranslationVersion,
    useGetWizard,
} from 'models/helpCenter/queries'
import { useAiAgentHelpCenterState } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { useGuidanceArticle } from 'pages/aiAgent/hooks/useGuidanceArticle'
import { useSkillsTemplates } from 'pages/aiAgent/skills/hooks/useSkillsTemplates'
import { SkillWizardStatus } from 'pages/aiAgent/skills/types'

import { useKnowledgeEditorSkillData } from './useKnowledgeEditorSkillData'

jest.mock('models/helpCenter/queries')
jest.mock('pages/aiAgent/hooks/useAiAgentHelpCenter')
jest.mock('pages/aiAgent/hooks/useGuidanceArticle')
jest.mock('pages/aiAgent/skills/hooks/useSkillsTemplates')

const mockUseAiAgentHelpCenterState =
    useAiAgentHelpCenterState as jest.MockedFunction<
        typeof useAiAgentHelpCenterState
    >
const mockUseGuidanceArticle = useGuidanceArticle as jest.MockedFunction<
    typeof useGuidanceArticle
>
const mockUseSkillsTemplates = useSkillsTemplates as jest.MockedFunction<
    typeof useSkillsTemplates
>
const mockUseGetArticleTranslationVersion =
    useGetArticleTranslationVersion as jest.MockedFunction<
        typeof useGetArticleTranslationVersion
    >
const mockUseGetWizard = useGetWizard as jest.MockedFunction<
    typeof useGetWizard
>

const mockWizard = (overrides: { status?: SkillWizardStatus } = {}) =>
    ({
        status: overrides.status ?? SkillWizardStatus.InProgress,
    }) as any

describe('useKnowledgeEditorSkillData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAiAgentHelpCenterState.mockReturnValue({
            helpCenter: { id: 1, default_locale: 'en-US' },
            isLoading: false,
        } as ReturnType<typeof useAiAgentHelpCenterState>)
        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle: undefined,
            isGuidanceArticleLoading: false,
            isError: false,
            error: null,
        } as ReturnType<typeof useGuidanceArticle>)
        mockUseSkillsTemplates.mockReturnValue({
            allSkillsTemplates: [],
            availableSkillsTemplates: [],
        })
        mockUseGetArticleTranslationVersion.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as any)
        mockUseGetWizard.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as any)
    })

    describe('initialMode', () => {
        it('returns create mode when skillId is not provided', () => {
            const { result } = renderHook(() =>
                useKnowledgeEditorSkillData({ shopName: 'test-shop' }),
            )

            expect(result.current.initialMode).toBe('create')
        })

        it('returns edit mode when skillId is provided', () => {
            const { result } = renderHook(() =>
                useKnowledgeEditorSkillData({
                    shopName: 'test-shop',
                    skillId: '42',
                }),
            )

            expect(result.current.initialMode).toBe('edit')
        })

        it('returns skillMode when skillMode param is provided', () => {
            const { result } = renderHook(() =>
                useKnowledgeEditorSkillData({
                    shopName: 'test-shop',
                    skillId: '42',
                    skillMode: 'read',
                }),
            )

            expect(result.current.initialMode).toBe('read')
        })

        it('skillMode overrides the default create mode when no skillId is provided', () => {
            const { result } = renderHook(() =>
                useKnowledgeEditorSkillData({
                    shopName: 'test-shop',
                    skillMode: 'read',
                }),
            )

            expect(result.current.initialMode).toBe('read')
        })

        it('returns read mode when the wizard is not completed', () => {
            mockUseGetWizard.mockReturnValue({
                data: mockWizard({ status: SkillWizardStatus.InProgress }),
                isLoading: false,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorSkillData({
                    shopName: 'test-shop',
                    skillId: '42',
                }),
            )

            expect(result.current.initialMode).toBe('read')
        })

        it('returns edit mode when the wizard is completed', () => {
            mockUseGetWizard.mockReturnValue({
                data: mockWizard({ status: SkillWizardStatus.Completed }),
                isLoading: false,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorSkillData({
                    shopName: 'test-shop',
                    skillId: '42',
                }),
            )

            expect(result.current.initialMode).toBe('edit')
        })

        it('returns edit mode when there is no wizard data', () => {
            mockUseGetWizard.mockReturnValue({
                data: undefined,
                isLoading: false,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorSkillData({
                    shopName: 'test-shop',
                    skillId: '42',
                }),
            )

            expect(result.current.initialMode).toBe('edit')
        })

        it('lets skillMode override the wizard-driven read mode', () => {
            mockUseGetWizard.mockReturnValue({
                data: mockWizard({ status: SkillWizardStatus.InProgress }),
                isLoading: false,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorSkillData({
                    shopName: 'test-shop',
                    skillId: '42',
                    skillMode: 'edit',
                }),
            )

            expect(result.current.initialMode).toBe('edit')
        })
    })

    describe('isWizardLoading', () => {
        it('reflects the wizard query loading state for an existing skill', () => {
            mockUseGetWizard.mockReturnValue({
                data: undefined,
                isLoading: true,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorSkillData({
                    shopName: 'test-shop',
                    skillId: '42',
                }),
            )

            expect(result.current.isWizardLoading).toBe(true)
        })

        it('is false in create mode even if the wizard query reports loading', () => {
            mockUseGetWizard.mockReturnValue({
                data: undefined,
                isLoading: true,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorSkillData({ shopName: 'test-shop' }),
            )

            expect(result.current.isWizardLoading).toBe(false)
        })
    })

    describe('initialVersionData and isInitialVersionLoading', () => {
        it('returns undefined initialVersionData and false isInitialVersionLoading when initialVersionId is not provided', () => {
            const { result } = renderHook(() =>
                useKnowledgeEditorSkillData({ shopName: 'test-shop' }),
            )

            expect(result.current.initialVersionData).toBeUndefined()
            expect(result.current.isInitialVersionLoading).toBe(false)
        })

        it('returns true for isInitialVersionLoading when initialVersionId is set and query is loading', () => {
            mockUseGetArticleTranslationVersion.mockReturnValue({
                data: undefined,
                isLoading: true,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorSkillData({
                    shopName: 'test-shop',
                    skillId: '42',
                    initialVersionId: 5,
                }),
            )

            expect(result.current.isInitialVersionLoading).toBe(true)
        })

        it('returns false for isInitialVersionLoading when initialVersionId is not set even if query is loading', () => {
            mockUseGetArticleTranslationVersion.mockReturnValue({
                data: undefined,
                isLoading: true,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorSkillData({ shopName: 'test-shop' }),
            )

            expect(result.current.isInitialVersionLoading).toBe(false)
        })

        it('returns undefined initialVersionData when version matches the published version', () => {
            mockUseGuidanceArticle.mockReturnValue({
                guidanceArticle: {
                    id: 42,
                    publishedVersionId: 5,
                    draftVersionId: 6,
                } as any,
                isGuidanceArticleLoading: false,
                isError: false,
                error: null,
            } as any)
            mockUseGetArticleTranslationVersion.mockReturnValue({
                data: { id: 5 } as any,
                isLoading: false,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorSkillData({
                    shopName: 'test-shop',
                    skillId: '42',
                    initialVersionId: 5,
                }),
            )

            expect(result.current.initialVersionData).toBeUndefined()
        })

        it('returns undefined initialVersionData when version matches the draft version', () => {
            mockUseGuidanceArticle.mockReturnValue({
                guidanceArticle: {
                    id: 42,
                    publishedVersionId: 5,
                    draftVersionId: 6,
                } as any,
                isGuidanceArticleLoading: false,
                isError: false,
                error: null,
            } as any)
            mockUseGetArticleTranslationVersion.mockReturnValue({
                data: { id: 6 } as any,
                isLoading: false,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorSkillData({
                    shopName: 'test-shop',
                    skillId: '42',
                    initialVersionId: 6,
                }),
            )

            expect(result.current.initialVersionData).toBeUndefined()
        })

        it('returns version data when version is a historical (non-current) version', () => {
            const historicalVersion = { id: 3, content: 'historical content' }
            mockUseGuidanceArticle.mockReturnValue({
                guidanceArticle: {
                    id: 42,
                    publishedVersionId: 5,
                    draftVersionId: 6,
                } as any,
                isGuidanceArticleLoading: false,
                isError: false,
                error: null,
            } as any)
            mockUseGetArticleTranslationVersion.mockReturnValue({
                data: historicalVersion as any,
                isLoading: false,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorSkillData({
                    shopName: 'test-shop',
                    skillId: '42',
                    initialVersionId: 3,
                }),
            )

            expect(result.current.initialVersionData).toEqual(historicalVersion)
        })
    })
})
