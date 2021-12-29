import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {STATUSES} from 'reapop'
import _omit from 'lodash/omit'

import notificationsTheme from '../../components/Notifications'
import {NotificationIcon} from '../NotificationIcon'

describe('<NotificationIcon />', () => {
    it.each(Object.values(_omit(STATUSES, STATUSES.none)))(
        'should render an icon for %s notification type',
        (status) => {
            const notification = {
                status: status,
            } as unknown as ComponentProps<
                typeof NotificationIcon
            >['notification']

            const {container} = render(
                <NotificationIcon notification={notification} />
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it('should render with custom theme', () => {
        const notification = {
            status: STATUSES.info,
        } as unknown as ComponentProps<typeof NotificationIcon>['notification']

        const {container} = render(
            <NotificationIcon
                notification={notification}
                theme={notificationsTheme}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
