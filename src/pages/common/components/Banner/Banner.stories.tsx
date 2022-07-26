import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import standlonePreview from 'assets/img/presentationals/standalone-self-service-portal.png'

import {Banner} from './Banner'

const storyConfig: Meta = {
    title: 'Layout/Banner',
    component: Banner,
}

const Template: Story<ComponentProps<typeof Banner>> = (props) => (
    <Banner {...props} />
)

const defaultProps = {
    children: (
        <span>
            Customize your help center to look and feel like your brand by
            adding a logo, background image, your brand color and fonts, and
            more! Use your <a href="#">help center’s live URL</a> to redirect
            shoppers to self-service.
        </span>
    ),
    preview: <img src={standlonePreview} alt="" />,
    title: 'We created a help center for sfbicycles to help you get started.',
}

export const Default = Template.bind({})
Default.args = defaultProps

export const Dismissible = Template.bind({})
Dismissible.args = {
    ...defaultProps,
    dismissible: true,
}

export default storyConfig
