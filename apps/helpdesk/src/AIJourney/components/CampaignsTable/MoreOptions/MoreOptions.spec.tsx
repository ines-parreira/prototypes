import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { JourneyCampaignStateEnum } from '@gorgias/convert-client'

import { renderWithRouter } from 'utils/testing'

import { MoreOptions } from './MoreOptions'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

const mockUseFlag = jest.fn()
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: (key: string) => mockUseFlag(key),
}))

describe('<MoreOptions />', () => {
    const defaultProps = {
        shopName: 'test-shop',
        journeyId: 'journey-123',
        state: JourneyCampaignStateEnum.Draft,
        handleChangeStatus: jest.fn(),
        handleRemoveClick: jest.fn(),
        handleSendClick: jest.fn(),
        handleCancelClick: jest.fn(),
        handleDuplicateClick: jest.fn(),
        hasIncludedAudiences: true,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockImplementation(() => true)
        delete (window as any).USER_IMPERSONATED
    })

    describe('Options visibility based on state', () => {
        it('should return null when no options are available', () => {
            const { container } = renderWithRouter(
                <MoreOptions
                    {...defaultProps}
                    state={'unknown' as JourneyCampaignStateEnum}
                />,
            )

            expect(container.firstChild).toBeNull()
        })
    })

    describe('Campaign state options', () => {
        it('should show Edit, Send, Duplicate, and Delete options for Draft state', async () => {
            const user = userEvent.setup()
            renderWithRouter(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Draft}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await user.click(trigger)

            expect(screen.getAllByText('Edit').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Send').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Duplicate').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Delete').length).toBeGreaterThan(0)
        })

        it('should show Duplicate and Cancel options for Scheduled state', async () => {
            const user = userEvent.setup()
            renderWithRouter(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Scheduled}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await user.click(trigger)

            expect(screen.getAllByText('Duplicate').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Cancel').length).toBeGreaterThan(0)
        })

        it('should show Duplicate, Pause, and Cancel options for Active state', async () => {
            const user = userEvent.setup()
            renderWithRouter(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Active}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await user.click(trigger)

            expect(screen.getAllByText('Duplicate').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Pause').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Cancel').length).toBeGreaterThan(0)
        })

        it('should show Resume and Cancel options for Paused state', async () => {
            const user = userEvent.setup()
            renderWithRouter(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Paused}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await user.click(trigger)

            expect(screen.getAllByText('Resume').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Cancel').length).toBeGreaterThan(0)
        })

        it('should show only Duplicate option for Canceled state', async () => {
            const user = userEvent.setup()
            renderWithRouter(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Canceled}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await user.click(trigger)

            expect(screen.getAllByText('Duplicate').length).toBeGreaterThan(0)
            expect(screen.queryByText('Edit')).not.toBeInTheDocument()
            expect(screen.queryByText('Send')).not.toBeInTheDocument()
            expect(screen.queryByText('Delete')).not.toBeInTheDocument()
        })

        it('should show only Duplicate option for Sent state', async () => {
            const user = userEvent.setup()
            renderWithRouter(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Sent}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await user.click(trigger)

            expect(screen.getAllByText('Duplicate').length).toBeGreaterThan(0)
            expect(screen.queryByText('Edit')).not.toBeInTheDocument()
            expect(screen.queryByText('Send')).not.toBeInTheDocument()
            expect(screen.queryByText('Delete')).not.toBeInTheDocument()
        })
    })

    describe('Action handlers', () => {
        it('should call handleSendClick when Send option is clicked', async () => {
            const user = userEvent.setup()
            const handleSendClick = jest.fn()
            renderWithRouter(
                <MoreOptions
                    {...defaultProps}
                    handleSendClick={handleSendClick}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await user.click(trigger)

            const sendOptions = screen.getAllByText('Send')
            const sendListItem = sendOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (sendListItem) {
                await user.click(sendListItem)
            }

            expect(handleSendClick).toHaveBeenCalledTimes(1)
        })

        it('should navigate to edit page when Edit option is clicked', async () => {
            const user = userEvent.setup()
            renderWithRouter(<MoreOptions {...defaultProps} />)

            const trigger = screen.getByLabelText('Open options')
            await user.click(trigger)

            const editOptions = screen.getAllByText('Edit')
            const editListItem = editOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (editListItem) {
                await user.click(editListItem)
            }

            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/ai-journey/test-shop/campaign/setup/journey-123',
            )
        })

        it('should call handleRemoveClick when Delete option is clicked', async () => {
            const user = userEvent.setup()
            const handleRemoveClick = jest.fn()
            renderWithRouter(
                <MoreOptions
                    {...defaultProps}
                    handleRemoveClick={handleRemoveClick}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await user.click(trigger)

            const deleteOptions = screen.getAllByText('Delete')
            const deleteListItem = deleteOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (deleteListItem) {
                await user.click(deleteListItem)
            }

            expect(handleRemoveClick).toHaveBeenCalledTimes(1)
        })

        it('should call handleDuplicateClick when Duplicate option is clicked', async () => {
            const user = userEvent.setup()
            const handleDuplicateClick = jest.fn()
            renderWithRouter(
                <MoreOptions
                    {...defaultProps}
                    handleDuplicateClick={handleDuplicateClick}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await user.click(trigger)

            const duplicateOptions = screen.getAllByText('Duplicate')
            const duplicateListItem = duplicateOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (duplicateListItem) {
                await user.click(duplicateListItem)
            }

            expect(handleDuplicateClick).toHaveBeenCalledTimes(1)
        })

        it('should call handleCancelClick when Cancel option is clicked', async () => {
            const user = userEvent.setup()
            const handleCancelClick = jest.fn()
            renderWithRouter(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Active}
                    handleCancelClick={handleCancelClick}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await user.click(trigger)

            const cancelOptions = screen.getAllByText('Cancel')
            const cancelListItem = cancelOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (cancelListItem) {
                await user.click(cancelListItem)
            }

            expect(handleCancelClick).toHaveBeenCalledTimes(1)
        })

        it('should call handleChangeStatus with Paused when Pause option is clicked', async () => {
            const user = userEvent.setup()
            const handleChangeStatus = jest.fn()
            renderWithRouter(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Active}
                    handleChangeStatus={handleChangeStatus}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await user.click(trigger)

            const pauseOptions = screen.getAllByText('Pause')
            const pauseListItem = pauseOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (pauseListItem) {
                await user.click(pauseListItem)
            }

            expect(handleChangeStatus).toHaveBeenCalledWith('paused')
        })

        it('should call handleChangeStatus with Scheduled when Resume option is clicked', async () => {
            const user = userEvent.setup()
            const handleChangeStatus = jest.fn()
            renderWithRouter(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Paused}
                    handleChangeStatus={handleChangeStatus}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await user.click(trigger)

            const resumeOptions = screen.getAllByText('Resume')
            const resumeListItem = resumeOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (resumeListItem) {
                await user.click(resumeListItem)
            }

            expect(handleChangeStatus).toHaveBeenCalledWith('scheduled')
        })
    })

    describe('Send option feature flag', () => {
        it('should show Send option when feature flag is enabled', async () => {
            mockUseFlag.mockImplementation(() => true)

            const user = userEvent.setup()
            renderWithRouter(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Draft}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await user.click(trigger)

            expect(screen.getAllByText('Send').length).toBeGreaterThan(0)
        })

        it('should not show Send option when feature flag is disabled and user is not impersonated', async () => {
            mockUseFlag.mockImplementation(() => false)

            const user = userEvent.setup()
            renderWithRouter(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Draft}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await user.click(trigger)

            expect(screen.queryByText('Send')).not.toBeInTheDocument()
            expect(screen.getAllByText('Edit').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Duplicate').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Delete').length).toBeGreaterThan(0)
        })

        it('should show Send option when user is impersonated even if feature flag is disabled', async () => {
            mockUseFlag.mockImplementation(() => false)
            ;(window as any).USER_IMPERSONATED = true

            const user = userEvent.setup()
            renderWithRouter(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Draft}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await user.click(trigger)

            expect(screen.getAllByText('Send').length).toBeGreaterThan(0)
        })

        it('should not show Send option when campaign has no included audiences', async () => {
            const user = userEvent.setup()
            renderWithRouter(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Draft}
                    hasIncludedAudiences={false}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await user.click(trigger)

            expect(screen.queryByText('Send')).not.toBeInTheDocument()
            expect(screen.getAllByText('Edit').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Duplicate').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Delete').length).toBeGreaterThan(0)
        })

        it('should show Send option when campaign has included audiences', async () => {
            const user = userEvent.setup()
            renderWithRouter(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Draft}
                    hasIncludedAudiences={true}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await user.click(trigger)

            expect(screen.getAllByText('Send').length).toBeGreaterThan(0)
        })
    })
})
