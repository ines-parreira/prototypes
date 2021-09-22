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
    changeViewLanguage,
    getViewLanguage,
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
import HelpCenterImportCsvColumnMatchingView from '../../components/HelpCenterImportCsvColumnMatchingView'

export const CurrentHelpCenter = (): JSX.Element => {
    const dispatch = useAppDispatch()
    const {path} = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const helpCenterId = useHelpCenterIdParam()

    const {isLoading, error, data: helpCenter} = useCurrentHelpCenter()
    const viewLanguage = useSelector(getViewLanguage)

    // ? If we access the help center via URL, set the current help center
    // ? and the default locale
    useEffect(() => {
        if (!helpCenter?.id) {
            dispatch(changeHelpCenterId(helpCenterId))
        }

        if (!viewLanguage && helpCenter) {
            dispatch(changeViewLanguage(helpCenter.default_locale))
        }
    }, [helpCenter, viewLanguage, helpCenterId, dispatch])

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
                <Route
                    path={`${path}/import/csv/column-matching`}
                    component={HelpCenterImportCsvColumnMatchingView}
                />
            </Switch>
        </>
    )
}
