import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'

import personAvatarUrl from 'assets/img/avatar-example.png'

import Avatar from './Avatar'

const storyConfig: Meta = {
    title: 'General/Avatar',
    component: Avatar,
    argTypes: {
        url: {
            control: {
                type: 'text',
            },
        },
    },
}

const AllSizesTemplate: Story<ComponentProps<typeof Avatar>> = ({...props}) => (
    <div style={{display: 'flex', gap: 24, alignItems: 'flex-start'}}>
        {[24, 36, 48, 100].map((size) => (
            <Avatar key={size} {...props} size={size} />
        ))}
    </div>
)

export const WithImage = AllSizesTemplate.bind({})
WithImage.args = {
    name: 'John Born',
    url: personAvatarUrl,
    shape: 'round',
}

export const WithImageSquared = AllSizesTemplate.bind({})
WithImageSquared.args = {
    name: 'John Born',
    url: personAvatarUrl,
    shape: 'square',
}

export const WithInitials = AllSizesTemplate.bind({})
WithInitials.args = {
    name: 'John Born',
    shape: 'round',
}

export const WithInitialsSquared = AllSizesTemplate.bind({})
WithInitialsSquared.args = {
    name: 'John Born',
    shape: 'square',
}

const TwoAvatarsTemplate: Story<ComponentProps<typeof Avatar>> = ({
    ...props
}) => (
    <div style={{display: 'flex', gap: 24, alignItems: 'flex-start'}}>
        <Avatar url={personAvatarUrl} {...props} />
        <Avatar {...props} />
    </div>
)

export const WithStatus: Story<ComponentProps<typeof Avatar>> =
    TwoAvatarsTemplate.bind({})

WithStatus.args = {
    size: 48,
    name: 'John Born',
    shape: 'round',
    badgeColor: '#24D69D',
    badgeBorderColor: 'transparent',
}

export const WithStatusSquared: Story<ComponentProps<typeof Avatar>> =
    TwoAvatarsTemplate.bind({})

WithStatusSquared.args = {
    size: 48,
    name: 'John Born',
    shape: 'square',
    badgeColor: '#24D69D',
    badgeBorderColor: 'transparent',
}

export const WithStatusAndToltip: Story<ComponentProps<typeof Avatar>> =
    TwoAvatarsTemplate.bind({})

WithStatusAndToltip.args = {
    size: 48,
    name: 'John Born',
    shape: 'round',
    badgeColor: '#24D69D',
    badgeBorderColor: 'transparent',
    withTooltip: true,
    tooltipText: 'Online',
}

export default storyConfig
