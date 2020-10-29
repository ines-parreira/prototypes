import {shallow} from 'enzyme'
import React, {ComponentProps} from 'react'

import BannerNotification from '../BannerNotification'
import {NotificationStatus} from '../../../../../state/notifications/types'

describe('<BannerNotification/>', () => {
    const minProps = ({
        id: 1,
        status: NotificationStatus.Success,
        message: 'foobar',
        hide: jest.fn(),
        allowHTML: false,
    } as unknown) as ComponentProps<typeof BannerNotification>

    it('should render', () => {
        const component = shallow(<BannerNotification {...minProps} />)

        expect(component).toMatchSnapshot()
    })

    it('should render html message', () => {
        const component = shallow(
            <BannerNotification
                {...minProps}
                allowHTML
                message={<div>foo</div>}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
