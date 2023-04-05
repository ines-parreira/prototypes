import React, {memo} from 'react'
import {NavLink, Link} from 'react-router-dom'
import {List, Map} from 'immutable'
import classnames from 'classnames'

import warningIcon from 'assets/img/icons/warning.svg'
import dotSuccess from 'assets/img/icons/dot-success.svg'
import dotWarning from 'assets/img/icons/dot-warning.svg'
import dotNeutral from 'assets/img/icons/dot-neutral.svg'
import dotErrorCross from 'assets/img/icons/dot-error-cross.svg'
import {getIconFromType} from 'state/integrations/helpers'

import {useGorgiasChatIntegrationStatusData} from 'pages/integrations/integration/hooks/useGorgiasChatIntegrationStatusData'
import Tooltip from '../../../../common/components/Tooltip'
import history from '../../../../history'
import {
    GorgiasChatCreationWizardStatus,
    GorgiasChatStatusEnum,
    IntegrationType,
} from '../../../../../models/integration/types'

import {Tab} from '../../Integration'

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
    [GorgiasChatStatusEnum.NOT_INSTALLED]: 'Not Installed',
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

    const wizardStatus: GorgiasChatCreationWizardStatus = chat.getIn([
        'meta',
        'wizard',
        'status',
    ])

    const baseLink = `/app/settings/channels/${IntegrationType.GorgiasChat}/${integrationId}`
    const editLink = `${baseLink}/${
        wizardStatus === GorgiasChatCreationWizardStatus.Published
            ? Tab.Campaigns
            : Tab.CreateWizard
    }`
    const preferencesLink = `${baseLink}/${Tab.Preferences}}`
    const shopIntegrationId: number | null = chat.getIn(
        ['meta', 'shop_integration_id'],
        null
    )
    const storeIntegration: Map<any, any> = integrations.find(
        (_integration) => _integration?.get('id') === shopIntegrationId
    )
    const isStoreDisconnected =
        !storeIntegration || storeIntegration.get('deactivated_datetime')

    const language: string = chat.getIn(['meta', 'language'])

    const goToChat = () => history.push(editLink)

    return (
        <TableBodyRow onClick={goToChat}>
            <BodyCell innerClassName={css.chatName}>
                {chat.get('name')}
            </BodyCell>
            <BodyCell size="small">
                {storeIntegration ? (
                    <div className={css.storeDiv}>
                        <span className={css.storeName}>
                            <img
                                height={16}
                                width={16}
                                src={getIconFromType(
                                    storeIntegration.get('type')
                                )}
                                alt="logo"
                            />
                            <span>{storeIntegration.get('name')}</span>
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
                        <div id={`chat-status-${integrationId}`}>
                            <img
                                alt="status icon"
                                src={
                                    chatStatus === GorgiasChatStatusEnum.ONLINE
                                        ? dotSuccess
                                        : chatStatus ===
                                              GorgiasChatStatusEnum.HIDDEN ||
                                          chatStatus ===
                                              GorgiasChatStatusEnum.HIDDEN_OUTSIDE_BUSINESS_HOURS
                                        ? dotNeutral
                                        : chatStatus ===
                                          GorgiasChatStatusEnum.OFFLINE
                                        ? dotWarning
                                        : dotErrorCross
                                }
                                className={css.chatStatusDot}
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
                            {chatStatus ===
                                GorgiasChatStatusEnum.NOT_INSTALLED && (
                                <>
                                    <Tooltip
                                        autohide={false}
                                        delay={100}
                                        placement="top"
                                        style={{
                                            textAlign: 'center',
                                            width: 180,
                                        }}
                                        target={`chat-status-${integrationId}`}
                                    >
                                        Chat Widget was not seen installed on
                                        your website in the past 72 hours. Check
                                        its installation and your website to
                                        resolve.
                                    </Tooltip>
                                </>
                            )}
                        </div>
                    )
                )}
            </BodyCell>
            <BodyCell size="small">
                <LanguageBullet code={language} />
            </BodyCell>
            <BodyCell size="smallest" innerClassName={css.lastColumn}>
                {wizardStatus === GorgiasChatCreationWizardStatus.Published ? (
                    <ForwardIcon
                        href={editLink}
                        onClick={(ev) => {
                            ev.stopPropagation()
                        }}
                    />
                ) : (
                    <Link
                        to={editLink}
                        onClick={(ev) => {
                            ev.stopPropagation()
                        }}
                    >
                        Continue Setup
                    </Link>
                )}
            </BodyCell>
        </TableBodyRow>
    )
}

export default memo(GorgiasChatIntegrationListRow)
