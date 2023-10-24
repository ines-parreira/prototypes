import React from 'react'
import {Provider} from 'react-redux'
import LD from 'launchdarkly-react-client-sdk'
import {fromJS} from 'immutable'

import {render} from '@testing-library/react'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {integrationsState} from 'fixtures/integrations'

import {FeatureFlagKey} from 'config/featureFlags'
import {UserRole} from 'config/types/user'

import ScriptTagMigrationBanner from '../ScriptTagMigrationBanner'

import useStoresRequiringScriptTagMigration from '../hooks/useStoresRequiringScriptTagMigration'

jest.mock('../hooks/useStoresRequiringScriptTagMigration')

const mockStore = configureMockStore([thunk])

jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
    [FeatureFlagKey.ChatScopeReinstallOnShopifyCallback]: true,
    [FeatureFlagKey.ChatScopeUpdateBanner]: true,
    [FeatureFlagKey.ChatScopeUpdateDueDate]: 'Scary Deadline',
}))

describe('<ScriptTagMigrationBanner />', () => {
    it('should contain only re-install link for a single store', () => {
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: {meta: {shop_name: 'test-shop-name'}},
                    storeRequiresPermissionUpdates: false,
                    gorgiasChatIntegration: fromJS({id: 'test-chat-id'}),
                    gorgiasChatRequiresReinstall: true,
                },
            ]
        )

        const {container} = render(
            <Provider
                store={mockStore({
                    currentUser: fromJS({role: {name: UserRole.Admin}}),
                    integrations: fromJS(integrationsState),
                })}
            >
                <ScriptTagMigrationBanner />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should contain only permission update link for a single store', () => {
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: {meta: {shop_name: 'test-shop-name'}},
                    storeRequiresPermissionUpdates: true,
                    gorgiasChatIntegration: fromJS({id: 'test-chat-id'}),
                    gorgiasChatRequiresReinstall: false,
                },
            ]
        )

        const {container} = render(
            <Provider
                store={mockStore({
                    currentUser: fromJS({role: {name: UserRole.Admin}}),
                    integrations: fromJS(integrationsState),
                })}
            >
                <ScriptTagMigrationBanner />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should contain both re-install and permission update link for a single store', () => {
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: {meta: {shop_name: 'test-shop-name'}},
                    storeRequiresPermissionUpdates: true,
                    gorgiasChatIntegration: fromJS({id: 'test-chat-id'}),
                    gorgiasChatRequiresReinstall: true,
                },
            ]
        )

        const {container} = render(
            <Provider
                store={mockStore({
                    currentUser: fromJS({role: {name: UserRole.Admin}}),
                    integrations: fromJS(integrationsState),
                })}
            >
                <ScriptTagMigrationBanner />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should contain only re-install link for multiple stores', () => {
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: {meta: {shop_name: 'test-shop-name'}},
                    storeRequiresPermissionUpdates: false,
                    gorgiasChatIntegration: fromJS({id: 'test-chat-id'}),
                    gorgiasChatRequiresReinstall: true,
                },
                {
                    storeIntegration: {meta: {shop_name: 'test-shop-name'}},
                    storeRequiresPermissionUpdates: false,
                    gorgiasChatIntegration: fromJS({id: 'test-chat-id'}),
                    gorgiasChatRequiresReinstall: true,
                },
            ]
        )

        const {container} = render(
            <Provider
                store={mockStore({
                    currentUser: fromJS({role: {name: UserRole.Admin}}),
                    integrations: fromJS(integrationsState),
                })}
            >
                <ScriptTagMigrationBanner />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should contain only permission update link for multiple stores', () => {
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: {meta: {shop_name: 'test-shop-name'}},
                    storeRequiresPermissionUpdates: true,
                    gorgiasChatIntegration: fromJS({id: 'test-chat-id'}),
                    gorgiasChatRequiresReinstall: false,
                },
                {
                    storeIntegration: {meta: {shop_name: 'test-shop-name'}},
                    storeRequiresPermissionUpdates: true,
                    gorgiasChatIntegration: fromJS({id: 'test-chat-id'}),
                    gorgiasChatRequiresReinstall: false,
                },
            ]
        )

        const {container} = render(
            <Provider
                store={mockStore({
                    currentUser: fromJS({role: {name: UserRole.Admin}}),
                    integrations: fromJS(integrationsState),
                })}
            >
                <ScriptTagMigrationBanner />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should contain re-install link for a single store and permission update link for multiple stores', () => {
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: {meta: {shop_name: 'test-shop-name'}},
                    storeRequiresPermissionUpdates: true,
                    gorgiasChatIntegration: fromJS({id: 'test-chat-id'}),
                    gorgiasChatRequiresReinstall: true,
                },
                {
                    storeIntegration: {meta: {shop_name: 'test-shop-name'}},
                    storeRequiresPermissionUpdates: true,
                    gorgiasChatIntegration: fromJS({id: 'test-chat-id'}),
                    gorgiasChatRequiresReinstall: false,
                },
            ]
        )

        const {container} = render(
            <Provider
                store={mockStore({
                    currentUser: fromJS({role: {name: UserRole.Admin}}),
                    integrations: fromJS(integrationsState),
                })}
            >
                <ScriptTagMigrationBanner />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should contain re-install link for multiple stores and permission update link for a single store', () => {
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: {meta: {shop_name: 'test-shop-name'}},
                    storeRequiresPermissionUpdates: true,
                    gorgiasChatIntegration: fromJS({id: 'test-chat-id'}),
                    gorgiasChatRequiresReinstall: true,
                },
                {
                    storeIntegration: {meta: {shop_name: 'test-shop-name'}},
                    storeRequiresPermissionUpdates: false,
                    gorgiasChatIntegration: fromJS({id: 'test-chat-id'}),
                    gorgiasChatRequiresReinstall: true,
                },
            ]
        )

        const {container} = render(
            <Provider
                store={mockStore({
                    currentUser: fromJS({role: {name: UserRole.Admin}}),
                    integrations: fromJS(integrationsState),
                })}
            >
                <ScriptTagMigrationBanner />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })
})
