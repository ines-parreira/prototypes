import type { Meta, StoryObj } from 'storybook-react-rsbuild'

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

const Template: StoryObj<typeof ToggleCard> = {
    render: function Template(args) {
        return <ToggleCard {...args}></ToggleCard>
    },
}

export const Default = {
    ...Template,
    args: {
        checked: true,
        onChange: (current: boolean) => !current,
        title: 'Toggle Card',
        subtitle: '',
        style: {},
    },
}

export const Enabled = {
    ...Template,
    args: {
        checked: true,
        onChange: (current: boolean) => !current,
        title: 'Toggle Card',
        subtitle: 'Subtitle',
        style: {},
    },
}

export const Disabled = {
    ...Template,
    args: {
        checked: false,
        onChange: (current: boolean) => !current,
        title: 'Toggle Card',
        subtitle: 'Subtitle',
        style: {},
    },
}

export const WithContent = {
    ...Template,
    args: {
        checked: true,
        onChange: (current: boolean) => !current,
        title: 'Toggle Card',
        subtitle: 'Subtitle',
        children: `I'm a child content`,
        style: {},
    },
}

export default storyConfig
