import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { UserRole } from 'config/types/user'
import { useFlag } from 'core/flags'
import { integrationsState } from 'fixtures/integrations'
import history from 'pages/history'

import useStoresRequiringScriptTagMigration from '../../ScriptTagMigrationBanner/hooks/useStoresRequiringScriptTagMigration'
import ScriptTagMigrationModal from '../ScriptTagMigrationModal'

jest.mock(
    '../../ScriptTagMigrationBanner/hooks/useStoresRequiringScriptTagMigration',
)

jest.mock('core/flags')
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

const mockStore = configureMockStore([thunk])

const oneHourInMilliseconds = 60 * 60 * 1000

describe('<ScriptTagMigrationModal />', () => {
    it('should show modal if period is over', () => {
        mockUseFlag.mockImplementation((key, defaultValue) => {
            if (key === FeatureFlagKey.ChatScopeUpdateModal) {
                return oneHourInMilliseconds
            }
            if (key === FeatureFlagKey.ChatScopeUpdateDueDate) {
                return 'Scary Deadline'
            }
            return defaultValue
        })

        Storage.prototype.getItem = () =>
            String(new Date().getTime() - 2 * oneHourInMilliseconds)
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: { meta: { shop_name: 'test-shop-name' } },
                    storeRequiresPermissionUpdates: true,
                    gorgiasChatIntegration: undefined,
                    gorgiasChatRequiresReinstall: false,
                },
            ],
        )

        render(
            <Router history={history}>
                <Provider
                    store={mockStore({
                        currentUser: fromJS({ role: { name: UserRole.Admin } }),
                        integrations: fromJS(integrationsState),
                    })}
                >
                    <ScriptTagMigrationModal />
                </Provider>
            </Router>,
        )

        expect(document.body.children).toMatchSnapshot()
    })

    it('should hide modal if period is over but no stores require permission updates', () => {
        mockUseFlag.mockImplementation((key, defaultValue) => {
            if (key === FeatureFlagKey.ChatScopeUpdateModal) {
                return oneHourInMilliseconds
            }
            if (key === FeatureFlagKey.ChatScopeUpdateDueDate) {
                return 'Scary Deadline'
            }
            return defaultValue
        })

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
            ],
        )

        render(
            <Router history={history}>
                <Provider
                    store={mockStore({
                        currentUser: fromJS({ role: { name: UserRole.Admin } }),
                        integrations: fromJS(integrationsState),
                    })}
                >
                    <ScriptTagMigrationModal />
                </Provider>
            </Router>,
        )

        expect(document.body.children).toMatchSnapshot()
    })

    it('should hide modal if period is not over yet', () => {
        mockUseFlag.mockImplementation((key, defaultValue) => {
            if (key === FeatureFlagKey.ChatScopeUpdateModal) {
                return oneHourInMilliseconds
            }
            if (key === FeatureFlagKey.ChatScopeUpdateDueDate) {
                return 'Scary Deadline'
            }
            return defaultValue
        })

        Storage.prototype.getItem = () =>
            String(new Date().getTime() - oneHourInMilliseconds / 2)
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: { meta: { shop_name: 'test-shop-name' } },
                    storeRequiresPermissionUpdates: true,
                    gorgiasChatIntegration: undefined,
                    gorgiasChatRequiresReinstall: false,
                },
            ],
        )

        render(
            <Router history={history}>
                <Provider
                    store={mockStore({
                        currentUser: fromJS({ role: { name: UserRole.Admin } }),
                        integrations: fromJS(integrationsState),
                    })}
                >
                    <ScriptTagMigrationModal />
                </Provider>
            </Router>,
        )

        expect(document.body.children).toMatchSnapshot()
    })
})
