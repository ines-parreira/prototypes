import React from 'react'
import classNames from 'classnames'
import {useSelector} from 'react-redux'
import {useAsyncFn} from 'react-use'
import {Button} from 'reactstrap/lib'

import useAppDispatch from '../../../../../hooks/useAppDispatch'
import {CustomDomain as CustomDomainEntity} from '../../../../../models/helpCenter/types'
import {helpCenterUpdated} from '../../../../../state/entities/helpCenters/actions'
import {getCurrentHelpCenter} from '../../../../../state/entities/helpCenters/selectors'
import {notify} from '../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {isProduction} from '../../../../../utils/environment'
import Loader from '../../../../common/components/Loader/Loader'
import ToggleButton from '../../../../common/components/ToggleButton'
import InputField from '../../../../common/forms/InputField'
import {useHelpcenterApi} from '../../hooks/useHelpcenterApi'
import {useHelpCenterIdParam} from '../../hooks/useHelpCenterIdParam'

import {
    ConnectionStatus,
    ConnectionStatusProps,
} from './components/ConnectionStatus'
import {HelpText} from './components/HelpText'
import {StatusCheck} from './components/StatusCheck'
import css from './CustomDomain.less'

const labels = {
    active: 'Connected',
    unknown: 'Error connecting',
    pending: 'Connection in progress',
}

const tooltips = {
    active:
        'Everything working, you can now access your help center using your custom domain.',
    unknown: 'Please make sure your DNS is correctly set up and try again.',
    pending: 'We are configuring your help center, it can take up to 1 hour.',
}

export const CustomDomain = () => {
    const dispatch = useAppDispatch()
    const {client} = useHelpcenterApi()
    const helpCenterId = useHelpCenterIdParam()
    const helpCenter = useSelector(getCurrentHelpCenter)

    const [domainValue, setDomainValue] = React.useState('')
    const [currentDomain, setCurrentDomain] = React.useState<
        CustomDomainEntity
    >()

    const [domainsDto, fetchDomains] = useAsyncFn(async () => {
        if (client) {
            try {
                const response = await client
                    .listCustomDomains({
                        help_center_id: helpCenterId,
                    })
                    .then((response) => response.data)

                if (response.data.length > 0) {
                    const singleDomain = response.data[0]

                    if (singleDomain.hostname) {
                        setDomainValue(singleDomain.hostname)
                        setCurrentDomain(singleDomain)
                    }
                }

                return response.data
            } catch (err) {
                console.error(err)
            }
        }
    }, [client])

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
                        message: 'Domain successfully removed.',
                    })
                )

                return null
            } catch (err) {
                console.error(err)
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'Could not delete the domain.',
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
                        message: 'Domain successfully created.',
                    })
                )

                return response.data
            } catch (err) {
                console.error(err)
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'Could not add the domain.',
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
                        message: 'Domain status successfully updated.',
                    })
                )

                return response.data
            } catch (err) {
                console.error(err)
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'Could not check domain status.',
                    })
                )
            }
        }
    }, [client, helpCenterId, currentDomain])

    const [{loading: updating}, toggleCustomDomain] = useAsyncFn(
        async (customDomainActivated: boolean) => {
            if (client) {
                try {
                    const {data} = await client.updateHelpCenter(
                        {help_center_id: helpCenterId},
                        {custom_domain_deactivated: !customDomainActivated}
                    )

                    dispatch(helpCenterUpdated(data))

                    void dispatch(
                        notify({
                            message: `Custom domain successfully ${
                                customDomainActivated ? 'enabled' : 'disabled'
                            }`,
                            status: NotificationStatus.Success,
                        })
                    )
                } catch (err) {
                    void dispatch(
                        notify({
                            message: `Could not toggle custom domain feature`,
                            status: NotificationStatus.Error,
                        })
                    )
                    console.error(err)
                }
            }
        },
        [client, helpCenterId]
    )

    React.useEffect(() => {
        void fetchDomains()
    }, [client])

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

    const handleOnToggleFeature = (customDomainActivated: boolean) => {
        void toggleCustomDomain(customDomainActivated)
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

    if (helpCenter == null) {
        return null
    }

    const customDomainEnabled =
        helpCenter.custom_domain_deactivated_datetime === null

    return (
        <section className={css.domainWrapper}>
            <div>
                <div className={css.titleContainer}>
                    <ToggleButton
                        value={customDomainEnabled}
                        onChange={handleOnToggleFeature}
                        disabled={updating}
                        loading={updating}
                    />
                    <h4 className={css.title}>Custom Domain</h4>
                </div>
                <p>
                    {`Enabling a custom domain will create a redirection from your
                    ${domain} subdomain to this custom domain. This means
                    that you don’t need to manually update old references of
                    your subdomain.`}
                </p>
            </div>
            <HelpText
                isHidden={
                    !customDomainEnabled || currentDomain?.status === 'active'
                }
            />
            <div className={css.domainForm}>
                <div className={css.domainInput}>
                    <InputField
                        disabled={
                            domainsDto.loading ||
                            !customDomainEnabled ||
                            !!currentDomain?.status
                        }
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
            {customDomainEnabled && !currentDomain?.status && (
                <Button
                    color="success"
                    data-testid="create-domain-btn"
                    disabled={!domainValue || createDomainDto.loading}
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
