import { useMemo } from 'react'

import { useAiAgentHelpCenterState } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { useGuidanceArticle } from 'pages/aiAgent/hooks/useGuidanceArticle'
import { useSkillsTemplates } from 'pages/aiAgent/skills/hooks/useSkillsTemplates'
import type { SkillTemplate } from 'pages/aiAgent/skills/types'

import type { SkillModeType } from '../context'

type UseKnowledgeEditorSkillDataParams = {
    shopName: string
    skillId?: string
    templateId?: string
}

export const useKnowledgeEditorSkillData = ({
    shopName,
    skillId,
    templateId,
}: UseKnowledgeEditorSkillDataParams) => {
    const isCreateMode = !skillId || skillId === 'new'
    const articleId = isCreateMode ? undefined : Number(skillId)

    const { helpCenter, isLoading: isHelpCenterLoading } =
        useAiAgentHelpCenterState({
            shopName,
            helpCenterType: 'guidance',
            enabled: true,
        })

    const {
        guidanceArticle: article,
        isGuidanceArticleLoading,
        isError,
        error,
    } = useGuidanceArticle({
        guidanceHelpCenterId: helpCenter?.id ?? 0,
        guidanceArticleId: articleId ?? 0,
        locale: helpCenter?.default_locale ?? 'en-US',
        versionStatus: 'latest_draft',
        enabled: !!articleId && !!helpCenter?.id,
    })

    const { allSkillsTemplates } = useSkillsTemplates()

    const skillTemplate = useMemo<SkillTemplate | undefined>(() => {
        if (!templateId) return undefined
        return allSkillsTemplates.find((t) => t.id === templateId)
    }, [templateId, allSkillsTemplates])

    const initialMode: SkillModeType = isCreateMode ? 'create' : 'read'

    return {
        helpCenter,
        isHelpCenterLoading,
        article,
        isArticleLoading: isGuidanceArticleLoading,
        isError,
        error,
        skillTemplate,
        initialMode,
    }
}
