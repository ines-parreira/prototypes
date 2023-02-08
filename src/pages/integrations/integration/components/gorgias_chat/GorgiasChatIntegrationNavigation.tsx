import React, {useMemo} from 'react'
import {Map} from 'immutable'
import {NavLink} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getChatInstallationStatus} from 'state/entities/chatInstallationStatus/selectors'
import SecondaryNavbar from '../../../../common/components/SecondaryNavbar/SecondaryNavbar'
import {IntegrationType} from '../../../../../models/integration/types'

type Props = {
    integration: Map<any, any>
}

const GorgiasChatIntegrationNavigation = ({integration}: Props) => {
    const integrationId: number = integration.get('id')

    const installationStatus = useAppSelector(getChatInstallationStatus)

    const baseURL = useMemo(
        () =>
            `/app/settings/channels/${IntegrationType.GorgiasChat}/${integrationId}`,
        [integrationId]
    )

    const shopName: string | undefined | null = useMemo(
        () => integration.getIn(['meta', 'shop_name']) as string,
        [integration]
    )

    return (
        <SecondaryNavbar>
            <NavLink to={`${baseURL}/campaigns`}>Campaigns</NavLink>
            <NavLink to={`${baseURL}/quick_replies`} exact>
                Quick replies
            </NavLink>
            <NavLink to={`${baseURL}/appearance`} exact>
                Appearance
            </NavLink>
            <NavLink to={`${baseURL}/preferences`} exact>
                Preferences
            </NavLink>
            {shopName ? (
                <NavLink to={`${baseURL}/automation`} exact>
                    Automation
                </NavLink>
            ) : null}
            <NavLink to={`${baseURL}/installation`} exact>
                {!installationStatus.installed ? '❌ ' : ''}Installation
            </NavLink>
        </SecondaryNavbar>
    )
}

export default GorgiasChatIntegrationNavigation
