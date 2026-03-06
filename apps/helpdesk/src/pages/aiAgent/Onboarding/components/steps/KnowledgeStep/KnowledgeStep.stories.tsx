import type { ComponentProps } from 'react'
import React from 'react'

import type { Meta, StoryFn } from '@storybook/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { action } from 'storybook/actions'

import { appQueryClient } from 'api/queryClient'
import { KnowledgeStep } from 'pages/aiAgent/Onboarding/components/steps/KnowledgeStep/KnowledgeStep'

const storyConfig: Meta<typeof KnowledgeStep> = {
    title: 'AI Agent/Onboarding/Steps/KnowledgeStep',
    component: KnowledgeStep,
}

const defaultProps: ComponentProps<typeof KnowledgeStep> = {
    currentStep: 4,
    totalSteps: 8,
    goToStep: action('goToStep'),
}

const Template: StoryFn<ComponentProps<typeof KnowledgeStep>> = (props) => (
    <Provider store={configureMockStore()()}>
        <QueryClientProvider client={appQueryClient}>
            <KnowledgeStep {...props} />
        </QueryClientProvider>
    </Provider>
)

export const Primary = Template.bind({})
Primary.args = {
    ...defaultProps,
}

export default storyConfig
