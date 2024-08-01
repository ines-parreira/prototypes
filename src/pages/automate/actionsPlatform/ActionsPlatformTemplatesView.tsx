import React from 'react'
import {Container} from 'reactstrap'
import {NavLink} from 'react-router-dom'

import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

const ActionsPlatformTemplatesView = () => {
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
            <Container fluid>ActionsPlatformTemplatesView</Container>
        </div>
    )
}

export default ActionsPlatformTemplatesView
