import React, {useMemo} from 'react'
import {Map} from 'immutable'
import {NavLink} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'

import useAppSelector from 'hooks/useAppSelector'
import {FeatureFlagKey} from 'config/featureFlags'
import {getChatInstallationStatus} from 'state/entities/chatInstallationStatus/selectors'
import dotError from 'assets/img/icons/dot-error.svg'
import SecondaryNavbar from '../../../../common/components/SecondaryNavbar/SecondaryNavbar'
import {IntegrationType} from '../../../../../models/integration/types'

import css from './GorgiasChatIntegrationNavigation.less'
import useIsQuickRepliesEnabled from './GorgiasChatIntegrationQuickReplies/hooks/useIsQuickRepliesEnabled'

type Props = {
    integration: Map<any, any>
}

const GorgiasChatIntegrationNavigation = ({integration}: Props) => {
    const isQuickRepliesEnabled = useIsQuickRepliesEnabled()

    const integrationId: number = integration.get('id')

    const installationStatus = useAppSelector(getChatInstallationStatus)
    const baseURL = useMemo(
        () =>
            `/app/settings/channels/${IntegrationType.GorgiasChat}/${integrationId}`,
        [integrationId]
    )
    const isChatMultiLanguagesEnabled =
        useFlags()[FeatureFlagKey.ChatMultiLanguages]

    return (
        <SecondaryNavbar>
            <NavLink to={`${baseURL}/campaigns`}>Campaigns</NavLink>
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
        </SecondaryNavbar>
    )
}

export default GorgiasChatIntegrationNavigation
