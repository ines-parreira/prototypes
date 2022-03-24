import React, {useEffect, useState} from 'react'
import classNames from 'classnames'
import {useAsyncFn} from 'react-use'

import Button from 'pages/common/components/button/Button'

import useAppDispatch from '../../../../../hooks/useAppDispatch'
import {CustomDomain as CustomDomainEntity} from '../../../../../models/helpCenter/types'
import {notify} from '../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {isProduction} from '../../../../../utils/environment'
import Loader from '../../../../common/components/Loader/Loader'
import DEPRECATED_InputField from '../../../../common/forms/DEPRECATED_InputField'
import {useHelpCenterActions} from '../../hooks/useHelpCenterActions'
import {useHelpCenterApi} from '../../hooks/useHelpCenterApi'
import {useHelpCenterIdParam} from '../../hooks/useHelpCenterIdParam'
import {useCurrentHelpCenter} from '../../providers/CurrentHelpCenter'

import {
    ConnectionStatus,
    ConnectionStatusProps,
} from './components/ConnectionStatus'
import {HelpText} from './components/HelpText'
import {StatusCheck} from './components/StatusCheck'

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

export const CustomDomain = () => {
    const dispatch = useAppDispatch()
    const {client} = useHelpCenterApi()
    const helpCenterId = useHelpCenterIdParam()
    const helpCenter = useCurrentHelpCenter()
    const {getHelpCenterCustomDomain} = useHelpCenterActions()

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
                const response = await client.createCustomDomain(
                    {
                        help_center_id: helpCenterId,
                    },
                    {
                        hostname: domainValue,
                    }
                )

                if (response.data.hostname) {
                    setDomainValue(response.data.hostname)
                    setCurrentDomain(response.data)
                }

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Domain created with success',
                    })
                )

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
    }, [client, helpCenterId, currentDomain])

    useEffect(() => {
        void getHelpCenterCustomDomain()
    }, [])

    useEffect(() => {
        if (helpCenter.customDomain) {
            setDomainValue(helpCenter.customDomain.hostname)
            setCurrentDomain(helpCenter.customDomain)
        }
    }, [helpCenter.customDomain])

    const domain = isProduction() ? 'gorgias.help' : 'gorgias.rehab'

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

    const renderConnection = () => {
        if (currentDomain?.status) {
            let status: ConnectionStatusProps['status'] = currentDomain.status
            let label = labels[currentDomain.status]
            let tooltip = tooltips[currentDomain.status]

            if (currentDomain.verification_errors) {
                status = 'unknown'
                label = labels[status]
                tooltip = currentDomain.verification_errors[0]
            }

            return (
                <ConnectionStatus
                    className={css.domainStatus}
                    status={status}
                    label={label}
                    tooltip={tooltip}
                />
            )
        }

        return null
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
        <section>
            <div>
                <h4 className={css.title}>Custom Domain</h4>
                <p>
                    {`Enabling a custom domain will create a redirection from your
                    ${domain} subdomain to this custom domain. This means
                    that you don’t need to manually update old references of
                    your subdomain.`}
                </p>
            </div>
            <HelpText isHidden={currentDomain?.status === 'active'} />
            <div className={css.domainForm}>
                <div className={css.domainInput}>
                    <DEPRECATED_InputField
                        disabled={!!currentDomain?.status}
                        help="Add a custom domain"
                        label="Custom domain"
                        name="domain"
                        placeholder="help.brand-name.com"
                        value={domainValue}
                        onChange={handleOnChangeDomainValue}
                    />
                    {appendEl}
                </div>
                {renderConnection()}
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
        </section>
    )
}
