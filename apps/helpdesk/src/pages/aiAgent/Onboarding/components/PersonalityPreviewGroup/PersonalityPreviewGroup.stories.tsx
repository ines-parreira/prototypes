import type { ComponentProps } from 'react'
import React, { useState } from 'react'

import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import type { PreviewId } from './constants'
import { getPreviewsForPreviewType } from './constants'
import { PersonalityPreviewGroup } from './PersonalityPreviewGroup'

const storyConfig: Meta<typeof PersonalityPreviewGroup> = {
    title: 'AI Agent/Onboarding/PersonalityPreviewGroup',
    component: PersonalityPreviewGroup,
}

const Template: StoryFn<ComponentProps<typeof PersonalityPreviewGroup>> = (
    args,
) => {
    const [selectedPreviewId, setSelectedPreviewId] = useState<
        PreviewId | undefined
    >(args.selectedPreviewId)
    return (
        <PersonalityPreviewGroup
            {...args}
            selectedPreviewId={selectedPreviewId}
            onPreviewSelect={({ id }) => setSelectedPreviewId(id)}
        />
    )
}

export const Default = Template.bind({})
Default.args = {
    previewType: 'mixed',
}

export const SecondSelected = Template.bind({})
SecondSelected.args = {
    previewType: 'mixed',
    selectedPreviewId: getPreviewsForPreviewType('mixed')[1].id,
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
