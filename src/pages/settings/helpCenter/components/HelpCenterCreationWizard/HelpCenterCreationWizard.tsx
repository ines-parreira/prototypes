import React from 'react'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import Wizard from 'pages/common/components/wizard/Wizard'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import PageHeader from 'pages/common/components/PageHeader'

import {
    HelpCenter,
    HelpCenterAutomateType,
    HelpCenterCreationWizardStep,
} from 'models/helpCenter/types'
import css from './HelpCenterCreationWizard.less'
import HelpCenterCreationWizardStepBasics from './components/steps/HelpCenterCreationWizardStepBasics'
import useGetAutomateType from './hooks/useGetAutomateType'
import HelpCenterCreationWizardStepBranding from './components/steps/HelpCenterCreationWizardStepBranding'
import HelpCenterCreationWizardStepArticles from './components/steps/HelpCenterCreationWizardStepArticles'
import HelpCenterCreationWizardStepAutomate from './components/steps/HelpCenterCreationWizardStepAutomate'

type Props = {
    helpCenter?: HelpCenter
    isUpdate?: boolean
}

const HelpCenterCreationWizard = ({
    helpCenter,
    isUpdate,
}: Props): JSX.Element => {
    const automateType = useGetAutomateType()

    const steps = Object.values(HelpCenterCreationWizardStep).filter((step) => {
        if (step === HelpCenterCreationWizardStep.Automate) {
            return automateType === HelpCenterAutomateType.AUTOMATE
        }
        if (step === HelpCenterCreationWizardStep.Initialization) {
            return false
        }
        return true
    })

    const helpCenterStepName = helpCenter?.wizard?.step_name

    const wizardStep =
        helpCenterStepName &&
        Object.values(HelpCenterCreationWizardStep).includes(
            helpCenterStepName as HelpCenterCreationWizardStep
        ) &&
        helpCenterStepName !== HelpCenterCreationWizardStep.Initialization
            ? helpCenterStepName
            : HelpCenterCreationWizardStep.Basics

    return (
        <>
            <div className={css.page}>
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to={`/app/settings/help-center`}>
                                    Help Center
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {isUpdate
                                    ? helpCenter?.name
                                    : 'New Help Center'}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />
                <div className={css.wrapper}>
                    <Wizard steps={steps} startAt={wizardStep}>
                        <WizardStep name={HelpCenterCreationWizardStep.Basics}>
                            <HelpCenterCreationWizardStepBasics
                                helpCenter={helpCenter}
                                isUpdate={!!isUpdate}
                                automateType={automateType}
                            />
                        </WizardStep>
                        <WizardStep
                            name={HelpCenterCreationWizardStep.Branding}
                        >
                            <HelpCenterCreationWizardStepBranding
                                helpCenter={helpCenter}
                                isUpdate={!!isUpdate}
                                automateType={automateType}
                            />
                        </WizardStep>
                        <WizardStep
                            name={HelpCenterCreationWizardStep.Articles}
                        >
                            <HelpCenterCreationWizardStepArticles
                                helpCenter={helpCenter}
                                isUpdate={!!isUpdate}
                                automateType={automateType}
                            />
                        </WizardStep>
                        {automateType === HelpCenterAutomateType.AUTOMATE && (
                            <WizardStep
                                name={HelpCenterCreationWizardStep.Automate}
                            >
                                <HelpCenterCreationWizardStepAutomate
                                    helpCenter={helpCenter}
                                    isUpdate={!!isUpdate}
                                />
                            </WizardStep>
                        )}
                    </Wizard>
                </div>
            </div>
        </>
    )
}

export default HelpCenterCreationWizard
