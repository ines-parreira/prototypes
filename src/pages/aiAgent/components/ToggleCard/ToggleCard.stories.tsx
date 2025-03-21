import { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import { ToggleCard } from './ToggleCard'

const storyConfig: Meta = {
    title: 'Ai Agent/Onboarding/ToggleCard',
    component: ToggleCard,
    argTypes: {
        checked: { control: 'boolean' },
        title: { control: 'text' },
        subtitle: { control: 'text' },
        style: { control: 'object' },
        children: { control: 'text' },
    },
} as Meta

const Template: Story<ComponentProps<typeof ToggleCard>> = (args) => (
    <ToggleCard {...args}></ToggleCard>
)

export const Default = Template.bind({})
Default.args = {
    checked: true,
    onChange: (current) => !current,
    title: 'Toggle Card',
    subtitle: '',
    style: {},
}

export const Enabled = Template.bind({})
Enabled.args = {
    checked: true,
    onChange: (current) => !current,
    title: 'Toggle Card',
    subtitle: 'Subtitle',
    style: {},
}

export const Disabled = Template.bind({})
Disabled.args = {
    checked: false,
    onChange: (current) => !current,
    title: 'Toggle Card',
    subtitle: 'Subtitle',
    style: {},
}

export const WithContent = Template.bind({})
WithContent.args = {
    checked: true,
    onChange: (current) => !current,
    title: 'Toggle Card',
    subtitle: 'Subtitle',
    children: `I'm a child content`,
    style: {},
}

export default storyConfig
