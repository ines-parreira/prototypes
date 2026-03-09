import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import standlonePreview from 'assets/img/presentationals/standalone-self-service-portal.png'

import { Banner } from './Banner'

const storyConfig: Meta = {
    title: 'Layout/Banner',
    component: Banner,
}

const Template: StoryObj<typeof Banner> = {
    render: function Template(props) {
        return <Banner {...props} />
    },
}

const defaultProps = {
    children: (
        <span>
            Customize your help center to look and feel like your brand by
            adding a logo, background image, your brand color and fonts, and
            more! Use your <a href="#">help center’s live URL</a> to redirect
            customers to self-service.
        </span>
    ),
    preview: <img src={standlonePreview} alt="" />,
    title: 'We created a help center for sfbicycles to help you get started.',
}

export const Default = {
    ...Template,
    args: defaultProps,
}

export const Dismissible = {
    ...Template,
    args: {
        ...defaultProps,
        dismissible: true,
    },
}

export default storyConfig
