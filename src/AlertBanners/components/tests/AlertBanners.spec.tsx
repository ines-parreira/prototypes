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
import { AlertBanner } from '../AlertBanner'
import AlertBanners from '../AlertBanners'

jest.mock('notifications/hooks/useLegacyAlertBanners', () => jest.fn())
jest.mock('../../Context', () => ({
    ...jest.requireActual<Record<string, unknown>>('../../Context'),
    useBannersContext: jest.fn(),
}))
jest.mock('../AlertBanner', () => ({ AlertBanner: jest.fn(() => null) }))
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const useLegacyAlertBannersMock = assumeMock(useLegacyAlertBanners)
const useBannersContextMock = assumeMock(useBannersContext)
const mockUseFlag = useFlag as jest.Mock

const legacyBanner: BannerNotification = {
    id: '1',
    message: 'Test',
    type: AlertBannerTypes.Critical,
    style: NotificationStyle.Banner,
}

const banner: ContextBanner = {
    category: BannerCategories.IMPERSONATION,
    instanceId: '1',
    message: 'Test',
}

describe('<AlertBanners/>', () => {
    const legacyBanners: BannerNotification[] = [
        legacyBanner,
        { ...legacyBanner, id: '2' },
    ]
    const contextBanners = [banner, { ...banner, instanceId: '2' }]

    beforeEach(() => {
        useLegacyAlertBannersMock.mockReturnValue(legacyBanners)
        useBannersContextMock.mockReturnValue(contextBanners)
    })

    describe('when carousel flag is ON', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
        })

        it('should render banners in carousel mode', () => {
            render(<AlertBanners />)

            expect(AlertBanner).toHaveBeenCalledTimes(2)
            expect(AlertBanner).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.any(String),
                    prefix: expect.any(Object),
                    type: expect.any(String),
                }),
                {},
            )
        })
    })

    describe('when carousel flag is OFF', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(false)
            useLegacyAlertBannersMock.mockReturnValue(legacyBanners)
            useBannersContextMock.mockReturnValue(contextBanners)
        })

        it('should render all banners', () => {
            render(<AlertBanners />)

            expect(AlertBanner).toHaveBeenCalledTimes(8)
            expect(AlertBanner).toHaveBeenNthCalledWith(
                1,
                contextBanners[0],
                {},
            )
            expect(AlertBanner).toHaveBeenNthCalledWith(
                2,
                contextBanners[1],
                {},
            )
            expect(AlertBanner).toHaveBeenNthCalledWith(3, legacyBanners[0], {})
            expect(AlertBanner).toHaveBeenNthCalledWith(4, legacyBanners[1], {})
        })
    })
})
