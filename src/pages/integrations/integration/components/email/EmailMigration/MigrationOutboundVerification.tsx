import React, {useRef, useState} from 'react'
import {Col} from 'reactstrap'
import {useHistory} from 'react-router-dom'
import {useAsyncFn, useEffectOnce} from 'react-use'
import {AxiosError} from 'axios'
import {fetchMigrationDomains} from 'models/integration/resources/email'
import {EmailMigrationOutboundVerification} from 'models/integration/types'
import {getMoment} from 'utils/date'
import Button from 'pages/common/components/button/Button'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import MigrationTutorialList from './MigrationTutorialList'

import css from './MigrationOutboundVerification.less'

type Props = {
    onBackClick: () => void
}

const REFRESH_TIME = 5 * 60 * 1000 // 5 mins

export default function MigrationOutboundVerification({onBackClick}: Props) {
    const history = useHistory()
    const [lastChecked, setLastChecked] = useState<string>()
    const lastCheckedInterval = useRef<ReturnType<typeof setInterval> | null>(
        null
    )
    const [domains, setDomains] =
        useState<EmailMigrationOutboundVerification[]>()

    const dispatch = useAppDispatch()

    useEffectOnce(() => {
        void fetchAllDomains()
        updateLastChecked()

        return () => {
            if (lastCheckedInterval.current) {
                clearInterval(lastCheckedInterval.current)
            }
        }
    })

    const [{loading: isLoading}, fetchAllDomains] = useAsyncFn(async () => {
        try {
            const response = await fetchMigrationDomains()
            setDomains(response)
        } catch (error) {
            const {response} = error as AxiosError<{error: {msg: string}}>
            const errorMsg =
                response && response.data.error
                    ? response.data.error.msg
                    : 'Failed to fetch domains'
            void dispatch(
                notify({
                    message: errorMsg,
                    status: NotificationStatus.Error,
                })
            )
        }
    })

    const updateLastChecked = () => {
        if (lastCheckedInterval.current) {
            clearInterval(lastCheckedInterval.current)
        }

        setLastChecked(getFormattedCurrentTime())

        lastCheckedInterval.current = setInterval(() => {
            setLastChecked(getFormattedCurrentTime())
        }, REFRESH_TIME)
    }

    const handleRefresh = async () => {
        await fetchAllDomains()
        updateLastChecked()
    }

    return (
        <div
            className={css.layoutWrapper}
            data-testid="migration-domain-verification"
        >
            <Col lg={6} xl={7}>
                <h1>Verify your domain</h1>
                <p>
                    To ensure messages are not marked as spam in customer
                    inboxes, authenticate the domain associated with your email
                    addresses.{' '}
                    <a
                        // href="TODO"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn more
                    </a>
                </p>
                <div className={css.verificationDurationInfo}>
                    <div>
                        <strong>Verification may take up to 72 hours.</strong>
                    </div>
                    {lastChecked && (
                        <div className={css.verificationDurationValue}>
                            Last checked: {lastChecked}
                        </div>
                    )}
                </div>
                {domains && <div data-testid="domains-list"></div>}
                <div className={css.navigationButtonsWrapper}>
                    <Button
                        fillStyle="ghost"
                        onClick={() => {
                            history.push('/app/settings/channels/email')
                        }}
                    >
                        Finish later
                    </Button>
                    <div className={css.group}>
                        <Button intent="secondary" onClick={onBackClick}>
                            Back
                        </Button>
                        <Button onClick={handleRefresh} isLoading={isLoading}>
                            Refresh
                        </Button>
                    </div>
                </div>
            </Col>
            <Col>
                <div>HOW TO - HERE</div>
                <MigrationTutorialList tutorials={[]} />
            </Col>
        </div>
    )
}

const getFormattedCurrentTime = () => getMoment().calendar()
