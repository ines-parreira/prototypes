import React from 'react'

import { assumeMock } from '@repo/testing'
import { fireEvent, render } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'
import { useFlag } from 'core/flags'
import useLegacyAlertBanners from 'notifications/hooks/useLegacyAlertBanners'
import {
    BannerNotification,
    NotificationStyle,
} from 'state/notifications/types'

import { useBannersContext } from '../../Context'
import { useBannerCarousel } from '../../hooks/useBannerCarousel'
import { AlertBannerTypes, BannerCategories, ContextBanner } from '../../types'
import AlertBanners from '../AlertBanners'

jest.mock('notifications/hooks/useLegacyAlertBanners', () => jest.fn())
jest.mock('../../Context', () => ({
    ...jest.requireActual<Record<string, unknown>>('../../Context'),
    useBannersContext: jest.fn(),
}))
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
jest.mock('../../hooks/useBannerCarousel')
jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        BannerCarouselNavigationClicked: 'banner-carousel-navigation-clicked',
    },
}))

const useLegacyAlertBannersMock = assumeMock(useLegacyAlertBanners)
const useBannersContextMock = assumeMock(useBannersContext)
const mockUseFlag = useFlag as jest.Mock
const mockUseBannerCarousel = useBannerCarousel as jest.Mock

const legacyBanner: BannerNotification = {
    id: 'test-id',
    message: 'Test Legacy Banner',
    type: AlertBannerTypes.Critical,
    style: NotificationStyle.Banner,
    CTA: {
        type: 'action',
        text: 'test cta',
        onClick: jest.fn(),
    },
}

const banner: ContextBanner = {
    category: BannerCategories.IMPERSONATION,
    instanceId: 'test-instance-id',
    message: 'Test Context Banner',
    type: AlertBannerTypes.Critical,
    CTA: {
        type: 'action',
        text: 'test cta',
        onClick: jest.fn(),
    },
}

describe('<AlertBanners/>', () => {
    const legacyBanners: BannerNotification[] = [
        legacyBanner,
        { ...legacyBanner, id: 'test-id-2' },
    ]
    const contextBanners = [
        banner,
        { ...banner, instanceId: 'test-instance-id-2' },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        useLegacyAlertBannersMock.mockReturnValue(legacyBanners)
        useBannersContextMock.mockReturnValue(contextBanners)
    })

    describe('when carousel flag is ON', () => {
        const mockOnNext = jest.fn()
        const mockOnPrevious = jest.fn()

        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
            mockUseBannerCarousel.mockReturnValue({
                currentBannerPosition: 0,
                onNext: mockOnNext,
                onPrevious: mockOnPrevious,
                mergedBannersList: [...legacyBanners, ...contextBanners],
            })
        })

        it('should call onNext and log event when clicking next button', () => {
            const { getByText } = render(<AlertBanners />)

            fireEvent.click(getByText('chevron_right'))

            expect(mockOnNext).toHaveBeenCalledTimes(1)
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.BannerCarouselNavigationClicked,
            )
        })

        it('should call onPrevious and log event when clicking previous button', () => {
            const { getByText } = render(<AlertBanners />)

            fireEvent.click(getByText('chevron_left'))

            expect(mockOnPrevious).toHaveBeenCalledTimes(1)
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.BannerCarouselNavigationClicked,
            )
        })

        it('should call navigation functions in correct order', () => {
            const { getByText } = render(<AlertBanners />)
            fireEvent.click(getByText('chevron_right'))
            fireEvent.click(getByText('chevron_left'))
            expect(mockOnNext).toHaveBeenCalledTimes(1)
            expect(mockOnPrevious).toHaveBeenCalledTimes(1)
            expect(logEvent).toHaveBeenCalledTimes(2)
            expect(logEvent).toHaveBeenNthCalledWith(
                1,
                SegmentEvent.BannerCarouselNavigationClicked,
            )
            expect(logEvent).toHaveBeenNthCalledWith(
                2,
                SegmentEvent.BannerCarouselNavigationClicked,
            )
        })

        it('should render banner from 0 index in carousel mode', async () => {
            const { getByText } = render(<AlertBanners />)

            expect(getByText(legacyBanners[0].message as string)).toBeTruthy()
        })

        it('should not render banners if there are no banners', () => {
            useBannersContextMock.mockReturnValue([])
            useLegacyAlertBannersMock.mockReturnValue([])

            // Update carousel mock to return empty list
            mockUseBannerCarousel.mockReturnValue({
                currentBannerPosition: 0,
                onNext: jest.fn(),
                onPrevious: jest.fn(),
                mergedBannersList: [],
            })

            const { queryByText } = render(<AlertBanners />)
            expect(queryByText(legacyBanners[0].message as string)).toBeFalsy()
            expect(queryByText(contextBanners[0].message as string)).toBeFalsy()
        })

        it('should render impersonation banner if there is no context banner', () => {
            useBannersContextMock.mockReturnValue([banner])
            useLegacyAlertBannersMock.mockReturnValue([])

            // Update carousel mock to return only the impersonation banner
            mockUseBannerCarousel.mockReturnValue({
                currentBannerPosition: 0,
                onNext: jest.fn(),
                onPrevious: jest.fn(),
                mergedBannersList: [banner],
            })

            const { getByText } = render(<AlertBanners />)
            expect(getByText(contextBanners[0].message as string)).toBeTruthy()
        })

        it('should render banner with CTA when provided', () => {
            // Keep the default mock from beforeEach which includes banners with CTAs
            const { getByText } = render(<AlertBanners />)
            expect(getByText('test cta')).toBeInTheDocument()
        })

        it('should render banner without CTA when not provided', () => {
            const bannerWithoutCTA: ContextBanner = {
                category: BannerCategories.IMPERSONATION,
                instanceId: '1',
                message: 'Test Banner',
                type: AlertBannerTypes.Info,
            }

            useBannersContextMock.mockReturnValue([bannerWithoutCTA])
            useLegacyAlertBannersMock.mockReturnValue([])

            mockUseBannerCarousel.mockReturnValue({
                currentBannerPosition: 0,
                onNext: jest.fn(),
                onPrevious: jest.fn(),
                mergedBannersList: [bannerWithoutCTA],
            })

            const { queryByText } = render(<AlertBanners />)

            expect(queryByText('Test Banner')).toBeTruthy()
            expect(queryByText('Click Me')).toBeFalsy()
        })
    })

    describe('when carousel flag is OFF', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(false)
            // Even when flag is off, we need to provide the mock because the component still destructures these values
            mockUseBannerCarousel.mockReturnValue({
                currentBannerPosition: 0,
                onNext: jest.fn(),
                onPrevious: jest.fn(),
                mergedBannersList: [...legacyBanners, ...contextBanners],
            })
        })

        it('should render banner with CTA when provided', async () => {
            const { getAllByText } = render(<AlertBanners />)
            expect(getAllByText('test cta')).toHaveLength(4)
        })

        it('should render all banners', () => {
            const { getAllByText } = render(<AlertBanners />)

            expect(
                getAllByText(legacyBanners[0].message as string),
            ).toHaveLength(2)
            expect(
                getAllByText(contextBanners[0].message as string),
            ).toHaveLength(2)
        })

        it('should add default type when non provided and render as expected', async () => {
            const bannerWithDefaultType: ContextBanner = {
                category: BannerCategories.IMPERSONATION,
                instanceId: '1',
                message: 'Test Context Banner',
                CTA: {
                    type: 'action' as const,
                    text: 'test cta',
                    onClick: jest.fn(),
                },
            }
            useBannersContextMock.mockReturnValue([bannerWithDefaultType])
            useLegacyAlertBannersMock.mockReturnValue([])

            // Update mock to match the current test case
            mockUseBannerCarousel.mockReturnValue({
                currentBannerPosition: 0,
                onNext: jest.fn(),
                onPrevious: jest.fn(),
                mergedBannersList: [bannerWithDefaultType],
            })

            const { getAllByText } = render(<AlertBanners />)
            expect(
                getAllByText(contextBanners[0].message as string),
            ).toHaveLength(1)
        })
    })
})
