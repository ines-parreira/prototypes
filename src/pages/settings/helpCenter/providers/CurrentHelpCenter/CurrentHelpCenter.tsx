import React, {useEffect} from 'react'
import {useSelector} from 'react-redux'
import {
    Route,
    Switch,
    useHistory,
    useLocation,
    useRouteMatch,
} from 'react-router-dom'
import {Container} from 'reactstrap'

import useAppDispatch from '../../../../../hooks/useAppDispatch'
import {
    changeHelpCenterId,
    changeViewLanguage,
    getViewLanguage,
} from '../../../../../state/helpCenter/ui'
import {isProduction} from '../../../../../utils/environment'
import Loader from '../../../../common/components/Loader/Loader'
import HelpCenterAppearanceView from '../../components/HelpCenterAppearanceView'
import HelpCenterArticlesView from '../../components/HelpCenterArticlesView'
import HelpCenterContactView from '../../components/HelpCenterContactView'
import HelpCenterCustomizationView from '../../components/HelpCenterCustomizationView'
import HelpCenterImportCsvColumnMatchingView from '../../components/HelpCenterImportCsvColumnMatchingView'
import HelpCenterInstallationView from '../../components/HelpCenterInstallationView'
import HelpCenterPreferencesView from '../../components/HelpCenterPreferencesView'
import HelpCenterSelfServiceView from '../../components/HelpCenterSelfServiceView'
import {useCurrentHelpCenter} from '../../hooks/useCurrentHelpCenter'
import {useHelpCenterIdParam} from '../../hooks/useHelpCenterIdParam'
import css from '../../../settings.less'

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
            <Container fluid className={css.pageContainer}>
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
                    path={`${path}/contact`}
                    exact
                    component={HelpCenterContactView}
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
                {
                    // TODO: Remove this to release SSP in Help Center
                    !isProduction() && (
                        <Route
                            path={`${path}/self-service`}
                            exact
                            component={HelpCenterSelfServiceView}
                        />
                    )
                }
            </Switch>
        </>
    )
}
