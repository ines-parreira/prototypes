import React, { ComponentProps, useState } from 'react'

import { Meta, Story } from '@storybook/react'

import TipsToggle from 'pages/common/components/TipsToggle/TipsToggle'

import DashboardSection from './DashboardSection'

const storyConfig: Meta = {
    title: 'Stats/DashboardSection',
    component: DashboardSection,
}

const Template: Story<ComponentProps<typeof DashboardSection>> = (props) => (
    <DashboardSection {...props} />
)

const defaultProps: ComponentProps<typeof DashboardSection> = {
    className: '',
    title: 'Title section',
    children: 'Content section',
}

export const Default = Template.bind({})
Default.args = defaultProps

const WithTitleExtraTemplate: Story<ComponentProps<typeof DashboardSection>> = (
    props,
) => {
    const [isVisible, setIsVisible] = useState(true)

    return (
        <DashboardSection
            {...props}
            titleExtra={
                <TipsToggle isVisible={isVisible} onClick={setIsVisible} />
            }
        />
    )
}

export const WithTitleExtra = WithTitleExtraTemplate.bind({})
WithTitleExtra.args = {
    ...defaultProps,
}

export default storyConfig
