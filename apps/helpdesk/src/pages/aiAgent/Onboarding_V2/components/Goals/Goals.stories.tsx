import type { ComponentProps } from 'react'
import React, { useState } from 'react'

import type { Meta, StoryFn } from '@storybook/react'

import { AiAgentScopes } from 'pages/aiAgent/Onboarding_V2/types'

import Goals from './Goals'

const storyConfig: Meta<typeof Goals> = {
    title: 'AI Agent/Onboarding_V2/Goals',
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
