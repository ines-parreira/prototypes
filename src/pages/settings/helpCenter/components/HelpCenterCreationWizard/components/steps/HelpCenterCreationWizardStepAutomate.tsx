/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'

import {HelpCenter, HelpCenterCreationWizardStep} from 'models/helpCenter/types'
import WizardStepSkeleton from 'pages/common/components/wizard/WizardStepSkeleton'
import {
    HELP_CENTER_STEPS_DESCRIPTIONS,
    HELP_CENTER_STEPS_LABELS,
    HELP_CENTER_STEPS_TITLES,
} from 'pages/settings/helpCenter/constants'

// import css from './HelpCenterCreationWizardStepAutomate.less'

type Props = {
    helpCenter?: HelpCenter
    isUpdate: boolean
}

const HelpCenterCreationWizardStepAutomate: React.FC<Props> = ({
    helpCenter,
    isUpdate,
}) => {
    return (
        <>
            <WizardStepSkeleton
                step={HelpCenterCreationWizardStep.Automate}
                labels={HELP_CENTER_STEPS_LABELS}
                titles={HELP_CENTER_STEPS_TITLES}
                descriptions={HELP_CENTER_STEPS_DESCRIPTIONS}
                footer={<div>Footer</div>}
            >
                <div>Hello world Automate content</div>
            </WizardStepSkeleton>
        </>
    )
}

export default HelpCenterCreationWizardStepAutomate
