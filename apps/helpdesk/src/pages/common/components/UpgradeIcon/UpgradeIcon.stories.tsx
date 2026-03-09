import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import UpgradeIcon from './UpgradeIcon'

const storyConfig: Meta = {
    title: 'General/Icons/Upgrade icon',
    component: UpgradeIcon,
}

type TemplateProps = ComponentProps<typeof UpgradeIcon>

const Template: StoryObj<TemplateProps> = {
    render: function Template({ ...props }) {
        return <UpgradeIcon {...props} />
    },
}

const defaultProps = {}

export const Default = {
    ...Template,
    args: defaultProps,
}

export default storyConfig
