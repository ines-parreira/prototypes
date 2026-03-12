import type React from 'react'
import { useEffect } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { isAxiosError } from 'axios'
import {
    Route,
    Switch,
    useHistory,
    useLocation,
    useRouteMatch,
} from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Loader from 'pages/common/components/Loader/Loader'
import HelpCenterAppearanceView from 'pages/settings/helpCenter/components/HelpCenterAppearanceView/HelpCenterAppearanceView'
import HelpCenterArticlesView from 'pages/settings/helpCenter/components/HelpCenterArticlesView'
import HelpCenterContactView from 'pages/settings/helpCenter/components/HelpCenterContactView'
import HelpCenterCustomizationView from 'pages/settings/helpCenter/components/HelpCenterCustomizationView'
import HelpCenterImportCsvColumnMatchingView from 'pages/settings/helpCenter/components/HelpCenterImportCsvColumnMatchingView'
import HelpCenterPreferencesView from 'pages/settings/helpCenter/components/HelpCenterPreferencesView'
import HelpCenterPublishAndTrackView from 'pages/settings/helpCenter/components/HelpCenterPublishAndTrackView'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { useHelpCenterIdParam } from 'pages/settings/helpCenter/hooks/useHelpCenterIdParam'
import settingsCss from 'pages/settings/settings.less'
import {
    getCurrentHelpCenter,
    helpCentersFetched,
    helpCenterUpdated,
} from 'state/entities/helpCenter/helpCenters'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import {
    changeHelpCenterId,
    changeViewLanguage,
    getViewLanguage,
} from 'state/ui/helpCenter'

import AILibraryView from '../../components/AIArticlesLibraryView'
import { useHasAccessToAILibrary } from '../../components/AIArticlesLibraryView/hooks/useHasAccessToAILibrary'
import { HelpCenterAutomateView } from '../../components/HelpCenterAutomateView'
import HelpCenterCreationWizard from '../../components/HelpCenterCreationWizard'
import { HelpCenterMaintenanceView } from '../../components/HelpCenterMaintenanceView'
import CurrentHelpCenterContext from '../../contexts/CurrentHelpCenterContext'
import { EditionManagerContextProvider } from '../EditionManagerContext'
import { HelpCenterPreferencesSettings } from '../HelpCenterPreferencesSettings'
import { HelpCenterTranslationProvider } from '../HelpCenterTranslation'
import { SearchContextProvider } from '../SearchContext'

const CurrentHelpCenter: React.FC = () => {
    const dispatch = useAppDispatch()
    const { path } = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const { client } = useHelpCenterApi()
    const helpCenterId = useHelpCenterIdParam()
    const helpCenter = useAppSelector(getCurrentHelpCenter)
    const viewLanguage = useAppSelector(getViewLanguage)

    const helpCenterCreationWizard = useFlag(
        FeatureFlagKey.HelpCenterCreationWizard,
    )

    const hasAccessToAILibrary = useHasAccessToAILibrary()

    useEffect(() => {
        async function init() {
            if (client && helpCenterId) {
                try {
                    const { data: helpCenter } = await client.getHelpCenter({
                        help_center_id: helpCenterId,
                        fields: ['translations'],
                        with_wizard: true,
                    })

                    dispatch(changeHelpCenterId(helpCenter.id))
                    dispatch(helpCentersFetched([helpCenter]))
                    dispatch(helpCenterUpdated(helpCenter))
                } catch (err) {
                    const errorMessage =
                        isAxiosError(err) && err.response?.status === 400
                            ? 'Help Center not found'
                            : 'Something went wrong'

                    void dispatch(
                        notify({
                            message: errorMessage,
                            status: NotificationStatus.Error,
                        }),
                    )

                    history.push(
                        location.pathname.split(helpCenterId.toString())[0],
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
        // Always sync Redux state with URL parameter to prevent stale help center ID
        if (helpCenterId && helpCenter?.id !== helpCenterId) {
            dispatch(changeHelpCenterId(helpCenterId))
        }

        if (!viewLanguage && helpCenter) {
            dispatch(changeViewLanguage(helpCenter.default_locale))
        }
    }, [helpCenter, viewLanguage, helpCenterId, dispatch])

    if (!helpCenter || !client) {
        return (
            <div className={settingsCss.pageContainer}>
                <Loader />
            </div>
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
