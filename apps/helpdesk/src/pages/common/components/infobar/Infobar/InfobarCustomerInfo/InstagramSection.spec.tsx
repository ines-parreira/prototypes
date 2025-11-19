import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { useFlag } from 'core/flags'

import { InstagramSection } from './InstagramSection'

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

jest.mock('core/flags', () => ({
    ...jest.requireActual('core/flags'),
    useFlag: jest.fn(() => false),
}))
const useFlagMock = useFlag as jest.Mock

describe('InstagramSection', () => {
    const mockCustomer = fromJS({
        id: 1,
        name: 'test_user',
    })

    beforeEach(() => {
        jest.resetAllMocks()
        useFlagMock.mockReturnValue(false)
        window.open = jest.fn()
    })

    describe('when InstagramUserSection flag is disabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(false)
        })

        it('should render Instagram handle with link', () => {
            render(<InstagramSection customer={mockCustomer} />)

            const igLink = screen.getByRole('link', { name: /@test_user/ })
            expect(igLink).toBeInTheDocument()
            expect(igLink).toHaveAttribute('href', '/#')
        })

        it('should log segment event and open Instagram profile when clicking handle', async () => {
            const user = userEvent.setup()
            render(<InstagramSection customer={mockCustomer} />)

            const igLink = screen.getByRole('link', { name: /@test_user/ })
            await user.click(igLink)

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.InstagramHandleClicked,
            )
            expect(window.open).toHaveBeenCalledWith(
                'https://www.instagram.com/test_user',
                '_blank',
                'noopener noreferrer',
            )
        })

        it('should not render details section', () => {
            render(<InstagramSection customer={mockCustomer} />)

            expect(screen.queryByText('Following:')).not.toBeInTheDocument()
            expect(
                screen.queryByText('14.7K followers'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /arrow/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('when InstagramUserSection flag is enabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
        })

        it('should render Instagram handle with link', () => {
            render(<InstagramSection customer={mockCustomer} />)

            const igLink = screen.getByRole('link', { name: /@test_user/ })
            expect(igLink).toBeInTheDocument()
            expect(igLink).toHaveAttribute('href', '/#')
        })

        it('should log segment event and open Instagram profile when clicking handle', async () => {
            const user = userEvent.setup()
            render(<InstagramSection customer={mockCustomer} />)

            const igLink = screen.getByRole('link', { name: /@test_user/ })
            await user.click(igLink)

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.InstagramHandleClicked,
            )
            expect(window.open).toHaveBeenCalledWith(
                'https://www.instagram.com/test_user',
                '_blank',
                'noopener noreferrer',
            )
        })

        it('should render details section with follower information', () => {
            render(<InstagramSection customer={mockCustomer} />)

            expect(screen.getByText(/Following:/)).toBeInTheDocument()
            expect(screen.getByText(/Follower:/)).toBeInTheDocument()
            expect(screen.getByText('14.7K followers')).toBeInTheDocument()
        })

        it('should render verified badge icon', () => {
            render(<InstagramSection customer={mockCustomer} />)

            const verifiedIcon = screen.getByRole('img', {
                name: 'wavy-check',
            })
            expect(verifiedIcon).toBeInTheDocument()
        })
    })
})
