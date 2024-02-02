import React from 'react'

import {
    HELP_CENTER_STEPS_DESCRIPTIONS,
    HELP_CENTER_STEPS_LABELS,
    HELP_CENTER_STEPS_TITLES,
} from 'pages/settings/helpCenter/constants'
import WizardStepSkeleton from 'pages/common/components/wizard/WizardStepSkeleton'
import {HelpCenter, HelpCenterCreationWizardStep} from 'models/helpCenter/types'
import HelpCenterWizardOrderManagement from '../HelpCenterWizardOrderManagement/HelpCenterWizardOrderManagement'
import {useHelpCenterAutomationForm} from '../../hooks/useHelpCenterAutomationForm'
import css from './HelpCenterCreationWizardStepAutomate.less'

type Props = {
    helpCenter: HelpCenter
    isUpdate: boolean
}

const HelpCenterCreationWizardStepAutomate: React.FC<Props> = ({
    helpCenter,
}) => {
    const {state, updateOrderManagementEnabled} = useHelpCenterAutomationForm({
        orderManagementEnabled:
            helpCenter.self_service_deactivated_datetime !== null,
    })

    return (
        <WizardStepSkeleton
            step={HelpCenterCreationWizardStep.Automate}
            labels={HELP_CENTER_STEPS_LABELS}
            titles={HELP_CENTER_STEPS_TITLES}
            descriptions={HELP_CENTER_STEPS_DESCRIPTIONS}
            footer={<div>Footer</div>}
        >
            <div className={css.container}>
                <HelpCenterWizardOrderManagement
                    onChange={updateOrderManagementEnabled}
                    enabled={state.orderManagementEnabled}
                />
            </div>
        </WizardStepSkeleton>
    )
}

export default HelpCenterCreationWizardStepAutomate
