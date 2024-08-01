import React from 'react'
import {NavLink} from 'react-router-dom'
import {Container} from 'reactstrap'

import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

const ActionsPlatformAppsView = () => {
    return (
        <div className="full-width">
            <PageHeader title="Actions platform" />
            <SecondaryNavbar>
                <NavLink to="/app/automation/actions-platform" exact>
                    Templates
                </NavLink>
                <NavLink to="/app/automation/actions-platform/apps" exact>
                    Apps
                </NavLink>
            </SecondaryNavbar>
            <Container fluid>ActionsPlatformAppsView</Container>
        </div>
    )
}

export default ActionsPlatformAppsView
