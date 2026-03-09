import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import Screen from './Screen'
import Screens from './Screens'

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

const Template: StoryObj<typeof Screen> = {
    render: (props) => (
        <Screens activeScreen="artemis">
            <Screen {...props}>
                {`The current screen is "${props.name}"`} <br />
                <span>
                    Screen allows users to conditionally render content while
                    controlling a wrapper Screens component.
                </span>
            </Screen>
        </Screens>
    ),
}

export const Default = {
    ...Template,
    args: {
        name: 'artemis',
    },
}

export default storyConfig
