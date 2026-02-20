import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { appQueryClient } from 'api/queryClient'
import { useNotify } from 'hooks/useNotify'
import { getHelpCenterArticleQuery } from 'models/helpCenter/queries'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { fromArticleTranslation, useGuidanceStore } from '../context'

export type VersionStatus = 'latest_draft' | 'current'

export function useSwitchVersion() {
    const dispatch = useGuidanceStore((storeState) => storeState.dispatch)
    const { guidanceId, guidanceHelpCenterId, guidanceHelpCenterLocale } =
        useGuidanceStore(
            useShallow((storeState) => ({
                guidanceId: storeState.state.guidance?.id ?? 0,
                guidanceHelpCenterId:
                    storeState.config.guidanceHelpCenter?.id ?? 0,
                guidanceHelpCenterLocale:
                    storeState.config.guidanceHelpCenter?.default_locale ??
                    'en-US',
            })),
        )
    const { error: notifyError } = useNotify()
    const { client } = useHelpCenterApi()

    const switchToVersion = useCallback(
        async (targetStatus: VersionStatus) => {
            dispatch({ type: 'SET_UPDATING', payload: true })
            try {
                const response = await appQueryClient.fetchQuery(
                    getHelpCenterArticleQuery({
                        client,
                        helpCenterId: guidanceHelpCenterId,
                        articleId: guidanceId,
                        locale: guidanceHelpCenterLocale,
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
            guidanceHelpCenterId,
            guidanceHelpCenterLocale,
            guidanceId,
            notifyError,
        ],
    )

    return { switchToVersion }
}
