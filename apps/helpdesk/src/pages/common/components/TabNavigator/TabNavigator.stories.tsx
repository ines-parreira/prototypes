import type { ComponentProps } from 'react'
import { useState } from 'react'

import { useUpdateEffect } from '@repo/hooks'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import TabNavigator from 'pages/common/components/TabNavigator/TabNavigator'

const storyConfig: Meta = {
    title: 'General/TabNavigator',
    component: TabNavigator,
    globals: {
        backgrounds: {
            value: 'grey',
        },
    },
    argTypes: {
        tabs: {
            description: 'Tabs to render.',
            control: {
                type: 'object',
            },
        },
        activeTab: { description: 'Active tab for controlled navigator.' },
        className: { control: { type: 'text' } },
    },
}

const tabs = [
    { label: 'Tab one', value: 'one' },
    { label: 'Tab two', value: 'two' },
    { label: 'Tab three', value: 'three' },
]

const Template: StoryObj<typeof TabNavigator> = {
    render: function Template({ activeTab: passedActiveTab, ...props }) {
        const [activeTab, setActiveTab] = useState(passedActiveTab)

        useUpdateEffect(() => {
            passedActiveTab && setActiveTab(passedActiveTab)
        }, [passedActiveTab])

        return (
            <TabNavigator
                {...props}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
        )
    },
}

const defaultProps: Omit<
    ComponentProps<typeof TabNavigator>,
    'onTabChange' | 'activeTab'
> = {
    tabs,
}

const templateParameters = {
    controls: {
        include: ['activeTab'],
    },
}

export const ControlledTabNavigator = {
    ...Template,
    args: { ...defaultProps, activeTab: 'one' },
    parameters: templateParameters,
}

export default storyConfig
