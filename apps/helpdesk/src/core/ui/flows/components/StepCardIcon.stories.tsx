import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import type { IconName } from '@gorgias/axiom'

import { StepCardIcon } from './StepCardIcon'

const colors = [
    'blue',
    'coral',
    'fuchsia',
    'purple',
    'orange',
    'green',
    'yellow',
    'teal',
] as const

const meta: Meta<typeof StepCardIcon> = {
    title: 'Common/Flows/StepCardIcon',
    component: StepCardIcon,
    argTypes: {
        backgroundColor: {
            control: { type: 'select' },
            options: colors,
            description: 'Color of the background, used for styling',
        },
        name: {
            control: { type: 'text' },
            description: 'Icon name from @gorgias/axiom',
        },
    },
}

export default meta

type Story = StoryObj<typeof StepCardIcon>

export const Default: Story = {
    args: {
        backgroundColor: 'blue',
        name: 'comm-phone' as IconName,
    },
}

export const VoiceFlowIcons: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: '16px' }}>
            <StepCardIcon backgroundColor="purple" name="clock" />
            <StepCardIcon
                backgroundColor="fuchsia"
                name="search-magnifying-glass"
            />
            <StepCardIcon backgroundColor="blue" name="media-play-circle" />
            <StepCardIcon backgroundColor="teal" name="comm-ivr" />
            <StepCardIcon backgroundColor="orange" name="arrow-routing" />
            <StepCardIcon
                backgroundColor="coral"
                name="arrow-chevron-right-duo"
            />
            <StepCardIcon backgroundColor="green" name="comm-chat-dots" />
            <StepCardIcon backgroundColor="yellow" name="comm-voicemail" />
        </div>
    ),
}
