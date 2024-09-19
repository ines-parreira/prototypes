import React from 'react'
import {StepProps} from 'pages/convert/campaigns/components/ContactForm/types'
import {SetUp} from 'pages/convert/campaigns/components/ContactForm/steps/SetUp'

export const STEPS: {
    label: string
    getComponent: (props: StepProps) => JSX.Element
}[] = [
    {label: 'Set up', getComponent: (props: StepProps) => <SetUp {...props} />},
    {label: 'Customisation', getComponent: (__: StepProps) => <></>},
    {label: 'Thank You Message', getComponent: (__: StepProps) => <></>},
]
