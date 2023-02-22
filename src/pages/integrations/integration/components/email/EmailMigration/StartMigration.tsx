import React, {useEffect, useState} from 'react'
import {useAsyncFn} from 'react-use'
import {AxiosError} from 'axios'
import {startEmailMigration} from 'models/integration/resources/email'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import Button from 'pages/common/components/button/Button'
import useMigrationBannerStatus from 'pages/common/components/EmailMigrationBanner/hooks/useMigrationBannerStatus'
import useAppSelector from 'hooks/useAppSelector'
import {getEmailMigrationStatus} from 'state/integrations/selectors'
import {stringToDatetime} from 'utils/date'
import StartMigrationIntegrationsTable from './StartMigrationIntegrationsTable'

import css from './StartMigration.less'

export default function StartMigration() {
    const [emailMigrationStarted, setEmailMigrationStarted] = useState(false)
    const migrationStatus = useAppSelector(getEmailMigrationStatus)
    const fetchMigrationStatus = useMigrationBannerStatus()

    const dispatch = useAppDispatch()

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

    const formattedDueDate = stringToDatetime(
        migrationStatus?.due_at ?? ''
    )?.format('dddd, MMM D, YYYY')

    return (
        <div className={css.container} data-testid="migration-not-started">
            <div className={css.content}>
                {formattedDueDate && (
                    <h1>Migrate your emails by {formattedDueDate}</h1>
                )}
                <div className={css.description}>
                    <p>
                        We're transitioning to a new email provider to improve{' '}
                        <strong>stability and reliability</strong>.
                    </p>
                    <p>
                        To continue sending and receiving emails on Gorgias, you
                        need to{' '}
                        <strong>
                            set up email forwarding and/or verify the domain
                        </strong>{' '}
                        for the email addresses associated with your account.{' '}
                        <a href="">Learn more</a>
                    </p>
                </div>

                <StartMigrationIntegrationsTable />

                <div className={css.buttonsWrapper}>
                    <Button onClick={startMigration} isLoading={loading}>
                        Start migration
                    </Button>
                    <Button
                        onClick={() => {
                            // TODO
                        }}
                        fillStyle="ghost"
                        intent="secondary"
                    >
                        Migrate later
                    </Button>
                </div>
            </div>
        </div>
    )
}
