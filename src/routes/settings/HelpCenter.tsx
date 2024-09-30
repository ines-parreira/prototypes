import React from 'react'

import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'common/flags'
import {HelpCenterApiClientProvider} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {MigrationApiClientProvider} from 'pages/settings/helpCenter/hooks/useMigrationApi'
import {SupportedLocalesProvider} from 'pages/settings/helpCenter/providers/SupportedLocales'

import HelpCenterCreationWizard from 'pages/settings/helpCenter/components/HelpCenterCreationWizard'
import HelpCenterNewView from 'pages/settings/helpCenter/components/HelpCenterNewView'
import HelpCenterStartView from 'pages/settings/helpCenter/components/HelpCenterStartView'
import CurrentHelpCenter from 'pages/settings/helpCenter/providers/CurrentHelpCenter/CurrentHelpCenter'

import {renderAppSettings} from './helpers/settingsRenderer'

export function HelpCenter() {
    const {path} = useRouteMatch()
    const isHelpCenterCreationWizardEnabled: boolean = useFlag(
        FeatureFlagKey.HelpCenterCreationWizard,
        false
    )
    return (
        <HelpCenterApiClientProvider>
            <MigrationApiClientProvider>
                <SupportedLocalesProvider>
                    <Switch>
                        <Route
                            path={[
                                `${path}/`,
                                `${path}/about`,
                                `${path}/manage`,
                            ]}
                            exact
                        >
                            {renderAppSettings(HelpCenterStartView)}
                        </Route>

                        <Route path={`${path}/new`} exact>
                            {renderAppSettings(
                                isHelpCenterCreationWizardEnabled
                                    ? HelpCenterCreationWizard
                                    : HelpCenterNewView
                            )}
                        </Route>

                        <Route path={`${path}/:helpCenterId`}>
                            {renderAppSettings(CurrentHelpCenter)}
                        </Route>
                    </Switch>
                </SupportedLocalesProvider>
            </MigrationApiClientProvider>
        </HelpCenterApiClientProvider>
    )
}
