import React from 'react'
import {NavLink} from 'react-router-dom'

import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

type Props = {
    helpCenterId: string | number
    cannotUpdateHelpCenter?: boolean
}

export const HelpCenterNavigation: React.FC<Props> = ({
    cannotUpdateHelpCenter = false,
    helpCenterId,
}: Props) => {
    const baseURL = `/app/settings/help-center/${helpCenterId}`

    if (cannotUpdateHelpCenter) {
        return null
    }

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
            <NavLink to={`${baseURL}/publish-track`}>Publish & Track</NavLink>
        </SecondaryNavbar>
    )
}
