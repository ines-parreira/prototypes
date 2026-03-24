import { useEffect, useMemo } from 'react'

import { useAsyncFn } from '@repo/hooks'
import { reportError } from '@repo/logging'
import { isAxiosError } from 'axios'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { HelpCenterAutomationSettings } from 'models/helpCenter/types'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {
    getHelpCentersAutomationSettings,
    helpCenterAutomationSettingsFetched,
    helpCenterAutomationSettingsUpdated,
} from 'state/entities/helpCenter/helpCentersAutomationSettings'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

const useHelpCentersAutomationSettings = (
    helpCenterId: number,
    withNotifications = true,
) => {
    const dispatch = useAppDispatch()
    const { client } = useHelpCenterApi()

    const helpCentersAutomationSettings = useAppSelector(
        getHelpCentersAutomationSettings,
    )

    const [
        { loading: isFetchPending },
        handleHelpCenterAutomationSettingsFetch,
    ] = useAsyncFn(async () => {
        if (!client || !helpCenterId) {
            return
        }

        try {
            const { data: automationSettings } =
                await client.getHelpCenterAutomationSettings({
                    help_center_id: helpCenterId,
                })

            void dispatch(
                helpCenterAutomationSettingsFetched({
                    helpCenterId: helpCenterId.toString(),
                    automationSettings,
                }),
            )
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) {
                return dispatch(
                    helpCenterAutomationSettingsFetched({
                        helpCenterId: helpCenterId.toString(),
                        automationSettings: {
                            workflows: [],
                            order_management: { enabled: false },
                        },
                    }),
                )
            }

            if (error instanceof Error) {
                reportError(error)
            }

            void dispatch(
                notify({
                    message: 'Failed to fetch AI Agent settings',
                    status: NotificationStatus.Error,
                }),
            )
        }
    }, [client, helpCenterId])

    const [
        { loading: isUpdatePending },
        handleHelpCenterAutomationSettingsUpdate,
    ] = useAsyncFn(
        async (
            automationSettings: Partial<HelpCenterAutomationSettings>,
            notificationMessage?: string,
        ) => {
            if (!client || !helpCenterId) {
                return
            }

            try {
                const { data: updatedAutomationSettings } =
                    await client.upsertHelpCenterAutomationSettings(
                        { help_center_id: helpCenterId },
                        automationSettings,
                    )

                void dispatch(
                    helpCenterAutomationSettingsUpdated({
                        helpCenterId: helpCenterId.toString(),
                        automationSettings: updatedAutomationSettings,
                    }),
                )

                if (withNotifications) {
                    void dispatch(
                        notify({
                            message:
                                notificationMessage ?? 'Successfully updated',
                            status: NotificationStatus.Success,
                        }),
                    )
                }
            } catch (error) {
                if (error instanceof Error) {
                    reportError(error)
                }

                void dispatch(
                    notify({
                        message: 'Failed to update AI Agent settings',
                        status: NotificationStatus.Error,
                    }),
                )
            }
        },
        [client, helpCenterId],
    )

    useEffect(() => {
        // Don't fetch if helpCenterId is not provided or invalid
        if (!helpCenterId) return

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
            ] ?? { workflows: [] },
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
        ],
    )
}

export default useHelpCentersAutomationSettings
