import React from 'react'
import {createMemoryHistory} from 'history'
import {screen} from '@testing-library/react'

import {renderWithRouter} from 'utils/testing'
import {
    useGetActionsApp,
    useGetStoreApps,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'

import {useAiAgentEnabled} from 'pages/automate/aiAgent/hooks/useAiAgentEnabled'
import useGetActionAppIntegration from '../hooks/useGetActionAppIntegration'
import useAddStoreApp from '../hooks/useAddStoreApp'
import useUpsertAction from '../hooks/useUpsertAction'
import useDeleteAction from '../hooks/useDeleteAction'
import useGetAppImageUrl from '../hooks/useGetAppImageUrl'

import CreateActionFormView from '../CreateActionFormView'

jest.mock('models/workflows/queries')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('../hooks/useGetActionAppIntegration')
jest.mock('../hooks/useAddStoreApp')
jest.mock('../hooks/useUpsertAction')
jest.mock('../hooks/useDeleteAction')
jest.mock('../hooks/useGetAppImageUrl')
jest.mock('common/flags', () => ({
    useFlag: jest.fn(),
}))
jest.mock('pages/automate/aiAgent/hooks/useAiAgentEnabled')

const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates
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
                        instructions: '',
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
} as unknown as ReturnType<typeof useApps>)

describe('<CreateActionFormView />', () => {
    beforeEach(() => {
        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })
    })
    it('should render template action form with prefilled API key', () => {
        const history = createMemoryHistory()

        history.push('/shopify/acme/ai-agent/actions/new?template_id=testid1', {
            app_id: 'someid',
            api_key: 'test api key',
        })

        const replaceStateSpy = jest.spyOn(globalThis.history, 'replaceState')

        renderWithRouter(<CreateActionFormView />, {
            history,
            path: '/:shopType/:shopName/ai-agent/actions/new',
            route: '/shopify/acme/ai-agent/actions/new?template_id=testid1',
        })

        expect(screen.queryByText('Action details')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Connect 3rd party app')
        ).not.toBeInTheDocument()
        expect(replaceStateSpy).toHaveBeenCalledWith(null, '')
    })
})
