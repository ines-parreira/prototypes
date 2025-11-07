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

describe('<MoreOptions />', () => {
    const defaultProps = {
        shopName: 'test-shop',
        journeyId: 'journey-123',
        state: JourneyCampaignStateEnum.Draft,
        handleChangeStatus: jest.fn(),
        handleRemoveClick: jest.fn(),
        handleSendClick: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
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

            // Use getAllByText to handle multiple elements and click the list item
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

            // Use getAllByText to handle multiple elements and click the list item
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

            // Use getAllByText to handle multiple elements and click the list item
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
    })
})
