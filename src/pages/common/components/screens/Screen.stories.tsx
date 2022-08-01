import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import Screens from './Screens'
import Screen from './Screen'

const storyConfig: Meta = {
    title: 'General/screens/Screen',
    component: Screen,
    parameters: {
        docs: {
            description: {
                component:
                    'Screen allows users to conditionally render content while controlling a wrapper Screens component',
            },
        },
    },
}

const Template: Story<ComponentProps<typeof Screen>> = (props) => (
    <Screens activeScreen="artemis">
        <Screen {...props}>
            The current screen is "{props.name}" <br />
            <span>
                Screen allows users to conditionally render content while
                controlling a wrapper Screens component.
            </span>
        </Screen>
    </Screens>
)

export const Default = Template.bind({})
Default.args = {
    name: 'artemis',
}

export default storyConfig
