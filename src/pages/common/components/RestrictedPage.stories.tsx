import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'

import {UserRole} from '../../../config/types/user'
import {PageSection} from '../../../config/pages'
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

const Template: Story<ComponentProps<typeof RestrictedPage>> = (props) => (
    <RestrictedPage {...props} />
)

const defaultProps: ComponentProps<typeof RestrictedPage> = {
    requiredRole: UserRole.Admin,
}
export const Default = Template.bind({})
Default.args = defaultProps

export const ForSpecificPage = Template.bind({})
ForSpecificPage.args = {...defaultProps, page: PageSection.Billing}

export default storyConfig
