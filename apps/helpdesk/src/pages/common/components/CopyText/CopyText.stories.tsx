import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import type { CopyTextProps } from './CopyText'
import CopyText from './CopyText'

const storyConfig: Meta = {
    title: 'General/CopyText',
    component: CopyText,
    argTypes: {
        children: {
            table: {
                disable: true,
            },
        },
    },
}

const Template: StoryObj<CopyTextProps> = {
    render: function Template() {
        return <CopyText text="Copy this text" />
    },
}

export const Default = {
    ...Template,
    args: {},
}
export default storyConfig
