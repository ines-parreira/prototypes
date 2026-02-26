import type React from 'react'
import { memo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { history } from '@repo/routing'
import classnames from 'classnames'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import { Link, NavLink } from 'react-router-dom'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import dotErrorCross from 'assets/img/icons/dot-error-cross.svg'
import dotNeutral from 'assets/img/icons/dot-neutral.svg'
import dotSuccess from 'assets/img/icons/dot-success.svg'
import dotWarning from 'assets/img/icons/dot-warning.svg'
import warningIcon from 'assets/img/icons/warning.svg'
import {
    getGorgiasChatLanguageByCode,
    getPrimaryLanguageUI,
    getSecondaryLanguages,
    getSecondaryLanguagesAsTooltipContent,
} from 'config/integrations/gorgias_chat'
import type { Language } from 'constants/languages'
import useAppSelector from 'hooks/useAppSelector'
import BadgeItem from 'pages/common/components/BadgetItem'
import { LanguageBullet } from 'pages/common/components/LanguageBulletList'
import { useGorgiasChatIntegrationStatusData } from 'pages/integrations/integration/hooks/useGorgiasChatIntegrationStatusData'
import { getIconFromType } from 'state/integrations/helpers'
import { makeGetRedirectUri } from 'state/integrations/selectors'

import {
    GorgiasChatCreationWizardStatus,
    GorgiasChatStatusEnum,
    IntegrationType,
} from '../../../../../../../models/integration/types'
import BodyCell from '../../../../../../common/components/table/cells/BodyCell'
import TableBodyRow from '../../../../../../common/components/table/TableBodyRow'
import ForwardIcon from '../../../../../common/components/ForwardIcon'
import { Tab } from '../../../../types'

import css from './GorgiasChatIntegrationListRow.less'

export const GorgiasChatIntegrationStatusFeedbackMapping = {
    [GorgiasChatStatusEnum.INSTALLED]: 'Installed',
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
    const getRedirectUri = useAppSelector(makeGetRedirectUri)

    const { chatStatus, isChatStatusLoading, isChatStatusError } =
        useGorgiasChatIntegrationStatusData(chat, isLoadingIntegrations)
    const showUpdatePermissions = useFlag(
        FeatureFlagKey.ChatScopeUpdateChatList,
    )
    const integrationId: number = chat.get('id')

    const wizardStatus: GorgiasChatCreationWizardStatus = chat.getIn([
        'meta',
        'wizard',
        'status',
    ])

    const baseLink = `/app/settings/channels/${IntegrationType.GorgiasChat}/${integrationId}`
    const preferencesLink = `${baseLink}/${Tab.Preferences}`
    const installationLink = `${baseLink}/${Tab.Installation}`
    const editLink = `${baseLink}/${
        wizardStatus === GorgiasChatCreationWizardStatus.Draft
            ? Tab.CreateWizard
            : Tab.Appearance
    }`
    const shopIntegrationId: number | null = chat.getIn(
        ['meta', 'shop_integration_id'],
        null,
    )
    const storeIntegration: Map<any, any> = integrations.find(
        (_integration) => _integration?.get('id') === shopIntegrationId,
    )
    const isStoreDisconnected =
        !storeIntegration || storeIntegration.get('deactivated_datetime')

    const needScopeUpdate = Boolean(
        storeIntegration?.getIn(['meta', 'need_scope_update'], false),
    )

    const shopifyIntegrationIds: List<number> = chat.getIn(
        ['meta', 'shopify_integration_ids'],
        fromJS([]),
    )
    const isOneClickInstallation = shopIntegrationId
        ? shopifyIntegrationIds.includes(shopIntegrationId)
        : undefined

    const shopName = storeIntegration?.getIn(['meta', 'shop_name'])

    const chatMultiLanguagesEnabled = useFlag(FeatureFlagKey.ChatMultiLanguages)

    const language: string = chat.getIn(['meta', 'language'])

    const languages: List<Map<string, string>> = chat.getIn(
        ['meta', 'languages'],
        fromJS([]),
    )

    const primaryLanguage =
        getPrimaryLanguageUI(languages) ??
        getGorgiasChatLanguageByCode(language as Language)

    const secondaryLanguages = getSecondaryLanguages(languages)

    const redirectUri = getRedirectUri(IntegrationType.Shopify)

    const retriggerOAuthFlow = (ev: React.MouseEvent) => {
        ev.stopPropagation()
        window.location.href = redirectUri.replace('{shop_name}', shopName)
    }

    const goToChat = () => {
        if (needScopeUpdate) {
            history.push(installationLink)
            return
        }

        history.push(editLink)
    }

    const stopPropagation = (ev: React.MouseEvent) => {
        ev.stopPropagation()
    }

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
                                    storeIntegration.get('type'),
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
                                            GorgiasChatStatusEnum.INSTALLED
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
                                            css.chatStatusTooltipIcon,
                                        )}
                                    >
                                        timer
                                    </i>
                                    <Tooltip
                                        autohide={false}
                                        delay={100}
                                        placement="top"
                                        innerProps={{
                                            style: {
                                                textAlign: 'center',
                                                width: 180,
                                            },
                                        }}
                                        target={`chat-status-help-${integrationId}`}
                                    >
                                        Chat is{' '}
                                        <NavLink
                                            to={preferencesLink}
                                            onClick={stopPropagation}
                                        >
                                            hidden outside
                                            <br />
                                            business hours
                                        </NavLink>
                                    </Tooltip>
                                </>
                            )}
                            {chatStatus ===
                                GorgiasChatStatusEnum.NOT_INSTALLED &&
                                wizardStatus ===
                                    GorgiasChatCreationWizardStatus.Published && (
                                    <>
                                        <Tooltip
                                            autohide={false}
                                            delay={100}
                                            placement="top"
                                            innerProps={{
                                                style: {
                                                    textAlign: 'center',
                                                    width: 180,
                                                },
                                            }}
                                            target={`chat-status-${integrationId}`}
                                        >
                                            Chat Widget was not seen installed
                                            on your website in the past 72
                                            hours. Check its{' '}
                                            <Link
                                                to={installationLink}
                                                onClick={stopPropagation}
                                            >
                                                installation
                                            </Link>{' '}
                                            and your website to resolve.
                                        </Tooltip>
                                    </>
                                )}
                        </div>
                    )
                )}
            </BodyCell>
            <BodyCell size="small">
                {chatMultiLanguagesEnabled ? (
                    <>
                        {primaryLanguage && (
                            <BadgeItem
                                customClass={css.languageBadge}
                                key={primaryLanguage.value}
                                id={primaryLanguage.value as any}
                                label={`${primaryLanguage.label} (Default)`}
                            />
                        )}
                        {!!secondaryLanguages.length && (
                            <>
                                <Tooltip
                                    aria-label="Tooltip for more languages"
                                    placement="bottom"
                                    target={`more-languages-${integrationId}`}
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: getSecondaryLanguagesAsTooltipContent(
                                                secondaryLanguages,
                                            ),
                                        }}
                                    ></span>
                                </Tooltip>
                                <span id={`more-languages-${integrationId}`}>
                                    <BadgeItem
                                        customClass={css.languageBadge}
                                        key="more-languages"
                                        id={
                                            `more-languages-${integrationId}` as any
                                        }
                                        label={`+${secondaryLanguages.length} more`}
                                    />
                                </span>
                            </>
                        )}
                    </>
                ) : (
                    <LanguageBullet code={language} />
                )}
            </BodyCell>
            <BodyCell size="smallest" innerClassName={css.lastColumn}>
                {wizardStatus === GorgiasChatCreationWizardStatus.Draft ? (
                    <Link to={editLink} onClick={stopPropagation}>
                        Continue Setup
                    </Link>
                ) : showUpdatePermissions &&
                  isOneClickInstallation &&
                  needScopeUpdate ? (
                    <a onClick={retriggerOAuthFlow} href="#">
                        Update Permissions
                    </a>
                ) : (
                    <ForwardIcon href={editLink} onClick={stopPropagation} />
                )}
            </BodyCell>
        </TableBodyRow>
    )
}

export default memo(GorgiasChatIntegrationListRow)
