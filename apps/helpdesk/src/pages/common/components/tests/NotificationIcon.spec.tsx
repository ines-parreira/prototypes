import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@repo/testing'
import _omit from 'lodash/omit'
import { STATUSES } from 'reapop'

import { theme as notificationsTheme } from '../../components/Notifications'
import { NotificationIcon } from '../NotificationIcon'

describe('<NotificationIcon />', () => {
    it.each(Object.values(_omit(STATUSES, STATUSES.none)))(
        'should render an icon for %s notification type',
        (status) => {
            const notification = {
                status: status,
            } as unknown as ComponentProps<
                typeof NotificationIcon
            >['notification']

            const { container } = render(
                <NotificationIcon notification={notification} />,
            )
            expect(container.firstChild).toMatchSnapshot()
        },
    )

    it('should render with custom theme', () => {
        const notification = {
            status: STATUSES.info,
        } as unknown as ComponentProps<typeof NotificationIcon>['notification']

        const { container } = render(
            <NotificationIcon
                notification={notification}
                theme={notificationsTheme}
            />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
