import {Meta, StoryFn} from '@storybook/react'
import React, {ComponentProps, useState} from 'react'

import {PersonalityPreviewGroup} from './PersonalityPreviewGroup'

const storyConfig: Meta<typeof PersonalityPreviewGroup> = {
    title: 'AI Agent/Onboarding/PersonalityPreviewGroup',
    component: PersonalityPreviewGroup,
}

const Template: StoryFn<ComponentProps<typeof PersonalityPreviewGroup>> = (
    args
) => {
    const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<
        number | undefined
    >(args.selectedPreviewIndex)
    return (
        <PersonalityPreviewGroup
            {...args}
            selectedPreviewIndex={selectedPreviewIndex}
            onPreviewSelect={(_, index) => setSelectedPreviewIndex(index)}
        />
    )
}

export const Default = Template.bind({})
Default.args = {
    previewType: 'mixed',
}

export const FirstSelected = Template.bind({})
FirstSelected.args = {
    previewType: 'mixed',
    selectedPreviewIndex: 0,
}

export const Sales = Template.bind({})
Sales.args = {
    previewType: 'sales',
}

export const Support = Template.bind({})
Support.args = {
    previewType: 'support',
}

export const Loading = Template.bind({})
Loading.args = {
    previewType: 'support',
    isLoading: true,
}

export default storyConfig
