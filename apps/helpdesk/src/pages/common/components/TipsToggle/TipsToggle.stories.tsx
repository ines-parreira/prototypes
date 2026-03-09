import type { ComponentProps } from 'react'
import { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import TipsToggle from './TipsToggle'

const storyConfig: Meta = {
    title: 'Stats/TipsToggle',
    component: TipsToggle,
}

type TemplateProps = ComponentProps<typeof TipsToggle>

const Template: StoryObj<TemplateProps> = {
    render: function Template({ isVisible, onClick, ...other }) {
        const [isVisibleLocal, setIsVisibleLocal] = useState(isVisible)

        return (
            <TipsToggle
                {...other}
                isVisible={isVisibleLocal}
                onClick={() => {
                    setIsVisibleLocal(!isVisibleLocal)
                    onClick(!isVisibleLocal)
                }}
            />
        )
    },
}

const defaultProps: Partial<ComponentProps<typeof TipsToggle>> = {
    className: '',
    isVisible: true,
}

export const Default = {
    ...Template,
    args: defaultProps,
    argTypes: {
        onClick: {
            action: 'Clicked !',
        },
    },
}

export default storyConfig
