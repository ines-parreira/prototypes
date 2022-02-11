import React, {createContext, useContext, useEffect} from 'react'
import axios from 'axios'
import {useSelector} from 'react-redux'
import {
    Route,
    Switch,
    useHistory,
    useLocation,
    useRouteMatch,
} from 'react-router-dom'
import {Container} from 'reactstrap'

import Loader from 'pages/common/components/Loader/Loader'
import {HelpCenter} from 'models/helpCenter/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {helpCentersFetched} from 'state/entities/helpCenter/helpCenters/actions'
import {getCurrentHelpCenter} from 'state/entities/helpCenter/helpCenters/selectors'
import {
    changeHelpCenterId,
    changeViewLanguage,
    getViewLanguage,
} from 'state/ui/helpCenter'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import settingsCss from 'pages/settings/settings.less'
import HelpCenterAppearanceView from 'pages/settings/helpCenter/components/HelpCenterAppearanceView'
import HelpCenterArticlesView from 'pages/settings/helpCenter/components/HelpCenterArticlesView'
import HelpCenterContactView from 'pages/settings/helpCenter/components/HelpCenterContactView'
import HelpCenterCustomizationView from 'pages/settings/helpCenter/components/HelpCenterCustomizationView'
import HelpCenterImportCsvColumnMatchingView from 'pages/settings/helpCenter/components/HelpCenterImportCsvColumnMatchingView'
import HelpCenterInstallationView from 'pages/settings/helpCenter/components/HelpCenterInstallationView'
import HelpCenterPreferencesView from 'pages/settings/helpCenter/components/HelpCenterPreferencesView'
import HelpCenterSelfServiceView from 'pages/settings/helpCenter/components/HelpCenterSelfServiceView'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {useHelpCenterIdParam} from 'pages/settings/helpCenter/hooks/useHelpCenterIdParam'

import './CurrentHelpCenter.less'
import {EditionManagerContextProvider} from '../EditionManagerContext'

const CurrentHelpCenterContext = createContext<HelpCenter | null>(null)

export const CurrentHelpCenter: React.FC = () => {
    const dispatch = useAppDispatch()
    const {path} = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const {client} = useHelpCenterApi()
    const helpCenterId = useHelpCenterIdParam()
    const helpCenter = useSelector(getCurrentHelpCenter)
    const viewLanguage = useSelector(getViewLanguage)

    useEffect(() => {
        async function init() {
            if (client && helpCenterId) {
                try {
                    const {data} = await client.getHelpCenter({
                        help_center_id: helpCenterId,
                    })

                    dispatch(helpCentersFetched([data]))
                    dispatch(changeHelpCenterId(data.id))
                } catch (err) {
                    const errorMessage =
                        axios.isAxiosError(err) && err.response?.status === 400
                            ? 'Help Center not found'
                            : 'Something went wrong'

                    void dispatch(
                        notify({
                            message: errorMessage,
                            status: NotificationStatus.Error,
                        })
                    )

                    history.push(
                        location.pathname.split(helpCenterId.toString())[0]
                    )
                }
            }
        }
        void init()
    }, [client, helpCenterId])

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

    if (!helpCenter) {
        return (
            <Container fluid className={settingsCss.pageContainer}>
                <Loader />
            </Container>
        )
    }

    return (
        <CurrentHelpCenterContext.Provider value={helpCenter}>
            <Switch>
                <Route
                    path={`${path}/articles`}
                    exact
                    render={() => (
                        <EditionManagerContextProvider>
                            <HelpCenterArticlesView />
                        </EditionManagerContextProvider>
                    )}
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
                <Route
                    path={`${path}/self-service`}
                    exact
                    component={HelpCenterSelfServiceView}
                />
            </Switch>
        </CurrentHelpCenterContext.Provider>
    )
}

export const useCurrentHelpCenter = () => {
    const helpCenter = useContext(CurrentHelpCenterContext)

    if (!helpCenter) {
        throw new Error(
            `useCurrentHelpCenter should be used inside the CurrentHelpCenterContext provider`
        )
    }

    return helpCenter
}
