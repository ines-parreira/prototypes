import type { ComponentProps } from 'react'

import { MemoryRouter } from 'react-router-dom'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import GroupAddon from 'pages/common/forms/input/GroupAddon'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'

import SettingsCard from './SettingsCard'
import SettingsCardContent from './SettingsCardContent'
import SettingsCardHeader from './SettingsCardHeader'
import SettingsCardTitle from './SettingsCardTitle'
import { SettingsFeatureRow } from './SettingsFeatureRow'

const storyConfig: Meta = {
    title: 'General/SettingsCard',
    component: SettingsCard,
}

const Template: StoryFn<ComponentProps<typeof SettingsCard>> = (props: any) => (
    <MemoryRouter initialEntries={['/']}>
        <SettingsCard {...props}>
            <SettingsCardHeader>
                <SettingsCardTitle>Settings Card</SettingsCardTitle>
                <div>
                    I am a subtitle with a link <a href="#">here</a>
                </div>
            </SettingsCardHeader>
            <SettingsCardContent>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 20,
                    }}
                >
                    <AIBanner fillStyle="success">
                        This is a success banner
                    </AIBanner>
                    <InputGroup>
                        <TextInput />
                        <GroupAddon>.myshopify.com</GroupAddon>
                    </InputGroup>
                </div>
                <SettingsFeatureRow
                    title="Test Feature"
                    description="Test Description"
                    nbFeatures={3}
                    badgeText="3 items"
                />
                <SettingsFeatureRow
                    title="Test Feature 2"
                    description="Test Description 2"
                    type="toggle"
                    isChecked={false}
                    toggleName="toggle-test-feature-2"
                />
                <SettingsFeatureRow
                    title="Test Feature 3"
                    description="Test Description 3"
                    type="link"
                    link="https://www.google.com"
                />
            </SettingsCardContent>
        </SettingsCard>
    </MemoryRouter>
)

export const Default = Template.bind({})

export default storyConfig
