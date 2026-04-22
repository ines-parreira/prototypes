import { useMemo } from 'react'

import { useGetArticleTranslationVersion } from 'models/helpCenter/queries'
import { useAiAgentHelpCenterState } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { useGuidanceArticle } from 'pages/aiAgent/hooks/useGuidanceArticle'
import { useSkillsTemplates } from 'pages/aiAgent/skills/hooks/useSkillsTemplates'
import type { SkillTemplate } from 'pages/aiAgent/skills/types'

import type { SkillModeType } from '../context'

type UseKnowledgeEditorSkillDataParams = {
    shopName: string
    skillId?: string
    templateId?: string
    initialVersionId?: number
    skillMode?: SkillModeType
}

export const useKnowledgeEditorSkillData = ({
    shopName,
    skillId,
    templateId,
    initialVersionId,
    skillMode,
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

    const { data: initialVersionData, isLoading: isVersionQueryLoading } =
        useGetArticleTranslationVersion(
            {
                help_center_id: helpCenter?.id ?? 0,
                article_id: article?.id ?? 0,
                locale: helpCenter?.default_locale ?? 'en-US',
                version_id: initialVersionId ?? 0,
            },
            {
                enabled: !!initialVersionId && !!helpCenter?.id && !!article,
                staleTime: 10 * 60 * 1000,
                refetchOnWindowFocus: false,
            },
        )

    const isCurrentVersion =
        !!initialVersionData &&
        (article?.publishedVersionId === initialVersionData.id ||
            article?.draftVersionId === initialVersionData.id)

    const { allSkillsTemplates } = useSkillsTemplates()

    const skillTemplate = useMemo<SkillTemplate | undefined>(() => {
        if (!templateId) return undefined
        return allSkillsTemplates.find((t) => t.id === templateId)
    }, [templateId, allSkillsTemplates])

    const initialMode: SkillModeType =
        skillMode ?? (isCreateMode ? 'create' : 'edit')

    return {
        helpCenter,
        isHelpCenterLoading,
        article,
        isArticleLoading: isGuidanceArticleLoading,
        isError,
        error,
        skillTemplate,
        initialMode,
        initialVersionData: isCurrentVersion ? undefined : initialVersionData,
        isInitialVersionLoading: !!initialVersionId && isVersionQueryLoading,
    }
}
