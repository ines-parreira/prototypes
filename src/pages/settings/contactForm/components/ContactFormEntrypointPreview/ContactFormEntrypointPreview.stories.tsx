import {Meta, StoryObj} from '@storybook/react'
import React from 'react'

import SelfServicePreviewContext from 'pages/automate/common/components/preview/SelfServicePreviewContext'
import SelfServiceStandaloneContactFormHomePage from 'pages/automate/common/components/preview/SelfServiceStandaloneContactFormHomePage'

import {ContactFormFixture} from '../../fixtures/contacForm'
import {
    selfServiceConfigurationFixture,
    workflowsEntrypointsFixture,
} from '../../fixtures/selfServiceConfiguration'
import StandaloneContactFormPreview from '../StandaloneContactFormPreview/StandaloneContactFormPreview'
import ContactFormEntrypointPreview, {
    ContactFormEntrypointPreviewProps,
} from './ContactFormEntrypointPreview'

const storyConfig: Meta = {
    title: 'Contact form/EntrypointPreview',
    component: SelfServiceStandaloneContactFormHomePage,
}

type Story = StoryObj<typeof ContactFormEntrypointPreview>

const Template: Story = {
    render: (args: ContactFormEntrypointPreviewProps) => {
        return (
            <SelfServicePreviewContext.Provider
                value={{
                    selfServiceConfiguration: selfServiceConfigurationFixture,
                    workflowsEntrypoints: workflowsEntrypointsFixture,
                }}
            >
                <StandaloneContactFormPreview name={args.contactForm.name}>
                    <SelfServiceStandaloneContactFormHomePage
                        locale={args.contactForm.default_locale}
                        formIsHidden={args.isFormHidden}
                        scrollToView
                    />
                </StandaloneContactFormPreview>
            </SelfServicePreviewContext.Provider>
        )
    },
}

export const Default: Story = {
    ...Template,
    args: {
        contactForm: ContactFormFixture,
        isFormHidden: false,
    },
}

export const WithContactUsButton: Story = {
    ...Template,
    args: {
        contactForm: ContactFormFixture,
        isFormHidden: true,
    },
}

export default storyConfig
