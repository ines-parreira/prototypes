import { Customization } from 'pages/convert/campaigns/components/ContactCaptureForm/steps/Customization'
import { PostSubmissionMessage } from 'pages/convert/campaigns/components/ContactCaptureForm/steps/PostSubmissionMessage'
import { SetUp } from 'pages/convert/campaigns/components/ContactCaptureForm/steps/SetUp'
import type { StepProps } from 'pages/convert/campaigns/components/ContactCaptureForm/types'

export const STEPS: {
    label: string
    getComponent: (props: StepProps) => JSX.Element
}[] = [
    {
        label: 'Set up',
        getComponent: (props: StepProps) => <SetUp {...props} />,
    },
    {
        label: 'Customization',
        getComponent: (props: StepProps) => <Customization {...props} />,
    },
    {
        label: 'Thank You Message',
        getComponent: (props: StepProps) => (
            <PostSubmissionMessage {...props} />
        ),
    },
]
