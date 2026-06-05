import { render } from '@repo/testing'

// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { useFlag } from '@repo/feature-flags'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Route } from 'react-router'
import { useLocation } from 'react-router-dom'

import { billingState } from 'fixtures/billing'
import { defaultUseAiAgentOnboardingNotification } from 'fixtures/onboardingStateNotification'
import { useFindAllGuidancesKnowledgeResources } from 'models/knowledgeService/queries'
import {
    useDownloadWorkflowConfigurationStepLogs,
    useGetStoreApps,
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
} from 'models/workflows/queries'
import useAddStoreApp from 'pages/aiAgent/actions/hooks/useAddStoreApp'
import useThreeplIntegrations from 'pages/aiAgent/actions/hooks/useThreeplIntegrations'
import useUpsertAction from 'pages/aiAgent/actions/hooks/useUpsertAction'
import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import * as serverValidationErrors from 'pages/automate/workflows/utils/serverValidationErrors'
import type { RootState } from 'state/types'

import ActionCreateWizardView from './ActionCreateWizardView'

jest.mock('models/workflows/queries')
jest.mock('models/knowledgeService/queries')
jest.mock('pages/aiAgent/actions/hooks/useUpsertAction')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('pages/aiAgent/hooks/useAiAgentEnabled')
jest.mock('pages/aiAgent/actions/hooks/useAddStoreApp')
jest.mock('pages/aiAgent/actions/hooks/useThreeplIntegrations')
jest.mock('@repo/feature-flags')
jest.mock('pages/automate/workflows/utils/serverValidationErrors')
jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification', () => ({
    useAiAgentOnboardingNotification: jest.fn(),
}))

const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)
const mockUseUpsertAction = jest.mocked(useUpsertAction)
const mockUseApps = jest.mocked(useApps)
const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)
const mockUseGetStoreApps = jest.mocked(useGetStoreApps)
const mockUse3plIntegrations = jest.mocked(useThreeplIntegrations)
const mockUseAddStoreApp = jest.mocked(useAddStoreApp)
const mockUseDownloadWorkflowConfigurationStepLogs = jest.mocked(
    useDownloadWorkflowConfigurationStepLogs,
)
const mockUseFlag = jest.mocked(useFlag)
const mockUseGetStoreWorkflowsConfigurations = jest.mocked(
    useGetStoreWorkflowsConfigurations,
)
const mockUseListActionsApps = jest.mocked(useListActionsApps)
const mockUseAiAgentOnboardingNotification = jest.mocked(
    useAiAgentOnboardingNotification,
)
const mockUseFindAllGuidancesKnowledgeResources = jest.mocked(
    useFindAllGuidancesKnowledgeResources,
)
const mockServerValidationErrors = jest.mocked(serverValidationErrors)

const LocationPath = () => {
    const location = useLocation()
    return <div>{location.pathname}</div>
}

const wizardPath = '/app/ai-agent/:shopType/:shopName/actions/new'
const wizardEntry = '/app/ai-agent/shopify/shopify-store/actions/new'

const defaultStoreState = {
    billing: fromJS(billingState),
    integrations: fromJS({ integrations: [] }),
} as RootState

const wizardRoute = (
    <>
        <Route path={wizardPath}>
            <ActionCreateWizardView />
        </Route>
        <LocationPath />
    </>
)

const renderWizard = () =>
    render(wizardRoute, {
        initialEntries: [wizardEntry],
        storeState: defaultStoreState,
    })

describe('<ActionCreateWizardView />', () => {
    beforeEach(() => {
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)
        mockUseApps.mockReturnValue({
            isLoading: false,
            apps: [],
            actionsApps: [],
        })
        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })
        mockUseGetStoreApps.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetStoreApps>)
        mockUseAddStoreApp.mockReturnValue(jest.fn())
        mockUseDownloadWorkflowConfigurationStepLogs.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
        } as unknown as ReturnType<
            typeof useDownloadWorkflowConfigurationStepLogs
        >)
        mockUseFlag.mockReturnValue(true)
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useGetStoreWorkflowsConfigurations>)
        mockUse3plIntegrations.mockReturnValue([])
        mockUseListActionsApps.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useListActionsApps>)
        mockUseAiAgentOnboardingNotification.mockReturnValue(
            defaultUseAiAgentOnboardingNotification,
        )
        mockUseFindAllGuidancesKnowledgeResources.mockReturnValue({
            data: {},
        } as unknown as ReturnType<
            typeof useFindAllGuidancesKnowledgeResources
        >)
        mockServerValidationErrors.mapServerErrorsToGraph = jest
            .fn()
            .mockReturnValue(null)
    })

    it('renders Step 1 with Setup heading and disabled Continue button', () => {
        renderWizard()

        expect(
            screen.getByRole('heading', { name: 'Create action' }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Provide a clear, unique name/i),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Describe what this action does/i),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /Set conditions that must be met for this action to run/i,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Continue' }),
        ).toBeAriaDisabled()
    })

    it('enables Continue once name and description are filled, then advances to Step 2', async () => {
        const user = userEvent.setup()
        renderWizard()

        await user.type(
            screen.getByRole('textbox', { name: /Action name/i }),
            'Returns',
        )
        await user.type(
            screen.getByRole('textbox', { name: /Description/i }),
            'Get order info from Shopify.',
        )

        const continueButton = screen.getByRole('button', { name: 'Continue' })
        expect(continueButton).not.toBeAriaDisabled()

        await user.click(continueButton)

        expect(
            screen.getByText(/Add one or more steps with your 3rd party apps/i),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Save and enable' }),
        ).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    })

    it('Back from Step 2 preserves Step 1 edits', async () => {
        const user = userEvent.setup()
        renderWizard()

        await user.type(
            screen.getByRole('textbox', { name: /Action name/i }),
            'Returns',
        )
        await user.type(
            screen.getByRole('textbox', { name: /Description/i }),
            'Get order info from Shopify.',
        )
        await user.click(screen.getByRole('button', { name: 'Continue' }))
        await user.click(screen.getByRole('button', { name: 'Back' }))

        expect(
            screen.getByRole('textbox', { name: /Action name/i }),
        ).toHaveValue('Returns')
        expect(
            screen.getByRole('textbox', { name: /Description/i }),
        ).toHaveValue('Get order info from Shopify.')
    })

    it('redirects to actions list after Save and enable success', async () => {
        const user = userEvent.setup()
        const mutateAsync = jest.fn().mockResolvedValue(undefined)
        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        const { rerender } = renderWizard()

        await user.type(
            screen.getByRole('textbox', { name: /Action name/i }),
            'Returns',
        )
        await user.type(
            screen.getByRole('textbox', { name: /Description/i }),
            'Get order info from Shopify.',
        )
        await user.click(screen.getByRole('button', { name: 'Continue' }))
        await user.click(
            screen.getByRole('button', { name: 'Save and enable' }),
        )

        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync,
            isSuccess: true,
        } as unknown as ReturnType<typeof useUpsertAction>)
        rerender(wizardRoute)

        expect(
            screen.getByText('/app/ai-agent/shopify/shopify-store/actions'),
        ).toBeInTheDocument()
    })

    it('keeps Continue disabled and the wizard on Step 1 when fields are empty', async () => {
        const user = userEvent.setup()
        renderWizard()

        const continueButton = screen.getByRole('button', { name: 'Continue' })
        expect(continueButton).toBeAriaDisabled()

        await user.click(continueButton)

        expect(
            screen.getByRole('heading', { name: 'Create action' }),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(
                /Add one or more steps with your 3rd party apps/i,
            ),
        ).not.toBeInTheDocument()
    })

    it('does not advance to Step 2 when only the name is filled', async () => {
        const user = userEvent.setup()
        renderWizard()

        await user.type(
            screen.getByRole('textbox', { name: /Action name/i }),
            'Returns',
        )

        const continueButton = screen.getByRole('button', { name: 'Continue' })
        expect(continueButton).toBeAriaDisabled()

        await user.click(continueButton)

        expect(
            screen.queryByText(
                /Add one or more steps with your 3rd party apps/i,
            ),
        ).not.toBeInTheDocument()
    })

    it('updates the page heading on Step 2 with the entered action name', async () => {
        const user = userEvent.setup()
        renderWizard()

        await user.type(
            screen.getByRole('textbox', { name: /Action name/i }),
            'Refund order',
        )
        await user.type(
            screen.getByRole('textbox', { name: /Description/i }),
            'Issue a refund.',
        )
        await user.click(screen.getByRole('button', { name: 'Continue' }))

        expect(
            screen.getByRole('heading', { name: 'Refund order' }),
        ).toBeInTheDocument()
    })

    it('shows the action steps card and Add step trigger on Step 2', async () => {
        const user = userEvent.setup()
        renderWizard()

        await user.type(
            screen.getByRole('textbox', { name: /Action name/i }),
            'Returns',
        )
        await user.type(
            screen.getByRole('textbox', { name: /Description/i }),
            'Get order info from Shopify.',
        )
        await user.click(screen.getByRole('button', { name: 'Continue' }))

        expect(
            screen.getByText(/Add one or more steps with your 3rd party apps/i),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Add step/i }),
        ).toBeInTheDocument()
    })
})
