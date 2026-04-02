import { renderHook } from '@testing-library/react'

import { useAiAgentHelpCenterState } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { useGuidanceArticle } from 'pages/aiAgent/hooks/useGuidanceArticle'
import { useSkillsTemplates } from 'pages/aiAgent/skills/hooks/useSkillsTemplates'

import { useKnowledgeEditorSkillData } from './useKnowledgeEditorSkillData'

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
    })

    it('returns create mode when skillId is not provided', () => {
        const { result } = renderHook(() =>
            useKnowledgeEditorSkillData({ shopName: 'test-shop' }),
        )

        expect(result.current.initialMode).toBe('create')
    })
})
