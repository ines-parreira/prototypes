import {AxiosError} from 'axios'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useAsyncFn} from 'react-use'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {fetchEmailMigrationBannerStatus} from 'models/integration/resources/email'
import {SET_EMAIL_PROVIDER_MIGRATION_BANNER_STATUS} from 'state/integrations/constants'

export default function useMigrationBannerStatus() {
    const dispatch = useAppDispatch()

    const [, fetchMigrationStatus] = useAsyncFn(async () => {
        try {
            const migrationStatus = await fetchEmailMigrationBannerStatus()
            dispatch({
                type: SET_EMAIL_PROVIDER_MIGRATION_BANNER_STATUS,
                emailMigrationBannerStatus: migrationStatus,
            })
        } catch (error) {
            const {response} = error as AxiosError<{error: {msg: string}}>
            if (response?.status !== 403) {
                void dispatch(
                    notify({
                        message: response?.data?.error?.msg,
                        status: NotificationStatus.Error,
                    })
                )
            }
        }
    })

    return fetchMigrationStatus
}
