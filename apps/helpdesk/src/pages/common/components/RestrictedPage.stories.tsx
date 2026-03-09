import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { PageSection } from '../../../config/pages'
import { UserRole } from '../../../config/types/user'
import RestrictedPage from './RestrictedPage'

const storyConfig: Meta = {
    title: 'Layout/RestrictedPage',
    component: RestrictedPage,
    parameters: {
        docs: {
            description: {
                component:
                    'Presentational component for displaying that a page is restricted for a given role.',
            },
        },
    },
    argTypes: {
        requiredRole: {
            description: 'Required role to access restricted page.',
            control: {
                type: 'select',
            },
        },
        page: {
            description: 'Restricted page name.',
        },
    },
}

const Template: StoryObj<typeof RestrictedPage> = {
    render: function Template(props) {
        return <RestrictedPage {...props} />
    },
}

const defaultProps: ComponentProps<typeof RestrictedPage> = {
    requiredRole: UserRole.Admin,
}
export const Default = {
    ...Template,
    args: defaultProps,
}

export const ForSpecificPage = {
    ...Template,
    args: { ...defaultProps, page: PageSection.NewBilling },
}

export default storyConfig
