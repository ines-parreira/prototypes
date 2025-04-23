import { ComponentProps } from 'react'

import { Meta, StoryFn } from '@storybook/react'

import SettingsCard from './SettingsCard'
import SettingsCardContent from './SettingsCardContent'
import SettingsCardHeader from './SettingsCardHeader'
import SettingsCardTitle from './SettingsCardTitle'

const storyConfig: Meta = {
    title: 'General/SettingsCard',
    component: SettingsCard,
}

const Template: StoryFn<ComponentProps<typeof SettingsCard>> = (props: any) => (
    <SettingsCard {...props}>
        <SettingsCardHeader>
            <SettingsCardTitle>Settings Card</SettingsCardTitle>
            <div>
                I am a subtitle with a link <a href="#">here</a>
            </div>
        </SettingsCardHeader>
        <SettingsCardContent>I am a settings card content</SettingsCardContent>
    </SettingsCard>
)

export const Default = Template.bind({})

export default storyConfig
