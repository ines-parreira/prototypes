import React, {useEffect} from 'react'
import axios from 'axios'
import {
    Route,
    Switch,
    useHistory,
    useLocation,
    useRouteMatch,
} from 'react-router-dom'
import {Container} from 'reactstrap'

import {useFlags} from 'launchdarkly-react-client-sdk'
import Loader from 'pages/common/components/Loader/Loader'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import {
    changeHelpCenterId,
    changeViewLanguage,
    getViewLanguage,
} from 'state/ui/helpCenter'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import settingsCss from 'pages/settings/settings.less'
import HelpCenterAppearanceView from 'pages/settings/helpCenter/components/HelpCenterAppearanceView/HelpCenterAppearanceView'
import HelpCenterArticlesView from 'pages/settings/helpCenter/components/HelpCenterArticlesView'
import HelpCenterContactView from 'pages/settings/helpCenter/components/HelpCenterContactView'
import HelpCenterCustomizationView from 'pages/settings/helpCenter/components/HelpCenterCustomizationView'
import HelpCenterImportCsvColumnMatchingView from 'pages/settings/helpCenter/components/HelpCenterImportCsvColumnMatchingView'
import HelpCenterPublishAndTrackView from 'pages/settings/helpCenter/components/HelpCenterPublishAndTrackView'
import HelpCenterPreferencesView from 'pages/settings/helpCenter/components/HelpCenterPreferencesView'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {useHelpCenterIdParam} from 'pages/settings/helpCenter/hooks/useHelpCenterIdParam'
import {
    getCurrentHelpCenter,
    helpCentersFetched,
    helpCenterUpdated,
} from 'state/entities/helpCenter/helpCenters'

import {FeatureFlagKey} from 'config/featureFlags'
import CurrentHelpCenterContext from '../../contexts/CurrentHelpCenterContext'
import {EditionManagerContextProvider} from '../EditionManagerContext'
import {SearchContextProvider} from '../SearchContext'
import {HelpCenterTranslationProvider} from '../HelpCenterTranslation'
import {HelpCenterPreferencesSettings} from '../HelpCenterPreferencesSettings'
import {HelpCenterMaintenanceView} from '../../components/HelpCenterMaintenanceView'
import HelpCenterCreationWizard from '../../components/HelpCenterCreationWizard'
import AILibraryView from '../../components/AIArticlesLibraryView'
import {useHasAccessToAILibrary} from '../../components/AIArticlesLibraryView/hooks/useHasAccessToAILibrary'
import {HelpCenterAutomateView} from '../../components/HelpCenterAutomateView'

const CurrentHelpCenter: React.FC = () => {
    const dispatch = useAppDispatch()
    const {path} = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const {client} = useHelpCenterApi()
    const helpCenterId = useHelpCenterIdParam()
    const helpCenter = useAppSelector(getCurrentHelpCenter)
    const viewLanguage = useAppSelector(getViewLanguage)

    const helpCenterCreationWizard =
        useFlags()[FeatureFlagKey.HelpCenterCreationWizard] || false

    const hasAccessToAILibrary = useHasAccessToAILibrary()

    useEffect(() => {
        async function init() {
            if (client && helpCenterId) {
                try {
                    const {data: helpCenter} = await client.getHelpCenter({
                        help_center_id: helpCenterId,
                        fields: ['translations'],
                        with_wizard: true,
                    })

                    dispatch(changeHelpCenterId(helpCenter.id))
                    dispatch(helpCentersFetched([helpCenter]))
                    dispatch(helpCenterUpdated(helpCenter))
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (!helpCenter || !client) {
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
                        <SearchContextProvider helpCenter={helpCenter}>
                            <EditionManagerContextProvider>
                                <HelpCenterArticlesView />
                            </EditionManagerContextProvider>
                        </SearchContextProvider>
                    )}
                />
                {hasAccessToAILibrary && (
                    <Route
                        path={`${path}/ai-library`}
                        exact
                        render={() => (
                            <EditionManagerContextProvider>
                                <AILibraryView />
                            </EditionManagerContextProvider>
                        )}
                    />
                )}
                <Route
                    path={`${path}/appearance`}
                    exact
                    component={HelpCenterAppearanceView}
                />
                <Route
                    path={`${path}/contact`}
                    exact
                    render={() => (
                        <HelpCenterTranslationProvider helpCenter={helpCenter}>
                            <HelpCenterContactView />
                        </HelpCenterTranslationProvider>
                    )}
                />
                <Route
                    path={`${path}/customization`}
                    exact
                    component={HelpCenterCustomizationView}
                />
                <Route
                    path={`${path}/preferences`}
                    exact
                    render={() => (
                        <HelpCenterPreferencesSettings helpCenter={helpCenter}>
                            <HelpCenterPreferencesView />
                        </HelpCenterPreferencesSettings>
                    )}
                />
                <Route
                    path={`${path}/automate`}
                    exact
                    render={() => (
                        <HelpCenterPreferencesSettings helpCenter={helpCenter}>
                            <HelpCenterAutomateView />
                        </HelpCenterPreferencesSettings>
                    )}
                />
                <Route
                    path={[
                        `${path}/publish-track`,
                        `${path}/publish-track/embedments`,
                    ]}
                    exact
                    render={() => (
                        <HelpCenterPreferencesSettings helpCenter={helpCenter}>
                            <HelpCenterPublishAndTrackView />
                        </HelpCenterPreferencesSettings>
                    )}
                />
                <Route
                    path={`${path}/import/csv/column-matching`}
                    component={HelpCenterImportCsvColumnMatchingView}
                />
                <Route
                    path={`${path}/maintenance`}
                    exact
                    component={HelpCenterMaintenanceView}
                />
                {helpCenterCreationWizard && (
                    <Route
                        path={`${path}/new`}
                        exact
                        render={() => (
                            <EditionManagerContextProvider>
                                <HelpCenterCreationWizard
                                    helpCenter={helpCenter}
                                    isUpdate
                                />
                            </EditionManagerContextProvider>
                        )}
                    />
                )}
            </Switch>
        </CurrentHelpCenterContext.Provider>
    )
}

export default CurrentHelpCenter
