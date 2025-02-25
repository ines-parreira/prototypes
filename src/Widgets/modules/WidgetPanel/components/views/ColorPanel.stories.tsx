import { Meta, StoryObj } from '@storybook/react'

import ColorPanel from './ColorPanel'

const meta: Meta = {
    title: 'Infobar/ColorPanel',
    component: ColorPanel,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
    args: {
        accentColor: 'red',
        children: 'ColorPanel component',
    },
    argTypes: {
        accentColor: { control: 'color' },
    },
}

export default meta

export const Panel: StoryObj = {}
