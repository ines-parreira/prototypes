import type { ComponentProps } from 'react'

import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import CheckboxCard from './CheckboxCard'

const storyConfig: Meta = {
    title: 'General/CheckboxCard',
    component: CheckboxCard,
    argTypes: {
        title: {
            control: 'text',
        },
        description: {
            control: 'text',
        },
        icon: {
            control: 'text',
        },
        checked: {
            control: 'boolean',
        },
        onChange: {
            action: 'onChange',
        },
        onClick: {
            action: 'onClick',
        },
        onKeyDown: {
            action: 'onKeyDown',
        },
    },
}

const defaultArgs = {
    title: 'Checkbox Card',
    description: 'Checkbox Card Description',
    icon: 'work',
}
const Template: StoryFn<ComponentProps<typeof CheckboxCard>> = (props: any) => (
    <CheckboxCard {...props} />
)

export const Default = Template.bind({})
Default.args = defaultArgs

export const Checked = Template.bind({})
Checked.args = {
    ...defaultArgs,
    checked: true,
}

export default storyConfig
