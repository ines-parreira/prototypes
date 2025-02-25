import React, { useMemo } from 'react'

import { Map } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { NavLink } from 'react-router-dom'

import dotError from 'assets/img/icons/dot-error.svg'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { getHasAutomate } from 'state/billing/selectors'
import { getChatInstallationStatus } from 'state/entities/chatInstallationStatus/selectors'

import { IntegrationType } from '../../../../../models/integration/types'
import SecondaryNavbar from '../../../../common/components/SecondaryNavbar/SecondaryNavbar'
import GorgiasChatIntegrationConnectedChannel from './GorgiasChatIntegrationConnectedChannel'
import useIsQuickRepliesEnabled from './GorgiasChatIntegrationQuickReplies/hooks/useIsQuickRepliesEnabled'

import css from './GorgiasChatIntegrationNavigation.less'

type Props = {
    integration: Map<any, any>
}

const GorgiasChatIntegrationNavigation = ({ integration }: Props) => {
    const isQuickRepliesEnabled = useIsQuickRepliesEnabled()

    const integrationId: number = integration.get('id')

    const installationStatus = useAppSelector(getChatInstallationStatus)
    const storeIntegrations = useStoreIntegrations()
    const shopIntegrationId: number | null = integration.getIn(
        ['meta', 'shop_integration_id'],
        null,
    )
    const hasAutomate = useAppSelector(getHasAutomate)
    const storeIntegration = storeIntegrations.find(
        (integration) => integration.id === shopIntegrationId,
    )
    const changeAutomateSettingButtomPosition =
        useFlags()[FeatureFlagKey.ChangeAutomateSettingButtomPosition]

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
    const isChatMultiLanguagesEnabled =
        useFlags()[FeatureFlagKey.ChatMultiLanguages]

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

            {hasAutomate && (
                <NavLink to={`${baseURL}/automate`} exact>
                    Automate
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
