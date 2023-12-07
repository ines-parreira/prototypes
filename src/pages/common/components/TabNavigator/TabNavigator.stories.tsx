import React, {ComponentProps, useState} from 'react'
import {Meta, Story} from '@storybook/react'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useUpdateEffect} from 'react-use'

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
