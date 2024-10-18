import React, {useMemo} from 'react'
import {Map} from 'immutable'
import {NavLink} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'

import useAppSelector from 'hooks/useAppSelector'
import {FeatureFlagKey} from 'config/featureFlags'
import {getChatInstallationStatus} from 'state/entities/chatInstallationStatus/selectors'
import dotError from 'assets/img/icons/dot-error.svg'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import {getHasAutomate} from 'state/billing/selectors'
import SecondaryNavbar from '../../../../common/components/SecondaryNavbar/SecondaryNavbar'
import {IntegrationType} from '../../../../../models/integration/types'

import css from './GorgiasChatIntegrationNavigation.less'
import useIsQuickRepliesEnabled from './GorgiasChatIntegrationQuickReplies/hooks/useIsQuickRepliesEnabled'
import GorgiasChatIntegrationConnectedChannel from './GorgiasChatIntegrationConnectedChannel'

type Props = {
    integration: Map<any, any>
}

const GorgiasChatIntegrationNavigation = ({integration}: Props) => {
    const isQuickRepliesEnabled = useIsQuickRepliesEnabled()

    const integrationId: number = integration.get('id')

    const installationStatus = useAppSelector(getChatInstallationStatus)
    const storeIntegrations = useStoreIntegrations()
    const shopIntegrationId: number | null = integration.getIn(
        ['meta', 'shop_integration_id'],
        null
    )
    const hasAutomate = useAppSelector(getHasAutomate)
    const newChannelsView = useFlags()[FeatureFlagKey.NewChannelsView]
    const storeIntegration = storeIntegrations.find(
        (integration) => integration.id === shopIntegrationId
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
        [integrationId]
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

            {newChannelsView && hasAutomate && (
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
                <GorgiasChatIntegrationConnectedChannel
                    integration={integration}
                />
            )}
        </SecondaryNavbar>
    )
}

export default GorgiasChatIntegrationNavigation
