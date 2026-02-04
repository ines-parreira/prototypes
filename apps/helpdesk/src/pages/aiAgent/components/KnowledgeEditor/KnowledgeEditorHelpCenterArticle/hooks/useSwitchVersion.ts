import { useCallback } from 'react'

import { useNotify } from 'hooks/useNotify'
import { getHelpCenterArticle } from 'models/helpCenter/resources'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { useArticleContext } from '../context'

export type VersionStatus = 'latest_draft' | 'current'

export function useSwitchVersion() {
    const { state, dispatch, config } = useArticleContext()
    const { error: notifyError } = useNotify()
    const { client } = useHelpCenterApi()

    const { helpCenter } = config

    const switchToVersion = useCallback(
        async (targetStatus: VersionStatus) => {
            if (!state.article?.id) return

            dispatch({ type: 'SET_UPDATING', payload: true })
            try {
                const response = await getHelpCenterArticle(
                    client,
                    {
                        help_center_id: helpCenter?.id ?? 0,
                        id: state.article.id,
                    },
                    {
                        locale: state.currentLocale,
                        version_status: targetStatus,
                    },
                )
                if (response) {
                    dispatch({
                        type: 'SWITCH_VERSION',
                        payload: {
                            article: response,
                            versionStatus: targetStatus,
                        },
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
            helpCenter?.id,
            state.article?.id,
            state.currentLocale,
            notifyError,
        ],
    )

    return { switchToVersion }
}
