import type { ComponentProps } from 'react'

import { MemoryRouter } from 'react-router-dom'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { SettingsFeatureRow } from './SettingsFeatureRow'

const storyConfig: Meta = {
    title: 'General/SettingsFeatureRow',
    component: SettingsFeatureRow,
    argTypes: {
        title: { control: 'text' },
        description: { control: 'text' },
        badgeText: { control: 'text' },
        nbFeatures: { control: 'number' },
        type: { control: 'select', options: ['badge', 'link', 'toggle'] },
        link: { control: 'text' },
        isChecked: { control: 'boolean' },
        isDisabled: { control: 'boolean' },
        onChange: { action: 'change' },
        onClick: { action: 'click' },
    },
}

const defaultProps = {
    title: 'Test Feature',
    description: 'Test Description',
    nbFeatures: 3,
    badgeText: '3 items',
}

const Template: StoryFn<ComponentProps<typeof SettingsFeatureRow>> = (
    props: any,
) => (
    <MemoryRouter initialEntries={['/']}>
        <SettingsFeatureRow {...props} />
    </MemoryRouter>
)

export const Badge = Template.bind({})
Badge.args = defaultProps

export const Toggle = Template.bind({})
Toggle.args = { ...defaultProps, type: 'toggle', isChecked: true }

export const Link = Template.bind({})
Link.args = { ...defaultProps, type: 'link', link: 'https://www.google.com' }

export default storyConfig
