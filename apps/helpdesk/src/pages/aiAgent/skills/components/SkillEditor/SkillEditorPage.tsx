import { useCallback } from 'react'

import { useHistory, useLocation, useParams } from 'react-router-dom'

import type { SkillRouteState } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/context'
import { KnowledgeEditorSkill } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/KnowledgeEditorSkill'
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

    const onClose = useCallback(() => {
        history.push(routes.skills)
    }, [history, routes.skills])

    return (
        <KnowledgeEditorSkill
            shopName={shopName}
            shopType={shopType}
            skillId={skillId}
            templateId={templateId}
            routeState={location.state}
            onClose={onClose}
        />
    )
}
