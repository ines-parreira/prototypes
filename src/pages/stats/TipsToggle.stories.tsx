import React, { ComponentProps, useState } from 'react'

import { Meta, Story } from '@storybook/react'

import TipsToggle from './TipsToggle'

const storyConfig: Meta = {
    title: 'Stats/TipsToggle',
    component: TipsToggle,
}

const Template: Story<ComponentProps<typeof TipsToggle>> = ({
    isVisible,
    onClick,
    ...other
}) => {
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
}

const defaultProps: Partial<ComponentProps<typeof TipsToggle>> = {
    className: '',
    isVisible: true,
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.argTypes = {
    onClick: {
        action: 'Clicked !',
    },
}

export default storyConfig
