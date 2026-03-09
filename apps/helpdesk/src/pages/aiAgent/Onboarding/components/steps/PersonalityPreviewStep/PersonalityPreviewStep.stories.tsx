import type { ComponentProps } from 'react'
import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { appQueryClient } from 'api/queryClient'
import { billingState } from 'fixtures/billing'
import { user } from 'fixtures/users'

import { PersonalityPreviewStep } from './PersonalityPreviewStep'

const storyConfig: Meta<typeof PersonalityPreviewStep> = {
    title: 'AI Agent/Onboarding/Steps/PersonalityPreviewStep',
    component: PersonalityPreviewStep,
}

const defaultState = {
    billing: fromJS(billingState),
    currentUser: Map(user),
}

const defaultProps: ComponentProps<typeof PersonalityPreviewStep> = {
    currentStep: 1,
    totalSteps: 8,
    goToStep: () => {},
}

const Template: StoryFn<ComponentProps<typeof PersonalityPreviewStep>> = (
    props,
) => (
    <Provider store={configureMockStore()(defaultState)}>
        <QueryClientProvider client={appQueryClient}>
            <PersonalityPreviewStep {...props} />
        </QueryClientProvider>
    </Provider>
)

export const Primary = Template.bind({})
Primary.args = {
    ...defaultProps,
}

export default storyConfig
