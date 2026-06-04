import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { helpCenterKeys } from 'models/helpCenter/queries'
import type { SkillRouteState } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/context'
import { KnowledgeEditorSkill } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/KnowledgeEditorSkill'
import { useAiAgentHelpCenter } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

export const SkillEditorPage = () => {
    const { shopType, shopName, skillId } = useParams<{
        shopType: string
        shopName: string
        skillId?: string
    }>()
    const location = useLocation<SkillRouteState | undefined>()
    const history = useHistory()
    const { routes } = useAiAgentNavigation({ shopName })

    const queryParams = new URLSearchParams(location.search)
    const templateId = queryParams.get('template') ?? undefined
    const versionIdParam = queryParams.get('versionId')
    const initialVersionId =
        versionIdParam !== null && !isNaN(Number(versionIdParam))
            ? Number(versionIdParam)
            : undefined

    const onClose = useCallback(() => {
        history.push(routes.skills)
    }, [history, routes.skills])

    const queryClient = useQueryClient()
    const helpCenter = useAiAgentHelpCenter({
        shopName,
        helpCenterType: 'guidance',
    })
    const helpCenterId = helpCenter?.id

    const invalidateIntents = useCallback(() => {
        if (!helpCenterId) return
        queryClient.invalidateQueries(helpCenterKeys.intents(helpCenterId))
    }, [queryClient, helpCenterId])

    return (
        <KnowledgeEditorSkill
            shopName={shopName}
            shopType={shopType}
            skillId={skillId}
            templateId={templateId}
            initialVersionId={initialVersionId}
            routeState={location.state}
            onClose={onClose}
            onUpdate={invalidateIntents}
            onDelete={invalidateIntents}
        />
    )
}
