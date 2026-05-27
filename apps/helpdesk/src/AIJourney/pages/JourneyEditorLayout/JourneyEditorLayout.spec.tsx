import { render } from '@repo/testing'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { JourneyStatusEnum } from '@gorgias/convert-client'

import { JOURNEY_TYPES } from 'AIJourney/constants'

import { JourneyEditorLayout } from './JourneyEditorLayout'

jest.mock('./PreviewPanel', () => ({
    PreviewPanel: ({ onClose }: { onClose: () => void }) => (
        <div>
            <span>Preview panel content</span>
            <button onClick={onClose}>Close preview panel</button>
        </div>
    ),
}))

jest.mock('pages/common/hooks/useCollapsibleColumn', () => ({
    useCollapsibleColumn: jest.fn(() => ({
        isCollapsibleColumnOpen: false,
        setIsCollapsibleColumnOpen: jest.fn(),
    })),
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(
        (key: string) => key === 'ai-journey-v3-architecture-enabled',
    ),
    useFlagWithLoading: jest.fn(() => ({ value: false, isLoading: false })),
}))

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

jest.mock('AIJourney/hooks', () => ({
    ...jest.requireActual('AIJourney/hooks'),
    useJourneyCreateHandler: jest.fn(() => ({
        handleCreate: jest.fn().mockResolvedValue({ id: 'new-123' }),
        isLoading: false,
    })),
    useJourneyUpdateHandler: jest.fn(() => ({
        handleUpdate: jest.fn().mockResolvedValue({}),
        isLoading: false,
    })),
}))

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

describe('<JourneyEditorLayout /> — Campaign mode (isCampaign = true)', () => {
    const mockStore = configureMockStore([thunk])()

    const renderComponent = () =>
        render(
            <Provider store={mockStore}>
                <JourneyEditorLayout step="setup" />
            </Provider>,
        )

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1, name: 'Test Store' },
            journeyData: undefined,
            journeyType: JOURNEY_TYPES.CAMPAIGN,
            shopName: 'test-store',
        })
    })

    it('should display "Create new campaign" when there is no journeyData.campaign.title', () => {
        renderComponent()

        expect(screen.getByText('Create new campaign')).toBeInTheDocument()
    })

    it('should display the campaign title from journeyData.campaign.title', () => {
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1, name: 'Test Store' },
            journeyData: {
                id: 'journey-123',
                campaign: { title: 'My Summer Campaign' },
            },
            journeyType: JOURNEY_TYPES.CAMPAIGN,
            shopName: 'test-store',
        })

        renderComponent()

        expect(
            screen.getByDisplayValue('My Summer Campaign'),
        ).toBeInTheDocument()
    })

    it('should render the "Schedule" button (disabled)', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /schedule/i }),
        ).toBeInTheDocument()
    })

    it('should not render the "Enable" or "Pause" button', () => {
        renderComponent()

        expect(
            screen.queryByRole('button', { name: /enable/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /pause/i }),
        ).not.toBeInTheDocument()
    })

    it('should render the "Back to campaigns" button', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /back to campaigns/i }),
        ).toBeInTheDocument()
    })

    it('should call handleCreate when clicking "Save changes" with no journeyData.id', async () => {
        const mockHandleCreate = jest.fn().mockResolvedValue({ id: 'new-123' })
        const mockUseJourneyCreateHandler = require('AIJourney/hooks')
            .useJourneyCreateHandler as jest.Mock
        mockUseJourneyCreateHandler.mockReturnValue({
            handleCreate: mockHandleCreate,
            isLoading: false,
        })

        const user = userEvent.setup()
        renderComponent()

        await user.type(
            screen.getByRole('textbox', { name: /campaign title/i }),
            'New Campaign',
        )
        await user.type(
            screen.getByPlaceholderText(/describe tone/i),
            'Test instructions',
        )
        await user.click(screen.getByRole('button', { name: /save changes/i }))

        expect(mockHandleCreate).toHaveBeenCalled()
    })

    it('should call handleUpdate when clicking "Save changes" with journeyData.id', async () => {
        const mockHandleUpdate = jest.fn().mockResolvedValue({})
        const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
            .useJourneyUpdateHandler as jest.Mock
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
        })

        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1, name: 'Test Store' },
            journeyData: {
                id: 'journey-123',
                campaign: { title: 'Existing Campaign' },
                message_instructions: 'Existing instructions',
            },
            journeyType: JOURNEY_TYPES.CAMPAIGN,
            shopName: 'test-store',
        })

        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /save changes/i }))

        expect(mockHandleUpdate).toHaveBeenCalled()
    })

    it('should show a success toast after the save completes', async () => {
        const mockHandleUpdate = jest.fn().mockResolvedValue({})
        const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
            .useJourneyUpdateHandler as jest.Mock
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
        })
        const toastSuccessSpy = jest.spyOn(
            require('@gorgias/axiom').toast,
            'success',
        )

        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1, name: 'Test Store' },
            journeyData: {
                id: 'journey-123',
                campaign: { title: 'Existing Campaign' },
                message_instructions: 'Existing instructions',
            },
            journeyType: JOURNEY_TYPES.CAMPAIGN,
            shopName: 'test-store',
        })

        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /save changes/i }))

        await waitFor(() => {
            expect(toastSuccessSpy).toHaveBeenCalledWith(
                'Changes saved successfully',
            )
        })

        toastSuccessSpy.mockRestore()
    })

    it('should send an empty uploadedImageAttachment when the include-custom-image toggle is off on save', async () => {
        const mockHandleUpdate = jest.fn().mockResolvedValue({})
        const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
            .useJourneyUpdateHandler as jest.Mock
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
        })

        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1, name: 'Test Store' },
            journeyData: {
                id: 'journey-123',
                campaign: { title: 'Existing Campaign' },
                message_instructions: 'Existing instructions',
            },
            journeyType: JOURNEY_TYPES.CAMPAIGN,
            shopName: 'test-store',
        })

        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /save changes/i }))

        await waitFor(() => {
            expect(mockHandleUpdate).toHaveBeenCalled()
        })
        const callArgs = mockHandleUpdate.mock.calls[0][0] as Record<
            string,
            unknown
        >
        expect(callArgs.uploadedImageAttachment).toEqual([])
    })

    it('should not toast on success when the save throws', async () => {
        const mockHandleUpdate = jest.fn().mockRejectedValue(new Error('boom'))
        const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
            .useJourneyUpdateHandler as jest.Mock
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
        })
        const toastSuccessSpy = jest.spyOn(
            require('@gorgias/axiom').toast,
            'success',
        )

        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1, name: 'Test Store' },
            journeyData: {
                id: 'journey-123',
                campaign: { title: 'Existing Campaign' },
                message_instructions: 'Existing instructions',
            },
            journeyType: JOURNEY_TYPES.CAMPAIGN,
            shopName: 'test-store',
        })

        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /save changes/i }))

        await waitFor(() => {
            expect(mockHandleUpdate).toHaveBeenCalled()
        })
        expect(toastSuccessSpy).not.toHaveBeenCalledWith(
            'Changes saved successfully',
        )

        toastSuccessSpy.mockRestore()
    })
})

describe('<JourneyEditorLayout /> — Flow mode (isCampaign = false)', () => {
    const mockStore = configureMockStore([thunk])()

    const renderComponent = () =>
        render(
            <Provider store={mockStore}>
                <JourneyEditorLayout step="setup" />
            </Provider>,
        )

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: {
                id: 'journey-123',
                state: JourneyStatusEnum.Draft,
                name: undefined,
            },
            journeyType: JOURNEY_TYPES.WELCOME,
            shopName: 'test-store',
        })
    })

    it('should display the title from journeyData.name', () => {
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: {
                id: 'journey-123',
                state: JourneyStatusEnum.Draft,
                name: 'My Custom Flow',
            },
            journeyType: JOURNEY_TYPES.WELCOME,
            shopName: 'test-store',
        })

        renderComponent()

        expect(screen.getByText('My Custom Flow')).toBeInTheDocument()
    })

    it('should display the fallback title from FLOW_TITLE_MAP for JOURNEY_TYPES.WELCOME', () => {
        renderComponent()

        expect(screen.getByText('Welcome flow')).toBeInTheDocument()
    })

    it('should render "Enable" when the flow is in Draft state', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /enable/i }),
        ).toBeInTheDocument()
    })

    it('should render "Pause" when the flow is Active', () => {
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: {
                id: 'journey-123',
                state: JourneyStatusEnum.Active,
                name: undefined,
            },
            journeyType: JOURNEY_TYPES.WELCOME,
            shopName: 'test-store',
        })

        renderComponent()

        expect(
            screen.getByRole('button', { name: /pause/i }),
        ).toBeInTheDocument()
    })

    it('should render the "Back to flows" button', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /back to flows/i }),
        ).toBeInTheDocument()
    })

    it('should call handleUpdate with Active state when clicking "Enable"', async () => {
        const mockHandleUpdate = jest.fn().mockResolvedValue({})
        const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
            .useJourneyUpdateHandler as jest.Mock
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
        })

        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /enable/i }))

        expect(mockHandleUpdate).toHaveBeenCalledWith({
            journeyState: JourneyStatusEnum.Active,
        })
    })

    it('should open the unsaved changes modal when clicking "Enable" while the form is dirty', async () => {
        const mockHandleUpdate = jest.fn().mockResolvedValue({})
        const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
            .useJourneyUpdateHandler as jest.Mock
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
        })

        const user = userEvent.setup()
        renderComponent()

        await user.type(
            screen.getByPlaceholderText(/describe tone/i),
            'New instructions',
        )
        await user.click(screen.getByRole('button', { name: /enable/i }))

        expect(
            await screen.findByRole('dialog', { name: /save changes/i }),
        ).toBeInTheDocument()
        expect(mockHandleUpdate).not.toHaveBeenCalled()
    })

    it('should not re-open the unsaved changes modal on a second action after the form was saved through the modal', async () => {
        const mockHandleUpdate = jest.fn().mockResolvedValue({})
        const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
            .useJourneyUpdateHandler as jest.Mock
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
        })

        const user = userEvent.setup()
        renderComponent()

        await user.type(
            screen.getByPlaceholderText(/describe tone/i),
            'New instructions',
        )
        await user.click(screen.getByRole('button', { name: /enable/i }))

        const dialog = await screen.findByRole('dialog', {
            name: /save changes/i,
        })
        expect(dialog).toBeInTheDocument()

        await user.click(
            within(dialog).getByRole('button', { name: /save changes/i }),
        )

        await waitFor(() => {
            expect(mockHandleUpdate).toHaveBeenCalled()
        })
        await waitFor(() => {
            expect(
                screen.queryByRole('dialog', { name: /save changes/i }),
            ).not.toBeInTheDocument()
        })

        mockHandleUpdate.mockClear()
        await user.click(screen.getByRole('button', { name: /enable/i }))

        expect(
            screen.queryByRole('dialog', { name: /save changes/i }),
        ).not.toBeInTheDocument()
        expect(mockHandleUpdate).toHaveBeenCalled()
    })

    it('should call handleUpdate with Paused state when clicking "Pause"', async () => {
        const mockHandleUpdate = jest.fn().mockResolvedValue({})
        const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
            .useJourneyUpdateHandler as jest.Mock
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
        })

        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: {
                id: 'journey-123',
                state: JourneyStatusEnum.Active,
                name: undefined,
            },
            journeyType: JOURNEY_TYPES.WELCOME,
            shopName: 'test-store',
        })

        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /pause/i }))

        expect(mockHandleUpdate).toHaveBeenCalledWith({
            journeyState: JourneyStatusEnum.Paused,
        })
    })
})

describe('<JourneyEditorLayout /> — Custom flow mode', () => {
    const mockStore = configureMockStore([thunk])()

    const renderComponent = () =>
        render(
            <Provider store={mockStore}>
                <JourneyEditorLayout step="setup" />
            </Provider>,
        )

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: {
                id: 'journey-123',
                state: JourneyStatusEnum.Draft,
                name: 'My Custom Flow',
            },
            journeyType: JOURNEY_TYPES.CUSTOM,
            shopName: 'test-store',
        })
    })

    it('should render an editable "Flow name" input for custom flows', () => {
        renderComponent()

        expect(
            screen.getByRole('textbox', { name: /flow name/i }),
        ).toBeInTheDocument()
    })

    it('should display the flow name from journeyData.name', () => {
        renderComponent()

        expect(screen.getByDisplayValue('My Custom Flow')).toBeInTheDocument()
    })

    it('should render the "Back to flows" button for custom flows', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /back to flows/i }),
        ).toBeInTheDocument()
    })

    it('should render "Enable" button for custom flows', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /enable/i }),
        ).toBeInTheDocument()
    })
})

describe('<JourneyEditorLayout /> — Test SMS modal', () => {
    const mockStore = configureMockStore([thunk])()

    const renderComponent = () =>
        render(
            <Provider store={mockStore}>
                <JourneyEditorLayout step="setup" />
            </Provider>,
        )

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: { id: 'journey-123' },
            journeyType: JOURNEY_TYPES.WELCOME,
            shopName: 'test-store',
        })
    })

    it('should open the Send test SMS modal when "Send test SMS" menu item is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /test/i }))
        await user.click(
            await screen.findByRole('menuitem', { name: /send test sms/i }),
        )

        expect(await screen.findByText('Send test SMS')).toBeInTheDocument()
    })
})

describe('<JourneyEditorLayout /> — Non-campaign flow save', () => {
    const mockStore = configureMockStore([thunk])()

    const renderComponent = () =>
        render(
            <Provider store={mockStore}>
                <JourneyEditorLayout step="setup" />
            </Provider>,
        )

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: {
                id: 'journey-123',
                state: JourneyStatusEnum.Draft,
                message_instructions: 'Existing instructions',
            },
            journeyType: JOURNEY_TYPES.POST_PURCHASE,
            shopName: 'test-store',
        })
    })

    it('should call handleUpdate with flow-specific params when saving a non-campaign journey', async () => {
        const mockHandleUpdate = jest.fn().mockResolvedValue({})
        const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
            .useJourneyUpdateHandler as jest.Mock
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
        })

        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /save changes/i }))

        expect(mockHandleUpdate).toHaveBeenCalled()
        const callArgs = mockHandleUpdate.mock.calls[0][0] as Record<
            string,
            unknown
        >
        expect(callArgs).toHaveProperty('postPurchaseWaitMinutes')
        expect(callArgs).toHaveProperty('waitTimeMinutes')
        expect(callArgs).toHaveProperty('cooldownDays')
        expect(callArgs).toHaveProperty('inactiveDays')
    })

    it('should include executionModeOverride in save when USER_IMPERSONATED is true', async () => {
        const originalImpersonated = window.USER_IMPERSONATED
        window.USER_IMPERSONATED = true

        const mockHandleUpdate = jest.fn().mockResolvedValue({})
        const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
            .useJourneyUpdateHandler as jest.Mock
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
        })

        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /save changes/i }))

        expect(mockHandleUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                executionModeOverride: null,
            }),
        )

        window.USER_IMPERSONATED = originalImpersonated
    })

    it('should send empty audience arrays when the narrow audience toggle is off on save', async () => {
        const mockUseFlag = require('@repo/feature-flags').useFlag as jest.Mock
        mockUseFlag.mockImplementation(
            (key: string) =>
                key === 'ai-journey-v3-architecture-enabled' ||
                key === 'ai-journey-segments-ui-enabled',
        )

        const mockHandleUpdate = jest.fn().mockResolvedValue({})
        const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
            .useJourneyUpdateHandler as jest.Mock
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
        })

        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: {
                id: 'journey-123',
                state: JourneyStatusEnum.Draft,
                message_instructions: 'Existing instructions',
                included_audience_list_ids: ['previous-1'],
                excluded_audience_list_ids: ['previous-2'],
            },
            journeyType: JOURNEY_TYPES.POST_PURCHASE,
            shopName: 'test-store',
        })

        const user = userEvent.setup()
        renderComponent()

        await user.click(
            await screen.findByRole('switch', {
                name: /Narrow down audience/i,
            }),
        )
        await user.click(screen.getByRole('button', { name: /save changes/i }))

        await waitFor(() => {
            expect(mockHandleUpdate).toHaveBeenCalled()
        })
        const callArgs = mockHandleUpdate.mock.calls[0][0] as Record<
            string,
            unknown
        >
        expect(callArgs.includedAudienceListIds).toEqual([])
        expect(callArgs.excludedAudienceListIds).toEqual([])
    })

    it('should not clear audience values on save when the narrow audience toggle stays on', async () => {
        const mockUseFlag = require('@repo/feature-flags').useFlag as jest.Mock
        mockUseFlag.mockImplementation(
            (key: string) =>
                key === 'ai-journey-v3-architecture-enabled' ||
                key === 'ai-journey-segments-ui-enabled',
        )

        const mockHandleUpdate = jest.fn().mockResolvedValue({})
        const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
            .useJourneyUpdateHandler as jest.Mock
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
        })

        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: {
                id: 'journey-123',
                state: JourneyStatusEnum.Draft,
                message_instructions: 'Existing instructions',
                included_audience_list_ids: ['previous-1'],
                excluded_audience_list_ids: ['previous-2'],
            },
            journeyType: JOURNEY_TYPES.POST_PURCHASE,
            shopName: 'test-store',
        })

        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /save changes/i }))

        await waitFor(() => {
            expect(mockHandleUpdate).toHaveBeenCalled()
        })
        const callArgs = mockHandleUpdate.mock.calls[0][0] as Record<
            string,
            unknown
        >
        expect(callArgs.includedAudienceListIds).not.toEqual([])
        expect(callArgs.excludedAudienceListIds).not.toEqual([])
    })

    it('should call handleCreate when saving a new non-campaign journey with no journeyData.id', async () => {
        const mockHandleCreate = jest.fn().mockResolvedValue({ id: 'new-456' })
        const mockHandleUpdate = jest.fn().mockResolvedValue({})
        const mockReplace = jest.fn()

        const mockUseJourneyCreateHandler = require('AIJourney/hooks')
            .useJourneyCreateHandler as jest.Mock
        const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
            .useJourneyUpdateHandler as jest.Mock
        const mockUseHistory = require('react-router-dom')
            .useHistory as jest.Mock

        mockUseJourneyCreateHandler.mockReturnValue({
            handleCreate: mockHandleCreate,
            isLoading: false,
        })
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
        })
        mockUseHistory.mockReturnValue({
            push: jest.fn(),
            replace: mockReplace,
        })

        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: undefined,
            journeyType: JOURNEY_TYPES.CUSTOM,
            shopName: 'test-store',
        })

        const user = userEvent.setup()
        renderComponent()

        await user.type(
            screen.getByRole('textbox', { name: /flow name/i }),
            'New Custom Flow',
        )
        await user.type(
            screen.getByPlaceholderText(/describe tone/i),
            'Test instructions',
        )
        await user.click(screen.getByRole('button', { name: /save changes/i }))

        await waitFor(() => {
            expect(mockHandleCreate).toHaveBeenCalled()
        })
        expect(mockHandleUpdate).not.toHaveBeenCalled()
        expect(mockReplace).toHaveBeenCalledWith(
            '/app/ai-journey/test-store/custom/setup/new-456',
        )
    })
})

describe('<JourneyEditorLayout /> — Klaviyo webhook panel', () => {
    const mockStore = configureMockStore([thunk])()

    const renderComponent = () =>
        render(
            <Provider store={mockStore}>
                <JourneyEditorLayout step="setup" />
            </Provider>,
        )

    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
    })

    it('should auto-open the webhook panel on first visit when the custom flow has a webhook URL', async () => {
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: {
                id: 'journey-123',
                state: JourneyStatusEnum.Draft,
                name: 'My Custom Flow',
                webhook_url: 'https://example.com/webhook',
            },
            journeyType: JOURNEY_TYPES.CUSTOM,
            shopName: 'test-store',
        })

        renderComponent()

        expect(
            await screen.findByDisplayValue('https://example.com/webhook'),
        ).toBeInTheDocument()
    })

    it('should not auto-open the webhook panel on subsequent visits for the same journey', () => {
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: {
                id: 'journey-123',
                state: JourneyStatusEnum.Draft,
                name: 'My Custom Flow',
                webhook_url: 'https://example.com/webhook',
            },
            journeyType: JOURNEY_TYPES.CUSTOM,
            shopName: 'test-store',
        })

        localStorage.setItem('klaviyo-setup-seen-journey-123', 'true')

        renderComponent()

        expect(
            screen.queryByDisplayValue('https://example.com/webhook'),
        ).not.toBeInTheDocument()
    })

    it('should show the webhook icon button for a draft custom flow without a webhook URL', () => {
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: {
                id: 'journey-123',
                state: JourneyStatusEnum.Draft,
                name: 'My Custom Flow',
            },
            journeyType: JOURNEY_TYPES.CUSTOM,
            shopName: 'test-store',
        })

        renderComponent()

        expect(
            screen.getByRole('button', { name: /^webhook$/i }),
        ).toBeInTheDocument()
    })

    it('should not auto-open the webhook panel when there is no webhook URL', () => {
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: {
                id: 'journey-123',
                state: JourneyStatusEnum.Draft,
                name: 'My Custom Flow',
            },
            journeyType: JOURNEY_TYPES.CUSTOM,
            shopName: 'test-store',
        })

        renderComponent()

        expect(screen.getByText('Details')).toBeInTheDocument()
        expect(screen.queryByText(/activate the flow/i)).not.toBeInTheDocument()
    })

    it('should show the empty state when the webhook icon is clicked on a draft flow without a URL', async () => {
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: {
                id: 'journey-123',
                state: JourneyStatusEnum.Draft,
                name: 'My Custom Flow',
            },
            journeyType: JOURNEY_TYPES.CUSTOM,
            shopName: 'test-store',
        })

        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /^webhook$/i }))

        expect(
            await screen.findByText(/activate the flow/i),
        ).toBeInTheDocument()
        expect(
            screen.queryByDisplayValue('https://example.com/webhook'),
        ).not.toBeInTheDocument()
    })

    it('should not show the webhook icon button for non-custom flows', () => {
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: {
                id: 'journey-123',
                state: JourneyStatusEnum.Draft,
                webhook_url: 'https://example.com/webhook',
            },
            journeyType: JOURNEY_TYPES.WELCOME,
            shopName: 'test-store',
        })

        renderComponent()

        expect(
            screen.queryByRole('button', { name: /^webhook$/i }),
        ).not.toBeInTheDocument()
    })

    it('should open the webhook panel when the webhook icon button is clicked', async () => {
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: {
                id: 'journey-123',
                state: JourneyStatusEnum.Draft,
                name: 'My Custom Flow',
                webhook_url: 'https://example.com/webhook',
            },
            journeyType: JOURNEY_TYPES.CUSTOM,
            shopName: 'test-store',
        })

        localStorage.setItem('klaviyo-setup-seen-journey-123', 'true')

        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /^webhook$/i }))

        expect(
            await screen.findByDisplayValue('https://example.com/webhook'),
        ).toBeInTheDocument()
    })

    it('should switch back to the details panel when the details icon button is clicked', async () => {
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: {
                id: 'journey-123',
                state: JourneyStatusEnum.Draft,
                name: 'My Custom Flow',
                webhook_url: 'https://example.com/webhook',
            },
            journeyType: JOURNEY_TYPES.CUSTOM,
            shopName: 'test-store',
        })

        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /^details$/i }))

        expect(screen.getByText('Details')).toBeInTheDocument()
        expect(
            screen.queryByDisplayValue('https://example.com/webhook'),
        ).not.toBeInTheDocument()
    })
})

describe('<JourneyEditorLayout /> — Schedule campaign panel', () => {
    const mockStore = configureMockStore([thunk])()

    const renderComponent = () =>
        render(
            <Provider store={mockStore}>
                <JourneyEditorLayout step="setup" />
            </Provider>,
        )

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: {
                id: 'journey-123',
                campaign: { title: 'Test Campaign' },
            },
            journeyType: JOURNEY_TYPES.CAMPAIGN,
            shopName: 'test-store',
        })
    })

    it('should open the schedule panel when clicking "Schedule"', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /schedule/i }))

        expect(
            await screen.findByRole('heading', { name: /schedule campaign/i }),
        ).toBeInTheDocument()
    })
})

describe('<JourneyEditorLayout /> — Back navigation', () => {
    const mockStore = configureMockStore([thunk])()
    const mockPush = jest.fn()

    const renderComponent = (step = 'setup') =>
        render(
            <Provider store={mockStore}>
                <JourneyEditorLayout step={step} />
            </Provider>,
        )

    beforeEach(() => {
        jest.clearAllMocks()
        const mockUseHistory = require('react-router-dom')
            .useHistory as jest.Mock
        mockUseHistory.mockReturnValue({ push: mockPush, replace: jest.fn() })
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: { id: 'journey-123' },
            journeyType: JOURNEY_TYPES.WELCOME,
            shopName: 'test-store',
        })
    })

    it('should navigate back when the back button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /back to flows/i }))

        expect(mockPush).toHaveBeenCalledWith(
            '/app/ai-journey/test-store/flows',
        )
    })
})

describe('<JourneyEditorLayout /> — Preview panel', () => {
    const mockStore = configureMockStore([thunk])()
    const mockSetIsCollapsibleColumnOpen = jest.fn()
    const mockUseCollapsibleColumn =
        require('pages/common/hooks/useCollapsibleColumn')
            .useCollapsibleColumn as jest.Mock

    const renderComponent = (
        step = 'setup',
        isCollapsibleColumnOpen = false,
    ) => {
        mockUseCollapsibleColumn.mockReturnValue({
            isCollapsibleColumnOpen,
            setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
        })
        return render(
            <Provider store={mockStore}>
                <JourneyEditorLayout step={step} />
            </Provider>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1 },
            journeyData: { id: 'journey-123' },
            journeyType: JOURNEY_TYPES.WELCOME,
            shopName: 'test-store',
        })
    })

    it('should call setIsCollapsibleColumnOpen(true) when step is "preview"', async () => {
        renderComponent('preview')

        await waitFor(() => {
            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(true)
        })
    })

    it('should call setIsCollapsibleColumnOpen(true) when clicking "Preview here"', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /test/i }))
        await user.click(
            await screen.findByRole('menuitem', { name: /preview here/i }),
        )

        expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(true)
    })

    it('should render PreviewPanel and call setIsCollapsibleColumnOpen(false) when close is clicked', async () => {
        const user = userEvent.setup()
        renderComponent('setup', true)

        const closeButton = screen.getByRole('button', {
            name: /close preview panel/i,
        })
        await user.click(closeButton)

        expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
    })
})
