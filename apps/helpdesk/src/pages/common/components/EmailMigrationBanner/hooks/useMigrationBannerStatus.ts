import type { AxiosError } from 'axios'
import { useAsyncFn } from '@gorgias/toolkit-react'

import { toast } from '@gorgias/axiom'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { fetchEmailMigrationBannerStatus } from 'models/integration/resources/email'
import { SET_EMAIL_PROVIDER_MIGRATION_BANNER_STATUS } from 'state/integrations/constants'

export function useMigrationBannerStatus() {
    const dispatch = useAppDispatch()

    const [, fetchMigrationStatus] = useAsyncFn(async () => {
        try {
            const migrationStatus = await fetchEmailMigrationBannerStatus()
            dispatch({
                type: SET_EMAIL_PROVIDER_MIGRATION_BANNER_STATUS,
                emailMigrationBannerStatus: migrationStatus,
            })
        } catch (error) {
            const { response } = error as AxiosError<{ error: { msg: string } }>
            if (response?.status !== 403 && response?.data?.error?.msg) {
                toast.error(response.data.error.msg)
            }
        }
    })

    return fetchMigrationStatus
}
