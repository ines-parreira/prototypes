import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'
import _noop from 'lodash/noop'

import {NotificationStatus} from '../../../../state/notifications/types'

import BannerNotification from './BannerNotification'

const storyConfig: Meta = {
    title: 'Feedback/BannerNotification',
    component: BannerNotification,
    argTypes: {
        status: {
            control: {
                type: 'select',
            },
        },
    },
}

const Template: Story<ComponentProps<typeof BannerNotification>> = (props) => (
    <BannerNotification {...props} />
)

const defaultProps = {
    hide: _noop,
    status: NotificationStatus.Info,
}

export const Primary = Template.bind({})
Primary.args = {
    ...defaultProps,
    message: 'Storybook notification',
}

export const Closable = Template.bind({})
Closable.args = {
    ...defaultProps,
    closable: true,
    message: 'Storybook notification',
}

export const HTMLContent = Template.bind({})
HTMLContent.args = {
    ...defaultProps,
    allowHTML: true,
    message: '<i>This is HTML!</i>',
}

export default storyConfig
