import {useQueryClient} from '@tanstack/react-query'
import useAsyncFn from 'hooks/useAsyncFn'

import client from 'models/api/resources'
import {transformBundleError} from 'pages/settings/revenue/utils/transformBundleError'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {bundleKeys} from 'models/convert/bundle/queries'
import {convertStatusKeys} from 'pages/settings/revenue/hooks/useGetConvertStatus'
import {
    BundleActionResponse,
    BundleInstallationMethod,
} from 'models/convert/bundle/types'

export const useInstallBundle = (
    integrationId: number | null,
    installationMethod: BundleInstallationMethod,
    onSubmit?: (data: BundleActionResponse) => void
) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const [{loading: isSubmitting}, installBundle] = useAsyncFn(async () => {
        if (!integrationId) {
            return
        }

        let action = 'install'
        let message = 'Bundle installed successfully'
        if (installationMethod === BundleInstallationMethod.Manual) {
            action = 'manual-install'
            message = 'Ready for installation, please follow the instructions'
        }

        try {
            const {data} = await client.post<BundleActionResponse>(
                `/api/revenue-addon-bundle/${action}/`,
                {
                    integration_id: integrationId,
                }
            )

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: message,
                })
            )

            await queryClient.invalidateQueries({
                queryKey: bundleKeys.lists(),
            })

            await queryClient.invalidateQueries({
                queryKey: convertStatusKeys.all(),
            })

            if (onSubmit) {
                onSubmit(data)
            }

            return data
        } catch (e) {
            void dispatch(
                notify(
                    transformBundleError(
                        e,
                        "We couldn't install the bundle. Please try again.",
                        integrationId
                    )
                )
            )
        }
    }, [integrationId, installationMethod, onSubmit, dispatch])

    return {isSubmitting, installBundle}
}
