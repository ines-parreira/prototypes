import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { Map } from 'immutable'
import { NavLink } from 'react-router-dom'

import dotError from 'assets/img/icons/dot-error.svg'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useInstallationStatus } from 'pages/integrations/integration/components/gorgias_chat/hooks/useInstallationStatus'

import { IntegrationType } from '../../../../../../models/integration/types'
import SecondaryNavbar from '../../../../../common/components/SecondaryNavbar/SecondaryNavbar'
import GorgiasChatIntegrationConnectedChannel from './GorgiasChatIntegrationConnectedChannel'
import useIsQuickRepliesEnabled from './GorgiasChatIntegrationQuickReplies/hooks/useIsQuickRepliesEnabled'

import css from './GorgiasChatIntegrationNavigation.less'

type Props = {
    integration: Map<any, any>
}

const GorgiasChatIntegrationNavigation = ({ integration }: Props) => {
    const isQuickRepliesEnabled = useIsQuickRepliesEnabled()

    const integrationId: number = integration.get('id')
    const appId: string | undefined = integration.getIn(['meta', 'app_id'])

    const installationStatus = useInstallationStatus(appId)
    const storeIntegrations = useStoreIntegrations()
    const shopIntegrationId: number | null = integration.getIn(
        ['meta', 'shop_integration_id'],
        null,
    )
    const shopName = integration.getIn(['meta', 'shop_name'])
    const { hasAccess } = useAiAgentAccess(shopName)
    const storeIntegration = storeIntegrations.find(
        (integration) => integration.id === shopIntegrationId,
    )
    const changeAutomateSettingButtomPosition = useFlag(
        FeatureFlagKey.ChangeAutomateSettingButtomPosition,
    )

    const isStoreNotConnected =
        storeIntegrations.length > 0 &&
        !shopIntegrationId &&
        integrationId &&
        !storeIntegration

    const baseURL = useMemo(
        () =>
            `/app/settings/channels/${IntegrationType.GorgiasChat}/${integrationId}`,
        [integrationId],
    )
    const isChatMultiLanguagesEnabled = useFlag(
        FeatureFlagKey.ChatMultiLanguages,
    )

    return (
        <SecondaryNavbar>
            {isQuickRepliesEnabled && (
                <NavLink to={`${baseURL}/quick_replies`} exact>
                    Quick replies
                </NavLink>
            )}
            <NavLink to={`${baseURL}/appearance`} exact>
                Appearance
            </NavLink>
            <NavLink to={`${baseURL}/preferences`} exact>
                Preferences
            </NavLink>
            {isChatMultiLanguagesEnabled && (
                <NavLink to={`${baseURL}/languages`}>Language</NavLink>
            )}
            <NavLink to={`${baseURL}/campaigns`}>Campaigns</NavLink>
            <NavLink to={`${baseURL}/installation`} exact>
                Installation
                {!installationStatus.installed && (
                    <img
                        alt="status icon"
                        src={dotError}
                        className={css.redDot}
                    />
                )}
            </NavLink>

            {hasAccess && (
                <NavLink to={`${baseURL}/automate`} exact>
                    Automation Features
                    {isStoreNotConnected && (
                        <img
                            alt="status icon"
                            src={dotError}
                            className={css.redDot}
                        />
                    )}
                </NavLink>
            )}

            {changeAutomateSettingButtomPosition && (
                <GorgiasChatIntegrationConnectedChannel />
            )}
        </SecondaryNavbar>
    )
}

export default GorgiasChatIntegrationNavigation
