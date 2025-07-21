import { Meta, StoryObj } from '@storybook/react'

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

const AllSizesTemplate: StoryObj<typeof Avatar> = {
    render: function AllSizesTemplate(props) {
        return (
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                {[24, 36, 48, 100].map((size) => (
                    <Avatar key={size} {...props} size={size} />
                ))}
            </div>
        )
    },
}

export const WithImage = {
    ...AllSizesTemplate,
    args: {
        name: 'John Born',
        url: personAvatarUrl,
        shape: 'round',
    },
}

export const WithImageSquared = {
    ...AllSizesTemplate,
    args: {
        name: 'John Born',
        url: personAvatarUrl,
        shape: 'square',
    },
}

export const WithInitials = {
    ...AllSizesTemplate,
    args: {
        name: 'John Born',
        shape: 'round',
    },
}

export const WithInitialsSquared = {
    ...AllSizesTemplate,
    args: {
        name: 'John Born',
        shape: 'square',
    },
}

const TwoAvatarsTemplate: StoryObj<typeof Avatar> = {
    render: function TwoAvatarsTemplate(props) {
        return (
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <Avatar url={personAvatarUrl} {...props} />
                <Avatar {...props} />
            </div>
        )
    },
}

export const WithStatus = {
    ...TwoAvatarsTemplate,
    args: {
        size: 48,
        name: 'John Born',
        shape: 'round',
        badgeColor: '#24D69D',
        badgeBorderColor: 'transparent',
    },
}

export const WithStatusSquared = {
    ...TwoAvatarsTemplate,
    args: {
        size: 48,
        name: 'John Born',
        shape: 'square',
        badgeColor: '#24D69D',
        badgeBorderColor: 'transparent',
    },
}

export const WithStatusAndToltip = {
    ...TwoAvatarsTemplate,
    args: {
        size: 48,
        name: 'John Born',
        shape: 'round',
        badgeColor: '#24D69D',
        badgeBorderColor: 'transparent',
        withTooltip: true,
        tooltipText: 'Online',
    },
}

export default storyConfig
