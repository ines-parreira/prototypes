import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import LD from 'launchdarkly-react-client-sdk'
import React from 'react'
import {Provider} from 'react-redux'
import {Router} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'
import {UserRole} from 'config/types/user'
import {integrationsState} from 'fixtures/integrations'
import history from 'pages/history'

import useStoresRequiringScriptTagMigration from '../../ScriptTagMigrationBanner/hooks/useStoresRequiringScriptTagMigration'

import ScriptTagMigrationModal from '../ScriptTagMigrationModal'

jest.mock(
    '../../ScriptTagMigrationBanner/hooks/useStoresRequiringScriptTagMigration'
)

const mockStore = configureMockStore([thunk])

const oneHourInMilliseconds = 60 * 60 * 1000

describe('<ScriptTagMigrationModal />', () => {
    it('should show modal if period is over', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ChatScopeUpdateModal]: oneHourInMilliseconds,
            [FeatureFlagKey.ChatScopeUpdateDueDate]: 'Scary Deadline',
        }))

        Storage.prototype.getItem = () =>
            String(new Date().getTime() - 2 * oneHourInMilliseconds)
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: {meta: {shop_name: 'test-shop-name'}},
                    storeRequiresPermissionUpdates: true,
                    gorgiasChatIntegration: undefined,
                    gorgiasChatRequiresReinstall: false,
                },
            ]
        )

        render(
            <Router history={history}>
                <Provider
                    store={mockStore({
                        currentUser: fromJS({role: {name: UserRole.Admin}}),
                        integrations: fromJS(integrationsState),
                    })}
                >
                    <ScriptTagMigrationModal />
                </Provider>
            </Router>
        )

        expect(document.body.children).toMatchSnapshot()
    })

    it('should hide modal if period is over but no stores require permission updates', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ChatScopeUpdateModal]: oneHourInMilliseconds,
            [FeatureFlagKey.ChatScopeUpdateDueDate]: 'Scary Deadline',
        }))

        Storage.prototype.getItem = () =>
            String(new Date().getTime() - 2 * oneHourInMilliseconds)
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: undefined,
                    storeRequiresPermissionUpdates: false,
                    gorgiasChatIntegration: undefined,
                    gorgiasChatRequiresReinstall: false,
                },
            ]
        )

        render(
            <Router history={history}>
                <Provider
                    store={mockStore({
                        currentUser: fromJS({role: {name: UserRole.Admin}}),
                        integrations: fromJS(integrationsState),
                    })}
                >
                    <ScriptTagMigrationModal />
                </Provider>
            </Router>
        )

        expect(document.body.children).toMatchSnapshot()
    })

    it('should hide modal if period is not over yet', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ChatScopeUpdateModal]: oneHourInMilliseconds,
            [FeatureFlagKey.ChatScopeUpdateDueDate]: 'Scary Deadline',
        }))

        Storage.prototype.getItem = () =>
            String(new Date().getTime() - oneHourInMilliseconds / 2)
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: {meta: {shop_name: 'test-shop-name'}},
                    storeRequiresPermissionUpdates: true,
                    gorgiasChatIntegration: undefined,
                    gorgiasChatRequiresReinstall: false,
                },
            ]
        )

        render(
            <Router history={history}>
                <Provider
                    store={mockStore({
                        currentUser: fromJS({role: {name: UserRole.Admin}}),
                        integrations: fromJS(integrationsState),
                    })}
                >
                    <ScriptTagMigrationModal />
                </Provider>
            </Router>
        )

        expect(document.body.children).toMatchSnapshot()
    })
})
