import React from 'react'
import {List as ImmutableList, Map} from 'immutable'
import {Link} from 'react-router-dom'

import {Props as BannerProps} from 'pages/common/components/BannerNotifications/BannerNotification'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
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
    return (
        <>
            {!integrations.isEmpty() && (
                <ul className={css.list}>
                    {integrations.valueSeq().map((integration) => {
                        const editLink = `/app/settings/integrations/recharge/${
                            integration?.get('id') as number
                        }`
                        const shopifyShopName = integration?.getIn([
                            'meta',
                            'store_name',
                        ])
                        const reactivateUrl = redirectUri
                            .concat('?store_name=')
                            .concat(shopifyShopName)
                        const isDisabled = integration?.get(
                            'deactivated_datetime'
                        )
                        const isSubmitting = loading.get('updateIntegration')
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
                                {isDisabled && (
                                    <Link
                                        to={isSubmitting ? '#' : reactivateUrl}
                                        className={css.actionLink}
                                    >
                                        <Button
                                            type="button"
                                            isDisabled={isSubmitting}
                                        >
                                            Reconnect
                                        </Button>
                                    </Link>
                                )}
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
                    isDisabled={isConnectionDisabled}
                    integrationTitle={IntegrationType.Recharge}
                    disabledMessage={
                        (isConnectionDisabled && notification?.message) || ''
                    }
                >
                    <Button
                        className={css.actionButton}
                        isDisabled={isConnectionDisabled}
                    >
                        <ButtonIconLabel icon="add">
                            Connect Recharge
                        </ButtonIconLabel>
                    </Button>
                </ConnectLink>
            </div>
        </>
    )
}

export default List
