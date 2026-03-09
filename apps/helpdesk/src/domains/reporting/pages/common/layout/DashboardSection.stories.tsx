import type { ComponentProps } from 'react'
import { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import TipsToggle from 'pages/common/components/TipsToggle/TipsToggle'

const storyConfig: Meta<typeof DashboardSection> = {
    title: 'Stats/DashboardSection',
    component: DashboardSection,
}

type Story = StoryObj<typeof DashboardSection>

const Template: Story = {
    render: (props) => <DashboardSection {...props} />,
}

const defaultProps: ComponentProps<typeof DashboardSection> = {
    className: '',
    title: 'Title section',
    children: 'Content section',
}

export const Default = {
    ...Template,
    args: defaultProps,
}

const WithTitleExtraTemplate: Story = {
    render: function WithTitleExtra(props) {
        const [isVisible, setIsVisible] = useState(true)

        return (
            <DashboardSection
                {...props}
                titleExtra={
                    <TipsToggle isVisible={isVisible} onClick={setIsVisible} />
                }
            />
        )
    },
}

export const WithTitleExtra = {
    ...WithTitleExtraTemplate,
    args: { ...defaultProps },
}

export default storyConfig
