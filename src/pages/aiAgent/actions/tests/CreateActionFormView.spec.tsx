import {screen, waitFor} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import React from 'react'

import {Provider} from 'react-redux'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {shopifyIntegration} from 'fixtures/integrations'
import {
    useGetActionsApp,
    useGetStoreApps,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'
import {useAiAgentEnabled} from 'pages/aiAgent/hooks/useAiAgentEnabled'
import {useAiAgentOnboardingNotification} from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'

import CreateActionFormView from '../CreateActionFormView'
import useAddStoreApp from '../hooks/useAddStoreApp'
import useDeleteAction from '../hooks/useDeleteAction'
import useGetActionAppIntegration from '../hooks/useGetActionAppIntegration'
import useGetAppImageUrl from '../hooks/useGetAppImageUrl'
import useUpsertAction from '../hooks/useUpsertAction'

jest.mock('models/workflows/queries')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('../hooks/useGetActionAppIntegration')
jest.mock('../hooks/useAddStoreApp')
jest.mock('../hooks/useUpsertAction')
jest.mock('../hooks/useDeleteAction')
jest.mock('../hooks/useGetAppImageUrl')
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
jest.mock('pages/aiAgent/hooks/useAiAgentEnabled')

jest.mock('pages/aiAgent/hooks/useAccountStoreConfiguration', () => ({
    useAccountStoreConfiguration: () => ({
        aiAgentTicketViewId: 1,
    }),
}))
jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification', () => ({
    useAiAgentOnboardingNotification: jest.fn(),
}))

const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates
)
const mockUseAiAgentOnboardingNotification = jest.mocked(
    useAiAgentOnboardingNotification
)
const mockUseGetActionsApp = jest.mocked(useGetActionsApp)
const mockUseGetActionAppIntegration = jest.mocked(useGetActionAppIntegration)
const mockUseGetStoreApps = jest.mocked(useGetStoreApps)
const mockUseAddStoreApp = jest.mocked(useAddStoreApp)
const mockUseUpsertAction = jest.mocked(useUpsertAction)
const mockUseDeleteAction = jest.mocked(useDeleteAction)
const mockUseGetAppImageUrl = jest.mocked(useGetAppImageUrl)
const mockUseApps = jest.mocked(useApps)
const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)
mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
    data: [
        {
            id: 'testid1',
            internal_id: 'testinternal_id1',
            name: 'test1',
            apps: [
                {
                    type: 'app',
                    app_id: 'someid',
                },
            ],
            triggers: [
                {
                    kind: 'llm-prompt',
                    settings: {
                        custom_inputs: [],
                        object_inputs: [],
                        outputs: [],
                    },
                },
            ],
            entrypoints: [
                {
                    kind: 'llm-conversation',
                    trigger: 'llm-prompt',
                    settings: {
                        instructions: 'test instructions',
                        requires_confirmation: true,
                    },
                },
            ],
        },
        {
            id: 'testid2',
            internal_id: 'testinternal_id2',
            name: 'test2',
            apps: [
                {
                    type: 'shopify',
                },
            ],
            triggers: [
                {
                    kind: 'llm-prompt',
                    settings: {
                        custom_inputs: [],
                        object_inputs: [],
                        outputs: [],
                    },
                },
            ],
            entrypoints: [
                {
                    kind: 'llm-conversation',
                    trigger: 'llm-prompt',
                    settings: {
                        instructions: 'test instructions',
                        requires_confirmation: true,
                    },
                },
            ],
        },
    ],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
mockUseGetActionsApp.mockReturnValue({
    data: {
        id: 'someid',
        auth_type: 'api-key',
        auth_settings: {
            url: 'https://example.com',
        },
    },
} as unknown as ReturnType<typeof useGetActionsApp>)
mockUseGetActionAppIntegration.mockReturnValue(undefined)
mockUseGetStoreApps.mockReturnValue({
    data: [],
    isInitialLoading: false,
} as unknown as ReturnType<typeof mockUseGetStoreApps>)
mockUseAddStoreApp.mockReturnValue(jest.fn())
mockUseUpsertAction.mockReturnValue({
    mutateAsync: jest.fn(),
    isLoading: false,
    isSuccess: false,
} as unknown as ReturnType<typeof useUpsertAction>)
mockUseUpsertAction.mockReturnValue({
    mutateAsync: jest.fn(),
    isLoading: false,
    isSuccess: false,
} as unknown as ReturnType<typeof useUpsertAction>)
mockUseDeleteAction.mockReturnValue({
    mutate: jest.fn(),
    isLoading: false,
    isSuccess: false,
} as unknown as ReturnType<typeof useDeleteAction>)
mockUseGetAppImageUrl.mockReturnValue('https://example.com/app.png')
mockUseApps.mockReturnValue({
    apps: [],
    actionsApps: [],
} as unknown as ReturnType<typeof useApps>)
mockUseEnableAiAgent.mockReturnValue({
    updateSettingsAfterAiAgentEnabled: jest.fn(),
})
mockUseAiAgentOnboardingNotification.mockReturnValue({
    isAdmin: true,
    onboardingNotificationState: undefined,
    handleOnSave: jest.fn(),
    handleOnSendOrCancelNotification: jest.fn(),
    handleOnEnablementPostReceivedNotification: jest.fn(),
    handleOnPerformActionPostReceivedNotification: jest.fn(),
    handleOnTriggerActivateAiAgentNotification: jest.fn(),
    handleOnCancelActivateAiAgentNotification: jest.fn(),
    isLoading: false,
    isAiAgentOnboardingNotificationEnabled: true,
})

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])()
describe('<CreateActionFormView />', () => {
    it('should render template action form with prefilled API key', () => {
        const history = createMemoryHistory()

        history.push('/shopify/acme/ai-agent/actions/new?template_id=testid1', {
            app_id: 'someid',
            api_key: 'test api key',
        })

        const replaceStateSpy = jest.spyOn(globalThis.history, 'replaceState')

        renderWithRouter(
            <Provider store={mockStore}>
                <CreateActionFormView />
            </Provider>,
            {
                history,
                path: '/:shopType/:shopName/ai-agent/actions/new',
                route: '/shopify/acme/ai-agent/actions/new?template_id=testid1',
            }
        )

        expect(screen.queryByText('Action details')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Connect 3rd party app')
        ).not.toBeInTheDocument()
        expect(replaceStateSpy).toHaveBeenCalledWith(null, '')
    })

    it('should render template action form', async () => {
        mockUseGetActionAppIntegration.mockReturnValue(shopifyIntegration)

        renderWithRouter(
            <Provider store={mockStore}>
                <CreateActionFormView />
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/new',
                route: '/shopify/shopify-store/ai-agent/actions/new?template_id=testid2',
            }
        )

        expect(screen.getByDisplayValue('test2')).toBeInTheDocument()
        expect(
            screen.getByDisplayValue('test instructions')
        ).toBeInTheDocument()
        expect(
            screen.getByLabelText('No conditions required', {selector: 'input'})
        ).toBeChecked()

        await waitFor(() => {
            expect(
                screen.getByRole('button', {name: 'Create Action'})
            ).toBeAriaEnabled()
        })
    })
})
