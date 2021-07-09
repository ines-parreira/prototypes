import React from 'react'
import {Link} from 'react-router-dom'

import SecondaryNavbar from '../../../common/components/SecondaryNavbar/SecondaryNavbar'

type Props = {
    helpcenterId: string | number
}

export const HelpCenterNavigation = ({helpcenterId}: Props) => {
    const baseURL = `/app/settings/help-center/${helpcenterId}`

    return (
        <SecondaryNavbar>
            <Link to={`${baseURL}/articles`}>Articles</Link>
            {/* <Link to={`${baseURL}/contact-us`}>Contact Us</Link> */}
            {/* <Link to={`${baseURL}/appearance`}>Appearance</Link> */}
            <Link to={`${baseURL}/preferences`}>Preferences</Link>
            <Link to={`${baseURL}/customization`}>Customization</Link>
            <Link to={`${baseURL}/installation`}>Installation</Link>
        </SecondaryNavbar>
    )
}
