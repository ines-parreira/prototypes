import React from 'react'
import {List as ImmutableList, Map} from 'immutable'
import {Link} from 'react-router-dom'

import {Props as BannerProps} from 'pages/common/components/BannerNotifications/BannerNotification'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Loader from 'pages/common/components/Loader/Loader'
import ConnectLink from 'pages/integrations/components/Detail/ConnectLink'
import {IntegrationType} from 'models/integration/types'
import NoIntegration from '../NoIntegration'
import css from './List.less'

type Props = {
    integrations: ImmutableList<Map<any, any>>
    loading: Map<any, any>
    redirectUri: string
    connectUrl: string
    isExternalConnectUrl: boolean
    notification?: BannerProps
    isConnectionDisabled?: boolean
}

function List({
    integrations,
    loading,
    redirectUri,
    connectUrl,
    isExternalConnectUrl,
    isConnectionDisabled = false,
    notification,
}: Props) {
    if (loading.get('integrations', false)) {
        return <Loader />
    }

    const handleConfirm = (integration?: Map<unknown, string>) => {
        const adminUrlSuffix = integration?.getIn([
            'meta',
            'admin_url_suffix',
        ]) as string
        const storeUrl = integration?.getIn(['meta', 'store_url']) as string
        window.location.href = redirectUri.concat(
            `?store_url=${storeUrl}&admin_url_suffix=${adminUrlSuffix}`
        )
    }

    return (
        <>
            {!integrations.isEmpty() && (
                <ul className={css.list}>
                    {integrations.valueSeq().map((integration) => {
                        const editLink = `/app/settings/integrations/magento2/${
                            integration!.get('id') as number
                        }`
                        const isSubmitting = loading.get('updateIntegration')
                        const isDisabled = integration?.get(
                            'deactivated_datetime'
                        )
                        const isManual = integration?.getIn([
                            'meta',
                            'is_manual',
                        ])
                        return (
                            <li
                                className={css.listItem}
                                key={integration?.get('id')}
                            >
                                <Link to={editLink} className={css.link}>
                                    <span>{integration?.get('name')}</span>
                                    <i className="material-icons md-3">
                                        keyboard_arrow_right
                                    </i>
                                </Link>
                                {isDisabled &&
                                    (isManual ? (
                                        <Link
                                            to={isSubmitting ? '#' : editLink}
                                            className={css.actionLink}
                                        >
                                            <Button
                                                type="button"
                                                isDisabled={isSubmitting}
                                            >
                                                Reconnect
                                            </Button>
                                        </Link>
                                    ) : (
                                        <ConfirmButton
                                            id="reconnect-integration"
                                            isLoading={isSubmitting}
                                            className={css.actionLink}
                                            onConfirm={() => {
                                                handleConfirm(integration)
                                            }}
                                            confirmationContent="You first need to delete the integration on your Magento2 store so that you can re-add it using this button"
                                        >
                                            Reconnect
                                        </ConfirmButton>
                                    ))}
                            </li>
                        )
                    })}
                </ul>
            )}
            <div className={css.wrapper}>
                {integrations.isEmpty() && (
                    <p>
                        <NoIntegration />
                    </p>
                )}
                <ConnectLink
                    connectUrl={connectUrl}
                    isExternal={isExternalConnectUrl}
                    integrationTitle={IntegrationType.Magento2}
                    isDisabled={isConnectionDisabled}
                    disabledMessage={
                        (isConnectionDisabled && notification?.message) || ''
                    }
                >
                    <Button
                        className={css.actionButton}
                        isDisabled={isConnectionDisabled}
                    >
                        <ButtonIconLabel icon="add">
                            Connect Magento2
                        </ButtonIconLabel>
                    </Button>
                </ConnectLink>
            </div>
        </>
    )
}

export default List
