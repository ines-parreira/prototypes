import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
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
    useFlag: jest.fn(() => false),
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
            },
            journeyType: JOURNEY_TYPES.CAMPAIGN,
            shopName: 'test-store',
        })

        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /save changes/i }))

        expect(mockHandleUpdate).toHaveBeenCalled()
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
