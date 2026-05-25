import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { JourneyCampaignStateEnum } from '@gorgias/convert-client'

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
            const { container } = render(
                <MoreOptions
                    {...defaultProps}
                    state={'unknown' as JourneyCampaignStateEnum}
                />,
            )

            expect(container.firstChild).toBeNull()
        })
    })

    describe('Campaign state options', () => {
        it('should show Edit, Send now, Duplicate, and Delete options for Draft state', async () => {
            const user = userEvent.setup()
            render(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Draft}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Actions for test-shop' }),
            )

            expect(
                await screen.findByRole('menuitem', { name: /Edit/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /Send now/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /Duplicate/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /Delete/ }),
            ).toBeInTheDocument()
        })

        it('should show Edit, Duplicate and Cancel options for Scheduled state', async () => {
            const user = userEvent.setup()
            render(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Scheduled}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Actions for test-shop' }),
            )

            expect(
                await screen.findByRole('menuitem', { name: /Edit/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /Duplicate/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /Cancel/ }),
            ).toBeInTheDocument()
        })

        it('should show Duplicate, Pause, and Cancel options for Active state', async () => {
            const user = userEvent.setup()
            render(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Active}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Actions for test-shop' }),
            )

            expect(
                await screen.findByRole('menuitem', { name: /Duplicate/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /Pause/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /Cancel/ }),
            ).toBeInTheDocument()
        })

        it('should show Resume and Cancel options for Paused state', async () => {
            const user = userEvent.setup()
            render(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Paused}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Actions for test-shop' }),
            )

            expect(
                await screen.findByRole('menuitem', { name: /Resume/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /Cancel/ }),
            ).toBeInTheDocument()
        })

        it('should show only Duplicate option for Canceled state', async () => {
            const user = userEvent.setup()
            render(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Canceled}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Actions for test-shop' }),
            )

            expect(
                await screen.findByRole('menuitem', { name: /Duplicate/ }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('menuitem', { name: /Edit/ }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('menuitem', { name: /Send now/ }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('menuitem', { name: /Delete/ }),
            ).not.toBeInTheDocument()
        })

        it('should show only Duplicate option for Sent state', async () => {
            const user = userEvent.setup()
            render(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Sent}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Actions for test-shop' }),
            )

            expect(
                await screen.findByRole('menuitem', { name: /Duplicate/ }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('menuitem', { name: /Edit/ }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('menuitem', { name: /Send now/ }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('menuitem', { name: /Delete/ }),
            ).not.toBeInTheDocument()
        })
    })

    describe('Action handlers', () => {
        it('should call handleSendClick when Send now option is clicked', async () => {
            const user = userEvent.setup()
            const handleSendClick = jest.fn()
            render(
                <MoreOptions
                    {...defaultProps}
                    handleSendClick={handleSendClick}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Actions for test-shop' }),
            )
            await user.click(
                await screen.findByRole('menuitem', { name: /Send now/ }),
            )

            expect(handleSendClick).toHaveBeenCalledTimes(1)
        })

        it('should navigate to edit page when Edit option is clicked', async () => {
            const user = userEvent.setup()
            render(<MoreOptions {...defaultProps} />)

            await user.click(
                screen.getByRole('button', { name: 'Actions for test-shop' }),
            )
            await user.click(
                await screen.findByRole('menuitem', { name: /Edit/ }),
            )

            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/ai-journey/test-shop/campaign/setup/journey-123',
            )
        })

        it('should call handleRemoveClick when Delete option is clicked', async () => {
            const user = userEvent.setup()
            const handleRemoveClick = jest.fn()
            render(
                <MoreOptions
                    {...defaultProps}
                    handleRemoveClick={handleRemoveClick}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Actions for test-shop' }),
            )
            await user.click(
                await screen.findByRole('menuitem', { name: /Delete/ }),
            )

            expect(handleRemoveClick).toHaveBeenCalledTimes(1)
        })

        it('should call handleDuplicateClick when Duplicate option is clicked', async () => {
            const user = userEvent.setup()
            const handleDuplicateClick = jest.fn()
            render(
                <MoreOptions
                    {...defaultProps}
                    handleDuplicateClick={handleDuplicateClick}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Actions for test-shop' }),
            )
            await user.click(
                await screen.findByRole('menuitem', { name: /Duplicate/ }),
            )

            expect(handleDuplicateClick).toHaveBeenCalledTimes(1)
        })

        it('should call handleCancelClick when Cancel option is clicked', async () => {
            const user = userEvent.setup()
            const handleCancelClick = jest.fn()
            render(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Active}
                    handleCancelClick={handleCancelClick}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Actions for test-shop' }),
            )
            await user.click(
                await screen.findByRole('menuitem', { name: /Cancel/ }),
            )

            expect(handleCancelClick).toHaveBeenCalledTimes(1)
        })

        it('should call handleChangeStatus with Paused when Pause option is clicked', async () => {
            const user = userEvent.setup()
            const handleChangeStatus = jest.fn()
            render(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Active}
                    handleChangeStatus={handleChangeStatus}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Actions for test-shop' }),
            )
            await user.click(
                await screen.findByRole('menuitem', { name: /Pause/ }),
            )

            expect(handleChangeStatus).toHaveBeenCalledWith('paused')
        })

        it('should call handleChangeStatus with Active when Resume option is clicked', async () => {
            const user = userEvent.setup()
            const handleChangeStatus = jest.fn()
            render(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Paused}
                    handleChangeStatus={handleChangeStatus}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Actions for test-shop' }),
            )
            await user.click(
                await screen.findByRole('menuitem', { name: /Resume/ }),
            )

            expect(handleChangeStatus).toHaveBeenCalledWith('active')
        })
    })

    describe('Send now option feature flag', () => {
        it('should show Send now option when feature flag is enabled', async () => {
            mockUseFlag.mockImplementation(() => true)

            const user = userEvent.setup()
            render(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Draft}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Actions for test-shop' }),
            )

            expect(
                await screen.findByRole('menuitem', { name: /Send now/ }),
            ).toBeInTheDocument()
        })

        it('should not show Send now option when feature flag is disabled and user is not impersonated', async () => {
            mockUseFlag.mockImplementation(() => false)

            const user = userEvent.setup()
            render(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Draft}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Actions for test-shop' }),
            )

            expect(
                await screen.findByRole('menuitem', { name: /Edit/ }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('menuitem', { name: /Send now/ }),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /Duplicate/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /Delete/ }),
            ).toBeInTheDocument()
        })

        it('should show Send now option when user is impersonated even if feature flag is disabled', async () => {
            mockUseFlag.mockImplementation(() => false)
            ;(window as any).USER_IMPERSONATED = true

            const user = userEvent.setup()
            render(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Draft}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Actions for test-shop' }),
            )

            expect(
                await screen.findByRole('menuitem', { name: /Send now/ }),
            ).toBeInTheDocument()
        })

        it('should not show Send now option when campaign has no included audiences', async () => {
            const user = userEvent.setup()
            render(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Draft}
                    hasIncludedAudiences={false}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Actions for test-shop' }),
            )

            expect(
                await screen.findByRole('menuitem', { name: /Edit/ }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('menuitem', { name: /Send now/ }),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /Duplicate/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /Delete/ }),
            ).toBeInTheDocument()
        })

        it('should show Send now option when campaign has included audiences', async () => {
            const user = userEvent.setup()
            render(
                <MoreOptions
                    {...defaultProps}
                    state={JourneyCampaignStateEnum.Draft}
                    hasIncludedAudiences={true}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Actions for test-shop' }),
            )

            expect(
                await screen.findByRole('menuitem', { name: /Send now/ }),
            ).toBeInTheDocument()
        })
    })
})
