import type { ComponentProps } from 'react'
import React, { useState } from 'react'

import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { AiAgentScopes } from 'pages/aiAgent/Onboarding/types'

import Goals from './Goals'

const storyConfig: Meta<typeof Goals> = {
    title: 'AI Agent/Onboarding/Goals',
    component: Goals,
}

const Template: StoryFn<ComponentProps<typeof Goals>> = () => {
    const [selected, setSelected] = useState<AiAgentScopes[]>([
        AiAgentScopes.SUPPORT,
    ])
    return <Goals value={selected} onSelect={setSelected} />
}

export const Default = Template.bind({})
Default.args = {}

export default storyConfig
