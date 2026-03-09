import { QueryClientProvider } from '@tanstack/react-query'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { appQueryClient } from 'api/queryClient'
import SelfServicePreviewContext from 'pages/automate/common/components/preview/SelfServicePreviewContext'
import SelfServiceStandaloneContactFormHomePage from 'pages/automate/common/components/preview/SelfServiceStandaloneContactFormHomePage'

import { ContactFormFixture } from '../../fixtures/contacForm'
import {
    selfServiceConfigurationFixture,
    workflowsEntrypointsFixture,
} from '../../fixtures/selfServiceConfiguration'
import StandaloneContactFormPreview from '../StandaloneContactFormPreview/StandaloneContactFormPreview'
import type { ContactFormEntrypointPreviewProps } from './ContactFormEntrypointPreview'
import type ContactFormEntrypointPreview from './ContactFormEntrypointPreview'

const storyConfig: Meta = {
    title: 'Contact form/EntrypointPreview',
    component: SelfServiceStandaloneContactFormHomePage,
}

type Story = StoryObj<typeof ContactFormEntrypointPreview>

const Template: Story = {
    render: (args: ContactFormEntrypointPreviewProps) => {
        return (
            <QueryClientProvider client={appQueryClient}>
                <SelfServicePreviewContext.Provider
                    value={{
                        selfServiceConfiguration:
                            selfServiceConfigurationFixture,
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
            </QueryClientProvider>
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
