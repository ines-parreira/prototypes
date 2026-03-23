import { useEffectOnce } from '@repo/hooks'
import { SegmentEvent } from '@repo/logging'

import { StepperProgressHeader } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatCreationWizard/components/StepperProgressHeader'
import { STEP_LABELS } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatCreationWizard/constants'
import useLogWizardEvent from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatCreationWizard/hooks/useLogWizardEvent'

import css from './GorgiasChatCreationWizardStep.less'

type Props = {
    children: React.ReactNode
    footer: React.ReactNode
}

export const GorgiasChatCreationWizardStep = ({ children, footer }: Props) => {
    const logWizardEvent = useLogWizardEvent()

    useEffectOnce(() => {
        logWizardEvent(SegmentEvent.ChatWidgetWizardStepStarted)
    })

    return (
        <div className={css.wizard}>
            <div className={css.content}>
                <StepperProgressHeader
                    labels={STEP_LABELS}
                    className={css.wizardProgressHeader}
                />
                {children}
                <div className={css.footer}>
                    <div className={css.footerContent}>{footer}</div>
                </div>
            </div>
        </div>
    )
}
