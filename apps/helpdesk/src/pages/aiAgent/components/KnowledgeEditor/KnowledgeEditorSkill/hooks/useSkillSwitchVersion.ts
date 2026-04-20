import { useCallback } from 'react'

import { appQueryClient } from '@repo/api-resources'
import { useShallow } from 'zustand/react/shallow'

import { getHelpCenterArticleQuery } from 'models/helpCenter/queries'
import { fromArticleTranslation } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context/utils'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { useSkillEditorStore } from '../context/KnowledgeEditorSkillContext'
import { useSkillNotify } from './useSkillNotify'

export type VersionStatus = 'latest_draft' | 'current'

export function useSkillSwitchVersion() {
    const dispatch = useSkillEditorStore((storeState) => storeState.dispatch)
    const { skillId, helpCenterId, helpCenterLocale } = useSkillEditorStore(
        useShallow((storeState) => ({
            skillId: storeState.state.skill?.id ?? 0,
            helpCenterId: storeState.config.helpCenter.id,
            helpCenterLocale:
                storeState.config.helpCenter.default_locale ?? 'en-US',
        })),
    )
    const { error: notifyError } = useSkillNotify()
    const { client } = useHelpCenterApi()

    const switchToVersion = useCallback(
        async (targetStatus: VersionStatus) => {
            dispatch({ type: 'SET_UPDATING', payload: true })
            try {
                const response = await appQueryClient.fetchQuery(
                    getHelpCenterArticleQuery({
                        client,
                        helpCenterId,
                        articleId: skillId,
                        locale: helpCenterLocale,
                        versionStatus: targetStatus,
                    }),
                )
                if (response) {
                    dispatch({
                        type: 'SWITCH_VERSION',
                        payload: fromArticleTranslation(response),
                    })
                }
            } catch {
                notifyError('An error occurred while switching version.')
            } finally {
                dispatch({ type: 'SET_UPDATING', payload: false })
            }
        },
        [
            dispatch,
            client,
            helpCenterId,
            helpCenterLocale,
            skillId,
            notifyError,
        ],
    )

    return { switchToVersion }
}
