import React, {useEffect, useState} from 'react'
import {useAsyncFn} from 'react-use'
import {AxiosError} from 'axios'
import {useHistory, useLocation} from 'react-router-dom'
import {startEmailMigration} from 'models/integration/resources/email'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import Button from 'pages/common/components/button/Button'
import useMigrationBannerStatus from 'pages/common/components/EmailMigrationBanner/hooks/useMigrationBannerStatus'
import useAppSelector from 'hooks/useAppSelector'
import {
    getAreIntegrationsLoading,
    getEmailMigrationStatus,
    getIntegrationsByTypes,
} from 'state/integrations/selectors'
import {getMoment, stringToDatetime} from 'utils/date'
import Loader from 'pages/common/components/Loader/Loader'
import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import {EmailIntegration} from 'models/integration/types'
import {UPDATE_FORWARDING_EMAIL_ADDRESS} from 'state/integrations/constants'
import {isBaseEmailIntegration} from '../helpers'
import StartMigrationIntegrationsTable from './StartMigrationIntegrationsTable'

import css from './StartMigration.less'

export default function StartMigration() {
    const [emailMigrationStarted, setEmailMigrationStarted] = useState(false)
    const migrationStatus = useAppSelector(getEmailMigrationStatus)
    const isLoading = useAppSelector(getAreIntegrationsLoading)
    const fetchMigrationStatus = useMigrationBannerStatus()
    const allEmailIntegrations = useAppSelector(
        getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES)
    ) as EmailIntegration[]
    const history = useHistory()
    const location = useLocation()

    const dispatch = useAppDispatch()

    const displayedIntegrations = allEmailIntegrations.filter(
        (integration) => !isBaseEmailIntegration(integration)
    )

    const [{loading}, startMigration] = useAsyncFn(async () => {
        try {
            const response = await startEmailMigration()
            dispatch({
                type: UPDATE_FORWARDING_EMAIL_ADDRESS,
                emailForwardingAddress: response.forwarding_email_address,
            })
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

    const dueDateMoment = stringToDatetime(migrationStatus?.due_at ?? '')
    const formattedDueDate = dueDateMoment?.format('dddd, MMM D, YYYY')
    const isPastDueDate = getMoment().isSameOrAfter(dueDateMoment)

    const handleMigrateLater = () => {
        if (location.key) {
            history.goBack()
        } else {
            history.push('/app/settings/channels/email')
        }
    }

    const hasIntegrationsToMigrate = !!displayedIntegrations.length

    if (isLoading) return <Loader />

    return (
        <div className={css.container} data-testid="migration-not-started">
            <div className={css.content}>
                {formattedDueDate && (
                    <h1>
                        {isPastDueDate
                            ? 'Migrate your emails or risk deactivation'
                            : `Migrate your emails by ${formattedDueDate}`}
                    </h1>
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

                <StartMigrationIntegrationsTable
                    integrations={displayedIntegrations}
                />

                <div className={css.buttonsWrapper}>
                    <Button onClick={startMigration} isLoading={loading}>
                        {hasIntegrationsToMigrate
                            ? 'Start migration'
                            : 'Complete migration'}
                    </Button>
                    {hasIntegrationsToMigrate && (
                        <Button
                            onClick={handleMigrateLater}
                            fillStyle="ghost"
                            intent="secondary"
                        >
                            Migrate later
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
