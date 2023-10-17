import {render} from '@testing-library/react'
import React from 'react'

import LegacyBannerNotifications from 'pages/common/components/BannerNotifications/BannerNotifications'

import useBannerNotifications from '../../hooks/useBannerNotifications'
import BannerNotifications from '../BannerNotifications'

jest.mock(
    'pages/common/components/BannerNotifications/BannerNotifications',
    () => jest.fn()
)

jest.mock('../../hooks/useBannerNotifications', () => jest.fn())

const LegacyBannerNotificationsMock =
    LegacyBannerNotifications as unknown as jest.Mock
const useBannerNotificationsMock = useBannerNotifications as jest.Mock

describe('BannerNotifications', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        useBannerNotificationsMock.mockReturnValue([
            {style: 'banner', id: 1},
            {style: 'banner', id: 2},
        ])
        LegacyBannerNotificationsMock.mockReturnValue(
            <div>BannerNotifications</div>
        )
    })

    it('should render banner notifications', () => {
        const {getByText} = render(<BannerNotifications />)

        expect(LegacyBannerNotificationsMock).toHaveBeenCalledWith(
            {
                notifications: [
                    {style: 'banner', id: 1},
                    {style: 'banner', id: 2},
                ],
            },
            expect.any(Object)
        )
        expect(getByText('BannerNotifications')).toBeInTheDocument()
    })
})
