import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'

import UpgradeIcon from './UpgradeIcon'

const storyConfig: Meta = {
    title: 'General/Icons/Upgrade icon',
    component: UpgradeIcon,
}

const Template: Story<ComponentProps<typeof UpgradeIcon>> = (props) => (
    <UpgradeIcon {...props} />
)

const defaultProps = {}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
