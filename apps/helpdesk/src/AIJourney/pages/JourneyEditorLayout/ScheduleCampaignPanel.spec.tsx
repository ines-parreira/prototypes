import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { UpdatableJourneyCampaignState } from 'AIJourney/constants'

import { ScheduleCampaignPanel } from './ScheduleCampaignPanel'

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

jest.mock('AIJourney/hooks', () => ({
    ...jest.requireActual('AIJourney/hooks'),
    useJourneyUpdateHandler: jest.fn(() => ({
        handleUpdate: jest.fn().mockResolvedValue({}),
        isLoading: false,
    })),
}))

jest.mock('AIJourney/pages/AiJourneyOnboarding/AiJourneyOnboarding', () => ({
    buildScheduledDatetime: jest.fn(() => null),
}))

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

const mockStore = configureMockStore([thunk])()

const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
        defaultValues: {
            scheduleType: 'later' as const,
            scheduledDate: null,
            scheduledTime: null,
        },
    })
    return (
        <Provider store={mockStore}>
            <FormProvider {...methods}>{children}</FormProvider>
        </Provider>
    )
}

const renderComponent = (isOpen = true, onClose = jest.fn()) =>
    render(<ScheduleCampaignPanel isOpen={isOpen} onClose={onClose} />, {
        wrapper: Wrapper,
    })

describe('<ScheduleCampaignPanel />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseJourneyContext.mockReturnValue({
            journeyData: {
                id: 'journey-123',
                campaign: {
                    title: 'Test Campaign',
                    scheduled_datetime: null,
                },
                included_audience_list_ids: ['list-1'],
                message_instructions: 'Some instructions',
            },
            currentIntegration: { id: 1 },
            isLoading: false,
        })
    })

    it('should render the panel title when open', () => {
        renderComponent(true)

        expect(
            screen.getByRole('heading', { name: /schedule campaign/i }),
        ).toBeInTheDocument()
    })

    it('should render "Send now" and "Schedule" options', () => {
        renderComponent(true)

        expect(screen.getByText('Send now')).toBeInTheDocument()
        expect(screen.getByText('Schedule')).toBeInTheDocument()
    })

    it('should show a warning banner when audience is missing', () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: {
                id: 'journey-123',
                campaign: { title: 'Test Campaign', scheduled_datetime: null },
                included_audience_list_ids: [],
                message_instructions: 'Some instructions',
            },
            currentIntegration: { id: 1 },
            isLoading: false,
        })

        renderComponent(true)

        expect(
            screen.getByText('Campaign is not ready to send'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Add an audience to include'),
        ).toBeInTheDocument()
    })

    it('should show a warning banner when message guidance is missing', () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: {
                id: 'journey-123',
                campaign: { title: 'Test Campaign', scheduled_datetime: null },
                included_audience_list_ids: ['list-1'],
                message_instructions: '',
            },
            currentIntegration: { id: 1 },
            isLoading: false,
        })

        renderComponent(true)

        expect(
            screen.getByText('Campaign is not ready to send'),
        ).toBeInTheDocument()
        expect(screen.getByText('Add message guidance')).toBeInTheDocument()
    })

    it('should show both warning items when both audience and guidance are missing', () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: {
                id: 'journey-123',
                campaign: { title: 'Test Campaign', scheduled_datetime: null },
                included_audience_list_ids: [],
                message_instructions: '',
            },
            currentIntegration: { id: 1 },
            isLoading: false,
        })

        renderComponent(true)

        expect(
            screen.getByText('Add an audience to include'),
        ).toBeInTheDocument()
        expect(screen.getByText('Add message guidance')).toBeInTheDocument()
    })

    it('should not show warning banner when audience and guidance are provided', () => {
        renderComponent(true)

        expect(
            screen.queryByText('Campaign is not ready to send'),
        ).not.toBeInTheDocument()
    })

    it('should disable the send button when the warning banner is shown', () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: {
                id: 'journey-123',
                campaign: { title: 'Test Campaign', scheduled_datetime: null },
                included_audience_list_ids: [],
                message_instructions: '',
            },
            currentIntegration: { id: 1 },
            isLoading: false,
        })

        renderComponent(true)

        expect(
            screen.getByRole('button', { name: /schedule campaign/i }),
        ).toBeDisabled()
    })

    it('should show "Schedule campaign" button when schedule type is "later"', () => {
        renderComponent(true)

        expect(
            screen.getByRole('button', { name: /schedule campaign/i }),
        ).toBeInTheDocument()
    })

    it('should call handleUpdate with Scheduled state when sending immediately', async () => {
        const mockHandleUpdate = jest.fn().mockResolvedValue({})
        const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
            .useJourneyUpdateHandler as jest.Mock
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
        })

        const user = userEvent.setup()
        renderComponent(true)

        await user.click(screen.getByText('Send now'))

        await user.click(screen.getByRole('button', { name: /send campaign/i }))

        await waitFor(() => {
            expect(mockHandleUpdate).toHaveBeenCalledWith({
                campaignState: UpdatableJourneyCampaignState.Scheduled,
                scheduledDatetime: null,
            })
        })
    })

    it('should call handleUpdate with Scheduled state when schedule type is "later" and date/time are set', async () => {
        const mockHandleUpdate = jest.fn().mockResolvedValue({})
        const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
            .useJourneyUpdateHandler as jest.Mock
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
        })

        const {
            parseAbsoluteToLocal,
            Time,
        } = require('@internationalized/date')
        const scheduledDate = parseAbsoluteToLocal('2030-06-15T10:00:00Z')
        const scheduledTime = new Time(10, 0)

        const WrapperWithSchedule = ({
            children,
        }: {
            children: React.ReactNode
        }) => {
            const methods = useForm({
                defaultValues: {
                    scheduleType: 'later' as const,
                    scheduledDate,
                    scheduledTime,
                },
            })
            return (
                <Provider store={mockStore}>
                    <FormProvider {...methods}>{children}</FormProvider>
                </Provider>
            )
        }

        const user = userEvent.setup()
        render(<ScheduleCampaignPanel isOpen={true} onClose={jest.fn()} />, {
            wrapper: WrapperWithSchedule,
        })

        await user.click(
            screen.getByRole('button', { name: /schedule campaign/i }),
        )

        await waitFor(() => {
            expect(mockHandleUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    campaignState: UpdatableJourneyCampaignState.Scheduled,
                }),
            )
        })
    })

    it('should call onClose after sending the campaign', async () => {
        const mockOnClose = jest.fn()
        const mockHandleUpdate = jest.fn().mockResolvedValue({})
        const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
            .useJourneyUpdateHandler as jest.Mock
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
        })

        const user = userEvent.setup()
        renderComponent(true, mockOnClose)

        await user.click(screen.getByText('Send now'))
        await user.click(screen.getByRole('button', { name: /send campaign/i }))

        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalled()
        })
    })

    it('should initialize date and time fields when journeyData has a scheduled_datetime', async () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: {
                id: 'journey-123',
                campaign: {
                    title: 'Test Campaign',
                    scheduled_datetime: '2030-06-15T10:00:00',
                },
                included_audience_list_ids: ['list-1'],
                message_instructions: 'Some instructions',
            },
            currentIntegration: { id: 1 },
            isLoading: false,
        })

        renderComponent(true)

        expect(
            screen.getByRole('heading', { name: /schedule campaign/i }),
        ).toBeInTheDocument()
    })
})
