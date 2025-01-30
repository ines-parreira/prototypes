import {action} from '@storybook/addon-actions'
import {Meta, StoryFn} from '@storybook/react'

import {QueryClientProvider} from '@tanstack/react-query'
import React, {ComponentProps} from 'react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {appQueryClient} from 'api/queryClient'

import {KnowledgeStep} from './KnowledgeStep'

const storyConfig: Meta<typeof KnowledgeStep> = {
    title: 'AI Agent/Onboarding/Steps/KnowledgeStep',
    component: KnowledgeStep,
}

const defaultProps: ComponentProps<typeof KnowledgeStep> = {
    currentStep: 4,
    totalSteps: 8,
    onBackClick: action('onBackClick'),
    onNextClick: action('onNextClick'),
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
