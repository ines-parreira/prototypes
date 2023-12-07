import React, {useEffect, useRef, useState} from 'react'
import {Col} from 'reactstrap'
import {useHistory} from 'react-router-dom'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useAsyncFn, useEffectOnce} from 'react-use'
import {AxiosError} from 'axios'
import {fetchMigrationDomains} from 'models/integration/resources/email'
import {EmailMigrationOutboundVerification} from 'models/integration/types'
import {getMoment} from 'utils/date'
import Button from 'pages/common/components/button/Button'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useMigrationBannerStatus from 'pages/common/components/EmailMigrationBanner/hooks/useMigrationBannerStatus'
import MigrationTutorialList from './MigrationTutorialList'
import MigrationDomainList from './MigrationDomainList'

import css from './MigrationOutboundVerification.less'

type Props = {
    onBackClick: () => void
}

const REFRESH_TIME = 2 * 60 * 1000 // 5 mins

export default function MigrationOutboundVerification({onBackClick}: Props) {
    const history = useHistory()
    const [lastChecked, setLastChecked] = useState<string>()
    const lastCheckedInterval = useRef<ReturnType<typeof setInterval> | null>(
        null
    )
    const [domains, setDomains] =
        useState<EmailMigrationOutboundVerification[]>()

    const fetchMigrationStatus = useMigrationBannerStatus()

    const dispatch = useAppDispatch()

    useEffectOnce(() => {
        void handleRefresh()

        return () => {
            if (lastCheckedInterval.current) {
                clearInterval(lastCheckedInterval.current)
            }
        }
    })

    useEffect(() => {
        if (domains) {
            setLastChecked(getFormattedCurrentTime())
            void fetchMigrationStatus()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domains])

    const [{loading: isLoading}, fetchAllDomains] = useAsyncFn(async () => {
        try {
            const response = await fetchMigrationDomains()
            setDomains(response.data)
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

    const handleRefresh = async () => {
        if (lastCheckedInterval.current) {
            clearInterval(lastCheckedInterval.current)
        }

        await fetchAllDomains()
        setLastChecked(getFormattedCurrentTime())

        lastCheckedInterval.current = setInterval(() => {
            void fetchAllDomains()
        }, REFRESH_TIME)
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
                        href="https://docs.gorgias.com/en-US/email---domain-verification-(spf-&-dkim)-81757"
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
                {domains && (
                    <MigrationDomainList
                        domains={domains}
                        refreshMigrationData={handleRefresh}
                    />
                )}
                <div className={css.navigationButtonsWrapper}>
                    <Button
                        fillStyle="ghost"
                        onClick={() => {
                            history.push('/app/settings/channels/email')
                        }}
                        intent="secondary"
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
                <MigrationTutorialList
                    tutorials={[
                        {
                            name: 'How to add a new record',
                            description:
                                'Exact location of settings may vary based on your hosting provider.',
                            icon: 'note_add',
                            iconIdType: 'name',
                            instructions: [
                                {
                                    message: (
                                        <>
                                            <strong>Log in</strong> to your
                                            hosting providers’ website
                                        </>
                                    ),
                                },
                                {
                                    message: (
                                        <>
                                            Go to your{' '}
                                            <strong>account settings</strong>{' '}
                                            and find the{' '}
                                            <strong>
                                                DNS Management section
                                            </strong>
                                            . This may be called "DNS
                                            Management", "Domains", "DNS", etc.
                                        </>
                                    ),
                                },
                                {
                                    message: (
                                        <>
                                            Click to{' '}
                                            <strong>
                                                add or create a new DNS
                                            </strong>{' '}
                                            record
                                        </>
                                    ),
                                },
                                {
                                    message: (
                                        <>
                                            Using the details we provided on the
                                            left under the domain,{' '}
                                            <strong>
                                                set the record type (either
                                                "TXT" or "MX")
                                            </strong>{' '}
                                            and{' '}
                                            <strong>
                                                copy-paste the host and value
                                            </strong>
                                        </>
                                    ),
                                },
                                {
                                    message: (
                                        <>
                                            <strong>Repeat step 3 and 4</strong>{' '}
                                            until all records from the table are
                                            added.
                                        </>
                                    ),
                                },
                                {
                                    message: (
                                        <>
                                            All set! Check back later to see if
                                            it's been successfully verified.
                                            Verification may take up to 72
                                            hours.
                                        </>
                                    ),
                                },
                            ],
                        },
                    ]}
                />
            </Col>
        </div>
    )
}

const getFormattedCurrentTime = () => getMoment().calendar()
