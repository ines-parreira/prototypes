import { useAsyncFn } from '@repo/hooks'
import { useQueryClient } from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import client from 'models/api/resources'
import { bundleKeys } from 'models/convert/bundle/queries'
import {
    BundleActionResponse,
    BundleInstallationMethod,
} from 'models/convert/bundle/types'
import { convertStatusKeys } from 'pages/convert/common/hooks/useGetConvertStatus'
import { transformBundleError } from 'pages/convert/common/utils/transformBundleError'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useInstallBundle = (
    integrationId: number | null,
    installationMethod: BundleInstallationMethod,
    onSubmit?: (data: BundleActionResponse) => void,
) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const [{ loading: isSubmitting }, installBundle] = useAsyncFn(async () => {
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
            const { data } = await client.post<BundleActionResponse>(
                `/api/revenue-addon-bundle/${action}/`,
                {
                    integration_id: integrationId,
                },
            )

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: message,
                }),
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
                        integrationId,
                    ),
                ),
            )
        }
    }, [integrationId, installationMethod, onSubmit, dispatch])

    return { isSubmitting, installBundle }
}
