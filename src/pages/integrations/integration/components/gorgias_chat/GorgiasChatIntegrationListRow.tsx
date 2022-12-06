import React, {memo} from 'react'
import {NavLink} from 'react-router-dom'
import {List, Map} from 'immutable'
import classnames from 'classnames'

import shopifyLogo from 'assets/img/integrations/shopify.png'
import warningIcon from 'assets/img/icons/warning.svg'

import {useGorgiasChatIntegrationStatusData} from 'pages/integrations/integration/hooks/useGorgiasChatIntegrationStatusData'
import Tooltip from '../../../../common/components/Tooltip'
import history from '../../../../history'
import {
    GorgiasChatStatusEnum,
    IntegrationType,
} from '../../../../../models/integration/types'

import BodyCell from '../../../../common/components/table/cells/BodyCell'
import TableBodyRow from '../../../../common/components/table/TableBodyRow'
import {LanguageBullet} from '../../../../common/components/LanguageBulletList'
import ForwardIcon from '../../../common/components/ForwardIcon'

import css from './GorgiasChatIntegrationListRow.less'

export const GorgiasChatIntegrationStatusFeedbackMapping = {
    [GorgiasChatStatusEnum.ONLINE]: 'Online',
    [GorgiasChatStatusEnum.OFFLINE]: 'Offline',
    [GorgiasChatStatusEnum.HIDDEN]: 'Hidden',
    [GorgiasChatStatusEnum.HIDDEN_OUTSIDE_BUSINESS_HOURS]: 'Hidden',
}

export type GorgiasChatIntegrationListRowProps = {
    chat: Map<any, any>
    integrations: List<Map<any, any>>
    isLoadingIntegrations: boolean
}

const GorgiasChatIntegrationListRow = ({
    chat,
    integrations,
    isLoadingIntegrations,
}: GorgiasChatIntegrationListRowProps) => {
    const {chatStatus, isChatStatusLoading, isChatStatusError} =
        useGorgiasChatIntegrationStatusData(chat, isLoadingIntegrations)
    const integrationId: number = chat.get('id')
    const baseLink = `/app/settings/channels/${IntegrationType.GorgiasChat}/${integrationId}`
    const editLink = `${baseLink}/campaigns`
    const preferencesLink = `${baseLink}/preferences`
    const shopifyStoreName: string | null = chat.getIn(
        ['meta', 'shop_name'],
        null
    )
    const shopifyStore: Map<any, any> = integrations.find(
        (_integration) =>
            _integration?.get('name') === shopifyStoreName &&
            _integration?.get('type') === IntegrationType.Shopify
    )
    const isStoreDisconnected =
        !shopifyStore || shopifyStore.get('deactivated_datetime')

    const language: string = chat.getIn(['meta', 'language'])

    const goToChat = () => history.push(editLink)

    return (
        <TableBodyRow onClick={goToChat}>
            <BodyCell innerClassName={css.chatName}>
                {chat.get('name')}
            </BodyCell>
            <BodyCell size="small">
                {shopifyStoreName !== null ? (
                    <div className={css.shopifyStoreDiv}>
                        <span className={css.shopifyStoreName}>
                            <img src={shopifyLogo} alt="logo Shopify" />
                            <span>{shopifyStoreName}</span>
                        </span>
                        {isStoreDisconnected && (
                            <>
                                <img
                                    src={warningIcon}
                                    alt="warning icon"
                                    id={`store-disconnected-${integrationId}`}
                                    className={`material-icons ${css.warningIcon}`}
                                />
                                <Tooltip
                                    target={`store-disconnected-${integrationId}`}
                                    placement="top"
                                >
                                    This store is currently disconnected
                                </Tooltip>
                            </>
                        )}
                    </div>
                ) : (
                    <div className={css.noStore}>No store connected</div>
                )}
            </BodyCell>
            <BodyCell size="small">
                {isLoadingIntegrations || isChatStatusLoading ? (
                    <span className={css.chatStatusFeedback}>Loading...</span>
                ) : isChatStatusError ? (
                    <span className={css.chatStatusFeedback}>
                        Status unavailable
                    </span>
                ) : (
                    chatStatus && (
                        <>
                            <span
                                className={classnames(css.chatStatusDot, {
                                    [css.chatStatusDotOnline]:
                                        chatStatus ===
                                        GorgiasChatStatusEnum.ONLINE,
                                    [css.chatStatusDotOffline]:
                                        chatStatus ===
                                        GorgiasChatStatusEnum.OFFLINE,
                                })}
                            />
                            <span>
                                {
                                    GorgiasChatIntegrationStatusFeedbackMapping[
                                        chatStatus
                                    ]
                                }
                            </span>
                            {chatStatus ===
                                GorgiasChatStatusEnum.HIDDEN_OUTSIDE_BUSINESS_HOURS && (
                                <>
                                    <i
                                        id={`chat-status-help-${integrationId}`}
                                        className={classnames(
                                            'material-icons-outlined',
                                            css.chatStatusTooltipIcon
                                        )}
                                    >
                                        timer
                                    </i>
                                    <Tooltip
                                        autohide={false}
                                        delay={100}
                                        placement="top"
                                        style={{
                                            textAlign: 'center',
                                            width: 180,
                                        }}
                                        target={`chat-status-help-${integrationId}`}
                                    >
                                        Chat is{' '}
                                        <NavLink
                                            to={preferencesLink}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            hidden outside
                                            <br />
                                            business hours
                                        </NavLink>
                                    </Tooltip>
                                </>
                            )}
                        </>
                    )
                )}
            </BodyCell>
            <BodyCell size="small">
                <LanguageBullet code={language} />
            </BodyCell>
            <BodyCell size="smallest">
                <ForwardIcon href={editLink} />
            </BodyCell>
        </TableBodyRow>
    )
}

export default memo(GorgiasChatIntegrationListRow)
