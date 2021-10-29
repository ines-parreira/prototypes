import React, {useEffect} from 'react'
import {
    useHistory,
    useLocation,
    Switch,
    Route,
    useRouteMatch,
} from 'react-router-dom'
import {useSelector} from 'react-redux'

import {Container} from 'reactstrap'

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

import './CurrentHelpCenter.less'

export const CurrentHelpCenter = (): JSX.Element => {
    const dispatch = useAppDispatch()
    const {path} = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const helpCenterId = useHelpCenterIdParam()

    const {error, helpCenter} = useCurrentHelpCenter()
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
        history.push(location.pathname.split(helpCenterId.toString())[0])
    }

    if (!helpCenter) {
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
