import React, {useEffect} from 'react'
import axios from 'axios'
import {
    useHistory,
    useLocation,
    Switch,
    Route,
    useRouteMatch,
} from 'react-router-dom'
import {useSelector} from 'react-redux'

import {Container} from 'reactstrap'

import {NotificationStatus} from '../../../../../state/notifications/types'
import {notify} from '../../../../../state/notifications/actions'
import {
    changeHelpCenterId,
    getCurrentHelpCenterId,
} from '../../../../../state/helpCenter/ui'

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
    const helpCenterId = useHelpCenterIdParam()
    const history = useHistory()
    const location = useLocation()
    const currentHelpCenterId = useSelector(getCurrentHelpCenterId)

    const {isLoading, error} = useCurrentHelpCenter()

    useEffect(() => {
        if (helpCenterId !== currentHelpCenterId || !currentHelpCenterId) {
            dispatch(changeHelpCenterId(helpCenterId))
        }
    }, [helpCenterId, currentHelpCenterId, dispatch])

    if (error) {
        let message = 'Something went wrong'

        if (axios.isAxiosError(error)) {
            const err: {statusCode: number} = error.response?.data

            if (err?.statusCode === 404) {
                message = 'Help center not found!'
            }
        }

        history.push(location.pathname.split(helpCenterId.toString())[0])
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
