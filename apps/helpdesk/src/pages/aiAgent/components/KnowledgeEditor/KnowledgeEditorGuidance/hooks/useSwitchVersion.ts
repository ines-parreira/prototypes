import { useCallback } from 'react'

import { useNotify } from 'hooks/useNotify'
import { getHelpCenterArticle } from 'models/helpCenter/resources'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { fromArticleTranslation, useGuidanceContext } from '../context'

export type VersionStatus = 'latest_draft' | 'current'

export function useSwitchVersion() {
    const { state, dispatch, config } = useGuidanceContext()
    const { error: notifyError } = useNotify()
    const { client } = useHelpCenterApi()

    const { guidanceHelpCenter } = config

    const switchToVersion = useCallback(
        async (targetStatus: VersionStatus) => {
            dispatch({ type: 'SET_UPDATING', payload: true })
            try {
                const response = await getHelpCenterArticle(
                    client,
                    {
                        help_center_id: guidanceHelpCenter?.id ?? 0,
                        id: state.guidance?.id ?? 0,
                    },
                    {
                        locale: guidanceHelpCenter?.default_locale ?? 'en-US',
                        version_status: targetStatus,
                    },
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
            guidanceHelpCenter?.id,
            guidanceHelpCenter?.default_locale,
            state.guidance?.id,
            notifyError,
        ],
    )

    return { switchToVersion }
}
