import {Meta, Story} from '@storybook/react'
import React, {ComponentProps, useState} from 'react'

import useUpdateEffect from 'hooks/useUpdateEffect'
import TabNavigator from 'pages/common/components/TabNavigator/TabNavigator'

const storyConfig: Meta = {
    title: 'General/TabNavigator',
    component: TabNavigator,
    parameters: {
        backgrounds: {default: 'grey'},
    },
    argTypes: {
        tabs: {
            description: 'Tabs to render.',
            control: {
                type: null,
            },
        },
        activeTab: {description: 'Active tab for controlled navigator.'},
        className: {control: {type: null}},
    },
}

const tabs = [
    {label: 'Tab one', value: 'one'},
    {label: 'Tab two', value: 'two'},
    {label: 'Tab three', value: 'three'},
]

const Template: Story<ComponentProps<typeof TabNavigator>> = ({
    activeTab: passedActiveTab,
    ...props
}) => {
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
}

const defaultProps: Omit<
    ComponentProps<typeof TabNavigator>,
    'onTabChange' | 'activeTab'
> = {
    tabs,
}

export const ControlledTabNavigator = Template.bind({})
ControlledTabNavigator.args = {...defaultProps, activeTab: 'one'}

export default storyConfig
