import {Meta, Story} from '@storybook/react'
import React, {ComponentProps, useEffect, useState} from 'react'

import ToggleInput from 'pages/common/forms/ToggleInput'

import Collapse from './Collapse'

const storyConfig: Meta = {
    title: 'General/Collapse',
    component: Collapse,
    argTypes: {
        children: {
            table: {
                disable: true,
            },
        },
    },
}

const Template: Story<ComponentProps<typeof Collapse>> = ({
    isOpen: isOpenProp = false,
}) => {
    const [isOpen, setIsOpen] = useState(isOpenProp)

    useEffect(() => {
        setIsOpen(isOpenProp)
    }, [isOpenProp])

    return (
        <>
            <ToggleInput isToggled={isOpen} onClick={setIsOpen} />
            <Collapse isOpen={isOpen}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
                vitae turpis sed diam luctus ultricies vitae sed ligula. In
                ullamcorper odio risus, non efficitur arcu posuere ut. In
                interdum vel orci sed pellentesque. Etiam ac arcu non mauris
                tempus congue id et mauris. Donec tincidunt tortor elit, et
                pretium neque semper sit amet. Etiam venenatis justo eros, sed
                efficitur sem egestas vitae. Fusce eleifend est ligula, nec
                bibendum nisl lacinia sit amet. Sed felis dui, tincidunt a
                mattis et, porta eu dui. Nam condimentum viverra ante eu
                sagittis. Sed pharetra metus in dolor accumsan aliquet. Morbi
                non ligula ac diam gravida sagittis id vel neque. Sed a
                ultricies sem. Phasellus bibendum enim sed tellus feugiat, quis
                vulputate odio dictum.
            </Collapse>
        </>
    )
}

export const Default = Template.bind({})
Default.args = {}

export default storyConfig
