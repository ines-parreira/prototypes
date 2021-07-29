import React from 'react'
import {NavLink} from 'react-router-dom'

import SecondaryNavbar from '../../../common/components/SecondaryNavbar/SecondaryNavbar'

type Props = {
    helpcenterId: string | number
}

export const HelpCenterNavigation = ({helpcenterId}: Props) => {
    const baseURL = `/app/settings/help-center/${helpcenterId}`

    return (
        <SecondaryNavbar>
            <NavLink to={`${baseURL}/articles`} exact>
                Articles
            </NavLink>
            {/* <NavLink to={`${baseURL}/contact-us`}>Contact Us</NavLink> */}
            {/* <NavLink to={`${baseURL}/appearance`}>Appearance</NavLink> */}
            <NavLink to={`${baseURL}/preferences`} exact>
                Preferences
            </NavLink>
            <NavLink to={`${baseURL}/customization`} exact>
                Customization
            </NavLink>
            <NavLink to={`${baseURL}/installation`} exact>
                Installation
            </NavLink>
        </SecondaryNavbar>
    )
}
