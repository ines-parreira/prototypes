import {action} from '@storybook/addon-actions'
import {Meta, StoryFn} from '@storybook/react'
import {fromJS, Map} from 'immutable'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {billingState} from 'fixtures/billing'
import {shopifyIntegration} from 'fixtures/integrations'
import {user} from 'fixtures/users'

import {OnboardingContextProvider} from 'pages/aiAgent/Onboarding/providers/OnboardingContext'
import {AiAgentScopes, WizardStepEnum} from 'pages/aiAgent/Onboarding/types'

import {PersonalityStep} from './PersonalityStep'

const storyConfig: Meta<typeof PersonalityStep> = {
    title: 'AI Agent/Onboarding/Steps/PersonalityStep',
    component: PersonalityStep,
}

const defaultState = {
    billing: fromJS(billingState),
    currentUser: Map(user),
}
const defaultOnboardingContextData = {
    lastStep: WizardStepEnum.SALES_PERSONALITY,
    scope: [AiAgentScopes.SUPPORT],
    shopName: shopifyIntegration.meta.shop_name,
}

const defaultProps: ComponentProps<typeof PersonalityStep> = {
    currentStep: 1,
    totalSteps: 8,
    onBackClick: action('onBackClick'),
    onNextClick: action('onNextClick'),
}

const Template: StoryFn<ComponentProps<typeof PersonalityStep>> = (props) => (
    <OnboardingContextProvider initialData={defaultOnboardingContextData}>
        <Provider store={configureMockStore()(defaultState)}>
            <PersonalityStep {...props} />
        </Provider>
    </OnboardingContextProvider>
)

export const Primary = Template.bind({})
Primary.args = {
    ...defaultProps,
}

export default storyConfig
