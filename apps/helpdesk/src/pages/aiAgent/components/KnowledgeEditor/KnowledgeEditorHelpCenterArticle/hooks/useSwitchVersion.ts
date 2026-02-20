import { useCallback } from 'react'

import { appQueryClient } from 'api/queryClient'
import { useNotify } from 'hooks/useNotify'
import { getHelpCenterArticleQuery } from 'models/helpCenter/queries'
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
                const response = await appQueryClient.fetchQuery(
                    getHelpCenterArticleQuery({
                        client,
                        helpCenterId: helpCenter?.id ?? 0,
                        articleId: state.article.id,
                        locale: state.currentLocale,
                        versionStatus: targetStatus,
                    }),
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
