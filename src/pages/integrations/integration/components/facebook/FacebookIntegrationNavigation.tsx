import { Map } from 'immutable'
import { NavLink } from 'react-router-dom'

import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

const FacebookIntegrationNavigation = ({
    integration,
}: {
    integration: Map<any, any>
}) => {
    const integrationId: number = integration.get('id')
    const baseURL = `/app/settings/integrations/facebook/${integrationId}`

    const links = [
        [`${baseURL}/overview`, 'Overview'],
        [`${baseURL}/customer_chat`, 'Customer chat'],
        [`${baseURL}/preferences`, 'Preferences'],
    ]

    return (
        <SecondaryNavbar>
            {links.map(([to, text]) => (
                <NavLink key={to} to={to} exact>
                    {text}
                </NavLink>
            ))}
        </SecondaryNavbar>
    )
}

export default FacebookIntegrationNavigation
