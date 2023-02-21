import React, {useEffect, useState} from 'react'
import {useAsyncFn} from 'react-use'
import {AxiosError} from 'axios'
import {startEmailMigration} from 'models/integration/resources/email'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import Button from 'pages/common/components/button/Button'
import useMigrationBannerStatus from 'pages/common/components/EmailMigrationBanner/hooks/useMigrationBannerStatus'

import css from './StartMigration.less'

export default function StartMigration() {
    const [emailMigrationStarted, setEmailMigrationStarted] = useState(false)

    const dispatch = useAppDispatch()
    const fetchMigrationStatus = useMigrationBannerStatus()

    const [{loading}, startMigration] = useAsyncFn(async () => {
        try {
            await startEmailMigration()
            setEmailMigrationStarted(true)
        } catch (error) {
            const {response} = error as AxiosError<{error: {msg: string}}>
            const errorMsg =
                response && response.data.error
                    ? response.data.error.msg
                    : 'Failed to start migration'
            void dispatch(
                notify({
                    message: errorMsg,
                    status: NotificationStatus.Error,
                })
            )
        }
    })

    useEffect(() => {
        if (emailMigrationStarted) {
            void fetchMigrationStatus()
        }
    }, [emailMigrationStarted, fetchMigrationStatus])

    return (
        <div className={css.container} data-testid="migration-not-started">
            <div className={css.content}>
                <Button onClick={startMigration} isLoading={loading}>
                    Start migration
                </Button>
            </div>
        </div>
    )
}
