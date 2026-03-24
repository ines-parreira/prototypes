import React, { useEffect, useState } from 'react'

import { useAsyncFn } from '@repo/hooks'
import { reportError } from '@repo/logging'
import classNames from 'classnames'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import type { CustomDomain as CustomDomainEntity } from 'models/helpCenter/types'
import { ConnectionStatus } from 'pages/common/components/ConnectionStatus'
import Loader from 'pages/common/components/Loader/Loader'
import { StatusCheck } from 'pages/common/components/StatusCheck'
import InputField from 'pages/common/forms/input/InputField'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useHelpCenterActions } from 'pages/settings/helpCenter/hooks/useHelpCenterActions'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { useHelpCenterIdParam } from 'pages/settings/helpCenter/hooks/useHelpCenterIdParam'
import settingsCss from 'pages/settings/settings.less'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { HelpText } from './components/HelpText'

import css from './CustomDomain.less'

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

export type CustomDomainProps = {
    className?: string
}

export const CustomDomain = ({ className }: CustomDomainProps) => {
    const dispatch = useAppDispatch()
    const { client } = useHelpCenterApi()
    const helpCenterId = useHelpCenterIdParam()
    const helpCenter = useCurrentHelpCenter()
    const { getHelpCenterCustomDomain } = useHelpCenterActions()

    const [domainValue, setDomainValue] = useState('')
    const [currentDomain, setCurrentDomain] = useState<CustomDomainEntity>()

    const [deleteDomainDto, deleteDomain] = useAsyncFn(async () => {
        if (client && currentDomain) {
            try {
                const response = await client.deleteCustomDomain({
                    help_center_id: helpCenterId,
                    hostname: currentDomain.hostname,
                })

                if (response.status === 200) {
                    setDomainValue('')
                    setCurrentDomain(undefined)
                }

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Domain removed with success',
                    }),
                )

                return null
            } catch (err) {
                reportError(err as Error)
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'Failed to delete the domain',
                    }),
                )
            }
        }
    }, [client, currentDomain])

    const [createDomainDto, createDomain] = useAsyncFn(async () => {
        if (client && domainValue) {
            try {
                const response = await client.createCustomDomain(
                    {
                        help_center_id: helpCenterId,
                    },
                    {
                        hostname: domainValue,
                    },
                )

                if (response.data.hostname) {
                    setDomainValue(response.data.hostname)
                    setCurrentDomain(response.data)
                }

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Domain created with success',
                    }),
                )

                return response.data
            } catch (err) {
                reportError(err as Error)
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message:
                            'Could not add the domain. Please try again or contact support.',
                    }),
                )
            }
        }
    }, [client, helpCenterId, domainValue])

    const [domainStatusDto, checkDomainStatus] = useAsyncFn(async () => {
        if (client && currentDomain) {
            try {
                const response = await client.checkCustomDomainStatus({
                    help_center_id: helpCenterId,
                    hostname: currentDomain.hostname,
                })

                setCurrentDomain(response.data)

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Domain status updated with success',
                    }),
                )

                return response.data
            } catch (err) {
                reportError(err as Error)
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'Could not check domain status',
                    }),
                )
            }
        }
    }, [client, helpCenterId, currentDomain])

    useEffect(() => {
        void getHelpCenterCustomDomain()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (helpCenter.customDomain) {
            setDomainValue(helpCenter.customDomain.hostname)
            setCurrentDomain(helpCenter.customDomain)
        }
    }, [helpCenter.customDomain])

    const handleOnChangeDomainValue = (value: string) => {
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

    let appendEl = null

    if (deleteDomainDto.loading) {
        appendEl = (
            <span className={css.deleteDomain}>
                <Loader minHeight="16px" size="16px" />
            </span>
        )
    } else if (currentDomain?.status) {
        appendEl = (
            <span
                className={classNames(css.deleteDomain, 'material-icons')}
                data-testid="delete-domain-btn"
                onClick={handleOnDeleteDomain}
            >
                delete
            </span>
        )
    }

    return (
        <section className={className}>
            <div className={css.domainForm}>
                <div className={css.domainInput}>
                    <InputField
                        className={settingsCss.mb16}
                        isDisabled={!!currentDomain?.status}
                        caption="Redirect from your subdomain to this custom domain."
                        label="Custom domain"
                        name="domain"
                        placeholder="help.brand-name.com"
                        value={domainValue}
                        onChange={handleOnChangeDomainValue}
                    />
                    {appendEl}
                </div>
                {!!currentDomain?.status && (
                    <ConnectionStatus
                        className={css.domainStatus}
                        {...(currentDomain.verification_errors
                            ? {
                                  status: 'unknown',
                                  label: labels.unknown,
                                  tooltip: currentDomain.verification_errors[0],
                              }
                            : {
                                  status: currentDomain.status,
                                  label: labels[currentDomain.status],
                                  tooltip: tooltips[currentDomain.status],
                              })}
                    />
                )}
            </div>
            {!currentDomain?.status && (
                <Button
                    data-testid="create-domain-btn"
                    isDisabled={!domainValue || createDomainDto.loading}
                    onClick={handleOnClickAddDomain}
                    intent="secondary"
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
