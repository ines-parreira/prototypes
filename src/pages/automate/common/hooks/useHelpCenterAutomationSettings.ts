import axios from 'axios'
import {useEffect, useMemo} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'

import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    helpCenterAutomationSettingsFetched,
    helpCenterAutomationSettingsUpdated,
    getHelpCentersAutomationSettings,
} from 'state/entities/helpCenter/helpCentersAutomationSettings'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {HelpCenterAutomationSettings} from 'models/helpCenter/types'
import {reportError} from 'utils/errors'

const useHelpCentersAutomationSettings = (
    helpCenterId: number,
    withNotifications = true
) => {
    const dispatch = useAppDispatch()
    const {client} = useHelpCenterApi()

    const helpCentersAutomationSettings = useAppSelector(
        getHelpCentersAutomationSettings
    )

    const [{loading: isFetchPending}, handleHelpCenterAutomationSettingsFetch] =
        useAsyncFn(async () => {
            if (!client) {
                return
            }

            try {
                const {data: automationSettings} =
                    await client.getHelpCenterAutomationSettings({
                        help_center_id: helpCenterId,
                    })

                void dispatch(
                    helpCenterAutomationSettingsFetched({
                        helpCenterId: helpCenterId.toString(),
                        automationSettings,
                    })
                )
            } catch (error) {
                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 404
                ) {
                    return dispatch(
                        helpCenterAutomationSettingsFetched({
                            helpCenterId: helpCenterId.toString(),
                            automationSettings: {
                                workflows: [],
                                order_management: {enabled: false},
                            },
                        })
                    )
                }

                if (error instanceof Error) {
                    reportError(error)
                }

                void dispatch(
                    notify({
                        message: 'Failed to fetch automation settings',
                        status: NotificationStatus.Error,
                    })
                )
            }
        }, [client])

    const [
        {loading: isUpdatePending},
        handleHelpCenterAutomationSettingsUpdate,
    ] = useAsyncFn(
        async (automationSettings: Partial<HelpCenterAutomationSettings>) => {
            if (!client) {
                return
            }

            try {
                const {data: updatedAutomationSettings} =
                    await client.upsertHelpCenterAutomationSettings(
                        {help_center_id: helpCenterId},
                        automationSettings
                    )

                void dispatch(
                    helpCenterAutomationSettingsUpdated({
                        helpCenterId: helpCenterId.toString(),
                        automationSettings: updatedAutomationSettings,
                    })
                )

                if (withNotifications) {
                    void dispatch(
                        notify({
                            message: 'Successfully updated',
                            status: NotificationStatus.Success,
                        })
                    )
                }
            } catch (error) {
                if (error instanceof Error) {
                    reportError(error)
                }

                void dispatch(
                    notify({
                        message: 'Failed to update automation settings',
                        status: NotificationStatus.Error,
                    })
                )
            }
        },
        [client]
    )

    useEffect(() => {
        const valueMissing =
            helpCentersAutomationSettings[helpCenterId.toString()] === undefined

        if (valueMissing) {
            void handleHelpCenterAutomationSettingsFetch()
        }
    }, [
        helpCenterId,
        helpCentersAutomationSettings,
        handleHelpCenterAutomationSettingsFetch,
    ])

    return useMemo(
        () => ({
            isFetchPending,
            isUpdatePending,
            automationSettings: helpCentersAutomationSettings[
                helpCenterId.toString()
            ] ?? {workflows: []},
            handleHelpCenterAutomationSettingsFetch,
            handleHelpCenterAutomationSettingsUpdate,
        }),
        [
            isFetchPending,
            isUpdatePending,
            helpCenterId,
            helpCentersAutomationSettings,
            handleHelpCenterAutomationSettingsFetch,
            handleHelpCenterAutomationSettingsUpdate,
        ]
    )
}

export default useHelpCentersAutomationSettings
