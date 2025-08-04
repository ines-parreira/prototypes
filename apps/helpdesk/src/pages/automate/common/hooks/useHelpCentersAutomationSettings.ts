import { useEffect } from 'react'

import { useAsyncFn } from '@repo/hooks'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { HelpCenterAutomationSettings } from 'models/helpCenter/types'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {
    getHelpCentersAutomationSettings,
    helpCenterAutomationSettingsUpdated,
    helpCentersAutomationSettingsFetched,
} from 'state/entities/helpCenter/helpCentersAutomationSettings'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

const useHelpCentersAutomationSettings = (helpCenterIds: number[]) => {
    const dispatch = useAppDispatch()
    const { client } = useHelpCenterApi()

    const helpCentersAutomationSettings = useAppSelector(
        getHelpCentersAutomationSettings,
    )

    const [
        { loading: isFetchPending },
        handleHelpCenterAutomationSettingsFetch,
    ] = useAsyncFn(
        async (helpCenterIds: number[]) => {
            if (!client) {
                return
            }

            try {
                const responses = await Promise.all(
                    helpCenterIds.map((helpCenterId) =>
                        client.getHelpCenterAutomationSettings(helpCenterId),
                    ),
                )
                const helpcentersSettings = responses.map(
                    (response, index) => ({
                        helpCenterId: helpCenterIds[index],
                        automationSettings: response.data,
                    }),
                )
                dispatch(
                    helpCentersAutomationSettingsFetched(helpcentersSettings),
                )
            } catch {
                void dispatch(
                    notify({
                        message: 'Failed to fetch',
                        status: NotificationStatus.Error,
                    }),
                )
            }
        },
        [client],
    )

    const [
        { loading: isUpdatePending },
        handleHelpCenterAutomationSettingsUpdate,
    ] = useAsyncFn(
        async (
            helpCenterId: number,
            automationSettings: Partial<HelpCenterAutomationSettings>,
        ) => {
            if (!client) {
                return
            }
            try {
                const { data: updatedAutomationSettings } =
                    await client.upsertHelpCenterAutomationSettings(
                        helpCenterId,
                        automationSettings,
                    )

                void dispatch(
                    helpCenterAutomationSettingsUpdated({
                        helpCenterId: helpCenterId.toString(),
                        automationSettings: updatedAutomationSettings,
                    }),
                )
                void dispatch(
                    notify({
                        message: 'Successfully updated',
                        status: NotificationStatus.Success,
                    }),
                )
            } catch {
                void dispatch(
                    notify({
                        message: 'Failed to update',
                        status: NotificationStatus.Error,
                    }),
                )
            }
        },
        [],
    )

    useEffect(() => {
        const valuesMissing = helpCenterIds.filter(
            (id) => !(id.toString() in helpCentersAutomationSettings),
        )

        if (valuesMissing.length) {
            void handleHelpCenterAutomationSettingsFetch(valuesMissing)
        }
    }, [
        helpCenterIds,
        helpCentersAutomationSettings,
        handleHelpCenterAutomationSettingsFetch,
    ])

    return {
        isFetchPending,
        isUpdatePending,
        helpCentersAutomationSettings,
        handleHelpCenterAutomationSettingsFetch,
        handleHelpCenterAutomationSettingsUpdate,
    }
}

export default useHelpCentersAutomationSettings
