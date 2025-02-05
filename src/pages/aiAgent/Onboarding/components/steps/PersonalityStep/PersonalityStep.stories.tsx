import {action} from '@storybook/addon-actions'
import type {Meta, StoryFn} from '@storybook/react'
import {fromJS, Map} from 'immutable'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {billingState} from 'fixtures/billing'
import {user} from 'fixtures/users'

import {PersonalityStep} from './PersonalityStep'

const storyConfig: Meta<typeof PersonalityStep> = {
    title: 'AI Agent/Onboarding/Steps/PersonalityStep',
    component: PersonalityStep,
}

const defaultState = {
    billing: fromJS(billingState),
    currentUser: Map(user),
}

const defaultProps: ComponentProps<typeof PersonalityStep> = {
    currentStep: 1,
    totalSteps: 8,
    goToStep: action('goToStep'),
}

const Template: StoryFn<ComponentProps<typeof PersonalityStep>> = (props) => (
    <Provider store={configureMockStore()(defaultState)}>
        <PersonalityStep {...props} />
    </Provider>
)

export const Primary = Template.bind({})
Primary.args = {
    ...defaultProps,
}

export default storyConfig
