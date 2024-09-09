import React from 'react'
import {StepProps} from 'pages/convert/campaigns/components/ContactForm/types'

export const STEPS: {
    label: string
    getComponent: (props: StepProps) => JSX.Element
}[] = [
    {label: 'Set up', getComponent: (__: StepProps) => <></>},
    {label: 'Customisation', getComponent: (__: StepProps) => <></>},
    {label: 'Thank You Message', getComponent: (__: StepProps) => <></>},
]
