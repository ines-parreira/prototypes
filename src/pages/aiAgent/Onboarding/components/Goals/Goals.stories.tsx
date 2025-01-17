import {Meta, StoryFn} from '@storybook/react'
import React, {ComponentProps, useState} from 'react'

import Goals from './Goals'

const storyConfig: Meta<typeof Goals> = {
    title: 'AI Agent/Onboarding/Goals',
    component: Goals,
}

const Template: StoryFn<ComponentProps<typeof Goals>> = () => {
    const [selected, setSelected] = useState<string | null>(null)
    return <Goals value={selected} onSelect={setSelected} />
}

export const Default = Template.bind({})
Default.args = {}

export default storyConfig
