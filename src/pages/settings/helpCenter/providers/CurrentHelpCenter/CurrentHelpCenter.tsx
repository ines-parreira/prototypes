import React from 'react'
import {
    useHistory,
    useLocation,
    Switch,
    Route,
    useRouteMatch,
} from 'react-router-dom'
import {Container} from 'reactstrap'

import {NotificationStatus} from '../../../../../state/notifications/types'
import {notify} from '../../../../../state/notifications/actions'

import Loader from '../../../../common/components/Loader/Loader'

import {useCurrentHelpCenter} from '../../hooks/useCurrentHelpCenter'
import {useHelpCenterIdParam} from '../../hooks/useHelpCenterIdParam'
import useAppDispatch from '../../../../../hooks/useAppDispatch'

import HelpCenterArticlesView from '../../components/HelpCenterArticlesView'
import HelpCenterContactUsView from '../../components/HelpCenterContactUsView'
import HelpCenterAppearanceView from '../../components/HelpCenterAppearanceView'
import HelpCenterPreferencesView from '../../components/HelpCenterPreferencesView'
import HelpCenterCustomizationView from '../../components/HelpCenterCustomizationView'
import HelpCenterInstallationView from '../../components/HelpCenterInstallationView'

export const CurrentHelpCenter = (): JSX.Element => {
    const dispatch = useAppDispatch()
    const {path} = useRouteMatch()
    const helpcenterId = useHelpCenterIdParam()
    const history = useHistory()
    const location = useLocation()

    const {isLoading, errorCode} = useCurrentHelpCenter(helpcenterId)

    if (errorCode) {
        const message =
            errorCode === 404 ? 'Help center not found' : 'Something went wrong'

        history.push(location.pathname.split(helpcenterId.toString())[0])
        void dispatch(
            notify({
                message: message,
                status: NotificationStatus.Error,
            })
        )
    }

    if (isLoading) {
        return (
            <Container fluid className="page-container">
                <Loader />
            </Container>
        )
    }

    return (
        <>
            <Switch>
                <Route
                    path={`${path}/articles`}
                    exact
                    component={HelpCenterArticlesView}
                />
                <Route
                    path={`${path}/appearance`}
                    exact
                    component={HelpCenterAppearanceView}
                />
                <Route
                    path={`${path}/contact-us`}
                    exact
                    component={HelpCenterContactUsView}
                />
                <Route
                    path={`${path}/customization`}
                    exact
                    component={HelpCenterCustomizationView}
                />
                <Route
                    path={`${path}/preferences`}
                    exact
                    component={HelpCenterPreferencesView}
                />
                <Route
                    path={`${path}/installation`}
                    exact
                    component={HelpCenterInstallationView}
                />
            </Switch>
        </>
    )
}
