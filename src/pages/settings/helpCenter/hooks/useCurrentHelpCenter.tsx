import {useCallback, useEffect} from 'react'
import axios from 'axios'
import {useSelector} from 'react-redux'
import {useAsyncFn} from 'react-use'

import useAppDispatch from '../../../../hooks/useAppDispatch'
import {HelpCenter} from '../../../../models/helpCenter/types'
import {
    helpCentersFetched,
    helpCenterUpdated,
} from '../../../../state/entities/helpCenters/actions'
import {getCurrentHelpCenter} from '../../../../state/entities/helpCenters/selectors'
import {getCurrentHelpCenterId} from '../../../../state/helpCenter/ui'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {reportError} from '../../../../utils/errors'

import {useHelpCenterApi} from './useHelpCenterApi'

type CurrentHelpCenterApi = {
    helpCenter: HelpCenter | null
    error: Error | undefined
    getHelpCenterCustomDomain: () => Promise<void>
    fetchHelpCenterTranslations: () => Promise<void>
}

// We make us of this to not trigger more than 1 request
// if the hook is called multiple times before we have the data.
let fetchInProgress = false

export const useCurrentHelpCenter = (): CurrentHelpCenterApi => {
    const dispatch = useAppDispatch()
    const {client} = useHelpCenterApi()

    const helpCenterId = useSelector(getCurrentHelpCenterId)
    const helpCenter = useSelector(getCurrentHelpCenter)

    const [{error}, fetchHelpCenter] = useAsyncFn(async () => {
        if (client && helpCenterId) {
            try {
                fetchInProgress = true

                const {data} = await client.getHelpCenter({
                    help_center_id: helpCenterId,
                })

                dispatch(helpCentersFetched([data]))
            } catch (error) {
                let message = 'Something went wrong'

                if (axios.isAxiosError(error)) {
                    const err: {statusCode: number} = error.response?.data

                    if (err?.statusCode === 404) {
                        message = 'Help Center not found'
                    }

                    void dispatch(
                        notify({
                            message: message,
                            status: NotificationStatus.Error,
                        })
                    )
                }
            } finally {
                fetchInProgress = false
            }
        }
    }, [client, helpCenterId])

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

                const customDomain = customDomains.find(
                    (domain) => domain.status === 'active'
                )

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

    useEffect(() => {
        if (!helpCenter && !fetchInProgress) {
            void fetchHelpCenter()
        }
    }, [helpCenter, fetchHelpCenter])

    return {
        helpCenter,
        error,
        getHelpCenterCustomDomain,
        fetchHelpCenterTranslations,
    }
}
