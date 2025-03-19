import { Meta, Story } from '@storybook/react'

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

const Template: Story<CopyTextProps> = () => {
    return <CopyText text="Copy this text" />
}

export const Default = Template.bind({})
Default.args = {}

export default storyConfig
