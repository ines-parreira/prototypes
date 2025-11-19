import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'

import type { ListInstagramProfiles200 } from '@gorgias/helpdesk-types'

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

    const mockInstagramData: ListInstagramProfiles200 = {
        data: [
            {
                id: 'ig_123',
                username: 'test_user',
                name: 'Test User',
                is_verified: true,
                business_follows_customer: true,
                customer_follows_business: false,
                total_followers: 14700,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            },
        ],
        meta: {
            next_cursor: null,
            prev_cursor: null,
            total_resources: 1,
        },
        object: 'list',
        uri: '/api/instagram/profiles',
    }

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
            render(
                <InstagramSection
                    customer={mockCustomer}
                    userInstaData={undefined}
                />,
            )

            const igLink = screen.getByRole('link', { name: /@test_user/ })
            expect(igLink).toBeInTheDocument()
            expect(igLink).toHaveAttribute('href', '/#')
        })

        it('should log segment event and open Instagram profile when clicking handle', async () => {
            const user = userEvent.setup()
            render(
                <InstagramSection
                    customer={mockCustomer}
                    userInstaData={undefined}
                />,
            )

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
            render(
                <InstagramSection
                    customer={mockCustomer}
                    userInstaData={undefined}
                />,
            )

            expect(screen.queryByText('Following:')).not.toBeInTheDocument()
            expect(screen.queryByText(/followers/)).not.toBeInTheDocument()
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
            render(
                <InstagramSection
                    customer={mockCustomer}
                    userInstaData={mockInstagramData}
                />,
            )

            const igLink = screen.getByRole('link', { name: /@test_user/ })
            expect(igLink).toBeInTheDocument()
            expect(igLink).toHaveAttribute('href', '/#')
        })

        it('should log segment event and open Instagram profile when clicking handle', async () => {
            const user = userEvent.setup()
            render(
                <InstagramSection
                    customer={mockCustomer}
                    userInstaData={mockInstagramData}
                />,
            )

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
            render(
                <InstagramSection
                    customer={mockCustomer}
                    userInstaData={mockInstagramData}
                />,
            )

            expect(screen.getByText(/Following:/)).toBeInTheDocument()
            expect(screen.getByText(/Follower:/)).toBeInTheDocument()
            expect(screen.getByText('14.7k followers')).toBeInTheDocument()
        })

        it('should render verified badge icon', () => {
            render(
                <InstagramSection
                    customer={mockCustomer}
                    userInstaData={mockInstagramData}
                />,
            )

            const verifiedIcon = screen.getByRole('img', {
                name: 'wavy-check',
            })
            expect(verifiedIcon).toBeInTheDocument()
        })

        describe('follower count formatting', () => {
            it('should format follower count < 1000 as exact number', () => {
                const dataWith500Followers: ListInstagramProfiles200 = {
                    ...mockInstagramData,
                    data: [
                        {
                            ...mockInstagramData.data[0],
                            total_followers: 500,
                        },
                    ],
                }
                render(
                    <InstagramSection
                        customer={mockCustomer}
                        userInstaData={dataWith500Followers}
                    />,
                )

                expect(screen.getByText('500 followers')).toBeInTheDocument()
            })

            it('should format follower count 1k-9.9k with one decimal place', () => {
                const dataWith5500Followers: ListInstagramProfiles200 = {
                    ...mockInstagramData,
                    data: [
                        {
                            ...mockInstagramData.data[0],
                            total_followers: 5500,
                        },
                    ],
                }
                render(
                    <InstagramSection
                        customer={mockCustomer}
                        userInstaData={dataWith5500Followers}
                    />,
                )

                expect(screen.getByText('5.5k followers')).toBeInTheDocument()
            })

            it('should format follower count 10k-99.9k with one decimal place', () => {
                const dataWith14700Followers: ListInstagramProfiles200 = {
                    ...mockInstagramData,
                    data: [
                        {
                            ...mockInstagramData.data[0],
                            total_followers: 14700,
                        },
                    ],
                }
                render(
                    <InstagramSection
                        customer={mockCustomer}
                        userInstaData={dataWith14700Followers}
                    />,
                )

                expect(screen.getByText('14.7k followers')).toBeInTheDocument()
            })

            it('should format follower count 100k-999k without decimal places', () => {
                const dataWith150000Followers: ListInstagramProfiles200 = {
                    ...mockInstagramData,
                    data: [
                        {
                            ...mockInstagramData.data[0],
                            total_followers: 150000,
                        },
                    ],
                }
                render(
                    <InstagramSection
                        customer={mockCustomer}
                        userInstaData={dataWith150000Followers}
                    />,
                )

                expect(screen.getByText('150k followers')).toBeInTheDocument()
            })

            it('should format follower count 1M-9.9M with one decimal place', () => {
                const dataWith1500000Followers: ListInstagramProfiles200 = {
                    ...mockInstagramData,
                    data: [
                        {
                            ...mockInstagramData.data[0],
                            total_followers: 1500000,
                        },
                    ],
                }
                render(
                    <InstagramSection
                        customer={mockCustomer}
                        userInstaData={dataWith1500000Followers}
                    />,
                )

                expect(screen.getByText('1.5M followers')).toBeInTheDocument()
            })

            it('should format follower count 10M+ without decimal places', () => {
                const dataWith15000000Followers: ListInstagramProfiles200 = {
                    ...mockInstagramData,
                    data: [
                        {
                            ...mockInstagramData.data[0],
                            total_followers: 15000000,
                        },
                    ],
                }
                render(
                    <InstagramSection
                        customer={mockCustomer}
                        userInstaData={dataWith15000000Followers}
                    />,
                )

                expect(screen.getByText('15M followers')).toBeInTheDocument()
            })

            it('should remove trailing .0 from formatted numbers', () => {
                const dataWith5000Followers: ListInstagramProfiles200 = {
                    ...mockInstagramData,
                    data: [
                        {
                            ...mockInstagramData.data[0],
                            total_followers: 5000,
                        },
                    ],
                }
                render(
                    <InstagramSection
                        customer={mockCustomer}
                        userInstaData={dataWith5000Followers}
                    />,
                )

                expect(screen.getByText('5k followers')).toBeInTheDocument()
            })
        })
    })
})
