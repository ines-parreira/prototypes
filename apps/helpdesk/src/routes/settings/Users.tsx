import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { UsersListPage } from '@repo/users'

import { PageSection } from 'config/pages'
import { ADMIN_ROLE } from 'config/user'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'
import Page from 'pages/Page'
import SettingsNavbar from 'pages/settings/common/SettingsNavbar/SettingsNavbar'
import AgentDetail from 'pages/settings/users/Detail'
import AgentList from 'pages/settings/users/List'

import { renderAppSettings } from './helpers/settingsRenderer'

const ProtectedUsersListPage = withUserRoleRequired(
    UsersListPage,
    ADMIN_ROLE,
    PageSection.Users,
)

const ProtectedAgentDetail = withUserRoleRequired(
    AgentDetail,
    ADMIN_ROLE,
    PageSection.Users,
)

export function UsersListRoute() {
    const { value: isNewListEnabled, isLoading } = useFlagWithLoading(
        FeatureFlagKey.NewUsersListPage,
    )

    if (isLoading) {
        return <Page navbar={SettingsNavbar}>{null}</Page>
    }

    // The new list page renders inside an axiom Panel that owns its
    // height/scroll/sticky chrome, so it uses the full-bleed panel `Page`
    // layout; the legacy list keeps the standard settings card chrome.
    if (isNewListEnabled) {
        return (
            <Page navbar={SettingsNavbar}>
                <ProtectedUsersListPage />
            </Page>
        )
    }

    return renderAppSettings(AgentList, {
        roleParams: [ADMIN_ROLE, PageSection.Users],
    })
}

// The new user form renders inside an axiom Panel that owns its
// height/scroll/sticky chrome, so it uses the full-bleed panel `Page`
// layout; the legacy form keeps the standard settings card chrome.
export function UserDetailRoute() {
    const { value: isNewListEnabled, isLoading } = useFlagWithLoading(
        FeatureFlagKey.NewUsersListPage,
    )

    if (isLoading) {
        return <Page navbar={SettingsNavbar}>{null}</Page>
    }

    if (isNewListEnabled) {
        return (
            <Page navbar={SettingsNavbar}>
                <ProtectedAgentDetail />
            </Page>
        )
    }

    return renderAppSettings(AgentDetail, {
        roleParams: [ADMIN_ROLE, PageSection.Users],
    })
}

export function Users() {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/`} exact>
                <UsersListRoute />
            </Route>

            <Route path={`${path}/add`} exact>
                <UserDetailRoute />
            </Route>

            <Route path={`${path}/:id`} exact>
                <UserDetailRoute />
            </Route>
        </Switch>
    )
}
