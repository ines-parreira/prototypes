import {render} from '@testing-library/react'
import React from 'react'

import useLegacyAlertBanners from 'notifications/hooks/useLegacyAlertBanners'
import {BannerNotification, NotificationStyle} from 'state/notifications/types'
import {assumeMock} from 'utils/testing'

import {useBannerContext} from '../../context/BannerContext'
import {AlertBannerTypes, BannerCategories, ContextBanner} from '../../types'
import {AlertBanner} from '../AlertBanner'
import AlertBanners from '../AlertBanners'

jest.mock('notifications/hooks/useLegacyAlertBanners', () => jest.fn())
jest.mock('../../context/BannerContext', () => ({
    ...jest.requireActual<Record<string, unknown>>(
        '../../context/BannerContext'
    ),
    useBannerContext: jest.fn(),
}))
jest.mock('../AlertBanner', () => ({AlertBanner: jest.fn(() => null)}))

const useLegacyAlertBannersMock = assumeMock(useLegacyAlertBanners)
const useBannerContextMock = assumeMock(useBannerContext)

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
        {...legacyBanner, id: '2'},
    ]
    beforeEach(() => {
        useLegacyAlertBannersMock.mockReturnValue(legacyBanners)
        useBannerContextMock.mockReturnValue([
            banner,
            {...banner, instanceId: '2'},
        ])
    })

    it('should call `AlertBanner` accordingly with correct props', () => {
        render(<AlertBanners />)

        expect(AlertBanner).toHaveBeenCalledTimes(4)
        expect(AlertBanner).toHaveBeenNthCalledWith(1, banner, {})
        expect(AlertBanner).toHaveBeenNthCalledWith(
            2,
            {...banner, instanceId: '2'},
            {}
        )
        expect(AlertBanner).toHaveBeenNthCalledWith(3, legacyBanner, {})
        expect(AlertBanner).toHaveBeenNthCalledWith(
            4,
            {...legacyBanner, id: '2'},
            {}
        )
    })
})
