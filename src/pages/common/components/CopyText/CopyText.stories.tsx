import { Meta, StoryObj } from '@storybook/react'

import CopyText, { CopyTextProps } from './CopyText'

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
