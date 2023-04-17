import React, {useMemo} from 'react'
import {Map} from 'immutable'
import {NavLink} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getChatInstallationStatus} from 'state/entities/chatInstallationStatus/selectors'
import dotError from 'assets/img/icons/dot-error.svg'
import SecondaryNavbar from '../../../../common/components/SecondaryNavbar/SecondaryNavbar'
import {IntegrationType} from '../../../../../models/integration/types'

import css from './GorgiasChatIntegrationNavigation.less'

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
