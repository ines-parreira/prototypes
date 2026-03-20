import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { Map } from 'immutable'
import { NavLink } from 'react-router-dom'

import dotError from 'assets/img/icons/dot-error.svg'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { IntegrationType } from 'models/integration/types'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import { useInstallationStatus } from 'pages/integrations/integration/components/gorgias_chat/hooks/useInstallationStatus'
import css from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationNavigation.less'

type Props = {
    integration: Map<any, any>
}

export const GorgiasChatRevampNavigation = ({ integration }: Props) => {
    const integrationId: number = integration.get('id')
    const shopName = integration.getIn(['meta', 'shop_name'])
    const appId: string | undefined = integration.getIn(['meta', 'app_id'])
    const { hasAccess } = useAiAgentAccess(shopName)
    const isChatMultiLanguagesEnabled = useFlag(
        FeatureFlagKey.ChatMultiLanguages,
    )
    const installationStatus = useInstallationStatus(appId)

    const baseURL = useMemo(
        () =>
            `/app/settings/channels/${IntegrationType.GorgiasChat}/${integrationId}`,
        [integrationId],
    )

    return (
        <SecondaryNavbar>
            <NavLink to={`${baseURL}/appearance`} exact>
                Appearance
            </NavLink>
            <NavLink to={`${baseURL}/preferences`} exact>
                Preferences
            </NavLink>
            {hasAccess && (
                <NavLink to={`${baseURL}/automate`} exact>
                    Automation
                </NavLink>
            )}
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
