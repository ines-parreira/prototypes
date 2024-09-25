import React from 'react'
import {StepProps} from 'pages/convert/campaigns/components/ContactForm/types'
import {SetUp} from 'pages/convert/campaigns/components/ContactForm/steps/SetUp'
import {Customisation} from 'pages/convert/campaigns/components/ContactForm/steps/Customisation'
import {PostSubmissionMessage} from 'pages/convert/campaigns/components/ContactForm/steps/PostSubmissionMessage'

export const STEPS: {
    label: string
    getComponent: (props: StepProps) => JSX.Element
}[] = [
    {label: 'Set up', getComponent: (props: StepProps) => <SetUp {...props} />},
    {
        label: 'Customisation',
        getComponent: (props: StepProps) => <Customisation {...props} />,
    },
    {
        label: 'Thank You Message',
        getComponent: (props: StepProps) => (
            <PostSubmissionMessage {...props} />
        ),
    },
]
