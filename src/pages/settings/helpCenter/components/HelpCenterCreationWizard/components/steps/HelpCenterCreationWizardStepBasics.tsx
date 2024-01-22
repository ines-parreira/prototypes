/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'

import {
    HelpCenter,
    HelpCenterAutomateType,
    HelpCenterCreationWizardStep,
} from 'models/helpCenter/types'
import WizardStepSkeleton from 'pages/common/components/wizard/WizardStepSkeleton'
import {
    HELP_CENTER_STEPS_DESCRIPTIONS,
    HELP_CENTER_STEPS_LABELS,
    HELP_CENTER_STEPS_TITLES,
} from 'pages/settings/helpCenter/constants'

// import css from './HelpCenterCreationWizardStepBasics.less'

type Props = {
    helpCenter?: HelpCenter
    isUpdate: boolean
    automateType: HelpCenterAutomateType
}

const HelpCenterCreationWizardStepBasics: React.FC<Props> = ({
    helpCenter,
    isUpdate,
    automateType,
}) => {
    return (
        <>
            <WizardStepSkeleton
                step={HelpCenterCreationWizardStep.Basics}
                labels={HELP_CENTER_STEPS_LABELS}
                titles={HELP_CENTER_STEPS_TITLES}
                descriptions={HELP_CENTER_STEPS_DESCRIPTIONS}
                footer={<div>Footer</div>}
            >
                <div>Hello world Basic content</div>
            </WizardStepSkeleton>
        </>
    )
}

export default HelpCenterCreationWizardStepBasics
