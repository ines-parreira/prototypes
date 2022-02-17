import {useCallback} from 'react'
import useAppDispatch from 'hooks/useAppDispatch'
import {helpCenterUpdated} from 'state/entities/helpCenter/helpCenters/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {reportError} from 'utils/errors'

import {useCurrentHelpCenter} from '../providers/CurrentHelpCenter'
import {useHelpCenterApi} from './useHelpCenterApi'

export const useHelpCenterActions = () => {
    const dispatch = useAppDispatch()
    const {client} = useHelpCenterApi()
    const helpCenter = useCurrentHelpCenter()

    const fetchHelpCenterTranslations = useCallback(async () => {
        if (client && helpCenter) {
            try {
                const {
                    data: {data: translations},
                } = await client.listHelpCenterTranslations({
                    help_center_id: helpCenter.id,
                })

                dispatch(helpCenterUpdated({...helpCenter, translations}))
            } catch (err) {
                void dispatch(
                    notify({
                        message: "Failed to fetch Help center's translations",
                        status: NotificationStatus.Error,
                    })
                )
                reportError(err as Error)
            }
        }
    }, [client, helpCenter, dispatch])

    const getHelpCenterCustomDomain = useCallback(async () => {
        if (client && helpCenter) {
            try {
                const {
                    data: {data: customDomains},
                } = await client.listCustomDomains({
                    help_center_id: helpCenter.id,
                })

                const activeCustomDomain = customDomains.find(
                    (domain) => domain.status === 'active'
                )
                const customDomain = activeCustomDomain ?? customDomains[0]

                dispatch(helpCenterUpdated({...helpCenter, customDomain}))
            } catch (err) {
                void dispatch(
                    notify({
                        message: "Failed to fetch Help center's custom domains",
                        status: NotificationStatus.Error,
                    })
                )

                reportError(err as Error)
            }
        }
    }, [client, helpCenter, dispatch])

    return {fetchHelpCenterTranslations, getHelpCenterCustomDomain}
}
