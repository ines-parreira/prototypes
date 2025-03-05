import React from 'react'

import { render } from '@testing-library/react'

import { useFlag } from 'core/flags'
import useLegacyAlertBanners from 'notifications/hooks/useLegacyAlertBanners'
import {
    BannerNotification,
    NotificationStyle,
} from 'state/notifications/types'
import { assumeMock } from 'utils/testing'

import { useBannersContext } from '../../Context'
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

const useLegacyAlertBannersMock = assumeMock(useLegacyAlertBanners)
const useBannersContextMock = assumeMock(useBannersContext)
const mockUseFlag = useFlag as jest.Mock

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
        useLegacyAlertBannersMock.mockReturnValue(legacyBanners)
        useBannersContextMock.mockReturnValue(contextBanners)
    })

    describe('when carousel flag is ON', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
        })

        it('should render banner from 0 index in carousel mode', async () => {
            const { getByText } = render(<AlertBanners />)

            expect(getByText(legacyBanners[0].message as string)).toBeTruthy()
        })

        it('should not render banners if there are no banners', () => {
            useBannersContextMock.mockReturnValue([])
            useLegacyAlertBannersMock.mockReturnValue([])
            const { queryByText } = render(<AlertBanners />)
            expect(queryByText(legacyBanners[0].message as string)).toBeFalsy()
            expect(queryByText(contextBanners[0].message as string)).toBeFalsy()
        })

        it('should render impersonation banner if there is no context banner', () => {
            useBannersContextMock.mockReturnValue([banner])
            useLegacyAlertBannersMock.mockReturnValue([])
            const { getByText } = render(<AlertBanners />)
            expect(getByText(contextBanners[0].message as string)).toBeTruthy()
        })

        it('should render banner with CTA when provided', () => {
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

            const { queryByText } = render(<AlertBanners />)

            expect(queryByText('Test Banner')).toBeTruthy()
            expect(queryByText('Click Me')).toBeFalsy()
        })
    })

    describe('when carousel flag is OFF', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(false)
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
            useBannersContextMock.mockReturnValue([
                {
                    category: BannerCategories.IMPERSONATION,
                    instanceId: '1',
                    message: 'Test Context Banner',
                    CTA: {
                        type: 'action',
                        text: 'test cta',
                        onClick: jest.fn(),
                    },
                },
            ])
            useLegacyAlertBannersMock.mockReturnValue([])

            const { getAllByText } = render(<AlertBanners />)
            expect(
                getAllByText(contextBanners[0].message as string),
            ).toHaveLength(1)
        })
    })
})
