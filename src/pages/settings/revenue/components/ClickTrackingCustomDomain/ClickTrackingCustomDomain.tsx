import React, {useEffect, useState} from 'react'
import classNames from 'classnames'
import {useAsyncFn} from 'react-use'

import {AxiosError} from 'axios'
import Button from 'pages/common/components/button/Button'
import InputField from 'pages/common/forms/input/InputField'

import useAppDispatch from 'hooks/useAppDispatch'
import {CustomDomain as CustomDomainEntity} from 'models/clickTracking/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import Loader from 'pages/common/components/Loader/Loader'

import settingsCss from 'pages/settings/settings.less'

import {ConnectionStatus} from 'pages/common/components/ConnectionStatus'
import {StatusCheck} from 'pages/common/components/StatusCheck'
import {isDomain} from 'utils'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import {useClickTrackingApi} from '../../hooks/useClickTrackingApi'

import {HelpText} from './components/HelpText'

import css from './ClickTrackingCustomDomain.less'

const labels = {
    active: 'Connected',
    unknown: 'Validation error',
    pending: 'Verification in progress',
}

const tooltips = {
    active: 'Everything is working, you can now access your Help Center using your custom domain.',
    unknown:
        'We were unable to connect to your custom domain, please check your DNS, try again or contact support.',
    pending:
        'We are validating your setup, make sure that your DNS is correctly set up. This can take up to one hour.',
}

export const ClickTrackingCustomDomain = () => {
    const dispatch = useAppDispatch()
    const {client} = useClickTrackingApi()

    const [domainValue, setDomainValue] = useState('')
    const [domainError, setDomainError] = useState('')
    const [currentDomain, setCurrentDomain] = useState<CustomDomainEntity>()
    const [loading, setLoading] = useState(true)

    const [deleteDomainDto, deleteDomain] = useAsyncFn(async () => {
        if (client && currentDomain) {
            try {
                const response = await client.delete_custom_domain()

                if (response.status === 204) {
                    setDomainValue('')
                    setCurrentDomain(undefined)
                }

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Domain removed with success',
                    })
                )

                return null
            } catch (err) {
                console.error(err)
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'Failed to delete the domain',
                    })
                )
            }
        }
    }, [client, currentDomain])

    const [createDomainDto, createDomain] = useAsyncFn(async () => {
        if (client && domainValue) {
            try {
                const response = await client.create_custom_domain(null, {
                    hostname: domainValue,
                })

                if (response.status === 201) {
                    const data = response.data as CustomDomainEntity
                    setDomainValue(data.hostname)
                    setCurrentDomain(data)

                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Domain created with success',
                        })
                    )
                } else {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: 'Invalid domain.',
                        })
                    )
                }

                return response.data
            } catch (err) {
                console.error(err)
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message:
                            'Could not add the domain. Please try again or contact support.',
                    })
                )
            }
        }
    }, [client, domainValue])

    const [domainStatusDto, checkDomainStatus] = useAsyncFn(async () => {
        if (client && currentDomain) {
            try {
                const response = await client.check_custom_domain()
                const {data} = response
                setCurrentDomain(data as CustomDomainEntity)

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Domain status updated with success',
                    })
                )

                return response.data
            } catch (err) {
                console.error(err)
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'Could not check domain status',
                    })
                )
            }
        }
    }, [client, currentDomain])

    useEffect(() => {
        async function init() {
            if (client) {
                try {
                    const response = await client.get_custom_domain()
                    setDomainValue(response.data.hostname)
                    setCurrentDomain(response.data as CustomDomainEntity)
                } catch (error) {
                    const {response} = error as AxiosError<{
                        error: {msg: string}
                    }>
                    if (response?.status !== 404) {
                        void dispatch(
                            notify({
                                status: NotificationStatus.Error,
                                message: 'Could not get domain status',
                            })
                        )
                    }
                }

                setLoading(false)
            }
        }

        void init()
    }, [client, dispatch])

    const handleOnChangeDomainValue = (value: string) => {
        setDomainError(isDomain(value) ? '' : 'Please enter a valid domain')
        setDomainValue(value)
    }

    const handleOnClickAddDomain = () => {
        void createDomain()
    }

    const handleOnDeleteDomain = () => {
        // ? Avoid pressing multiple times
        if (deleteDomainDto.loading) {
            return
        }

        void deleteDomain()
    }

    return loading ? (
        <Loader message="Loading..." minHeight={'400px'} />
    ) : (
        <section className={settingsCss.mb40}>
            <div className={css.domainForm}>
                <div className={css.domainInput}>
                    <InputField
                        className={settingsCss.mb16}
                        isDisabled={!!currentDomain?.status}
                        caption="Redirect from your gorgias.win subdomain to this custom domain."
                        label="Custom domain"
                        name="domain"
                        placeholder="link.brand-name.com"
                        error={domainError}
                        value={domainValue || ''}
                        onChange={handleOnChangeDomainValue}
                    />
                    {deleteDomainDto.loading ? (
                        <span className={css.deleteDomain}>
                            <Loader minHeight="16px" size="16px" />
                        </span>
                    ) : (
                        currentDomain?.status && (
                            <ConfirmationPopover
                                buttonProps={{
                                    intent: 'destructive',
                                }}
                                content={
                                    <>
                                        You are about to delete this custom
                                        domain, don't forget to delete CNAME
                                        record in your DNS manager
                                    </>
                                }
                                id={`delete-button`}
                                onConfirm={handleOnDeleteDomain}
                                placement="left"
                            >
                                {({uid, onDisplayConfirmation}) => (
                                    <span
                                        id={uid}
                                        className={classNames(
                                            css.deleteDomain,
                                            'material-icons'
                                        )}
                                        data-testid="delete-domain-btn"
                                        onClick={onDisplayConfirmation}
                                    >
                                        delete
                                    </span>
                                )}
                            </ConfirmationPopover>
                        )
                    )}
                </div>
                {currentDomain?.status && (
                    <ConnectionStatus
                        className={css.domainStatus}
                        status={currentDomain.status}
                        label={labels[currentDomain.status]}
                        tooltip={tooltips[currentDomain.status]}
                    />
                )}
            </div>
            {!currentDomain?.status && (
                <Button
                    data-testid="create-domain-btn"
                    isDisabled={!domainValue || createDomainDto.loading}
                    onClick={handleOnClickAddDomain}
                >
                    {createDomainDto.loading ? (
                        <span>Creating domain</span>
                    ) : (
                        <span>Add Domain</span>
                    )}
                </Button>
            )}
            <StatusCheck
                isLoading={domainStatusDto.loading}
                onCheckStatus={checkDomainStatus}
                status={currentDomain?.status}
            />
            <HelpText isHidden={currentDomain?.status === 'active'} />
        </section>
    )
}
