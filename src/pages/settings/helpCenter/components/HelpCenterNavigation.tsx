import React from 'react'
import {NavLink} from 'react-router-dom'

import SecondaryNavbar from '../../../common/components/SecondaryNavbar/SecondaryNavbar'

type Props = {
    helpCenterId: string | number
}

export const HelpCenterNavigation: React.FC<Props> = ({
    helpCenterId,
}: Props) => {
    const baseURL = `/app/settings/help-center/${helpCenterId}`

    return (
        <SecondaryNavbar>
            <NavLink to={`${baseURL}/articles`} exact>
                Articles
            </NavLink>
            <NavLink to={`${baseURL}/contact`}>Contact</NavLink>
            <NavLink to={`${baseURL}/appearance`}>Appearance</NavLink>
            <NavLink to={`${baseURL}/preferences`} exact>
                Preferences
            </NavLink>
            <NavLink to={`${baseURL}/customization`} exact>
                Customization
            </NavLink>
            <NavLink to={`${baseURL}/self-service`} exact>
                Self-service
            </NavLink>
            <NavLink to={`${baseURL}/installation`} exact>
                Installation
            </NavLink>
        </SecondaryNavbar>
    )
}
