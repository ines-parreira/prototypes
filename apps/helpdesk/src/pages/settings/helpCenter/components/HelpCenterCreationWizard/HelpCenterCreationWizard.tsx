import React, { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import classnames from 'classnames'
import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { SentryTeam } from 'common/const/sentryTeamNames'
import type { HelpCenter } from 'models/helpCenter/types'
import {
    HelpCenterAutomateType,
    HelpCenterCreationWizardStep,
} from 'models/helpCenter/types'
import PageHeader from 'pages/common/components/PageHeader'
import Wizard from 'pages/common/components/wizard/Wizard'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import { ErrorBoundary } from 'pages/ErrorBoundary'

import { EditionManagerContextProvider } from '../../providers/EditionManagerContext'
import HelpCenterCreationWizardStepArticles from './components/steps/HelpCenterCreationWizardStepArticles'
import HelpCenterCreationWizardStepAutomate from './components/steps/HelpCenterCreationWizardStepAutomate'
import HelpCenterCreationWizardStepBasics from './components/steps/HelpCenterCreationWizardStepBasics'
import HelpCenterCreationWizardStepBranding from './components/steps/HelpCenterCreationWizardStepBranding'
import useGetAutomateType from './hooks/useGetAutomateType'

import css from './HelpCenterCreationWizard.less'

type Props = {
    helpCenter?: HelpCenter
    isUpdate?: boolean
}

const HelpCenterCreationWizardComponent = ({
    helpCenter,
    isUpdate,
}: Props): JSX.Element => {
    const automateType = useGetAutomateType()

    const steps = useMemo(
        () =>
            Object.values(HelpCenterCreationWizardStep).filter((step) => {
                if (step === HelpCenterCreationWizardStep.Automate) {
                    return automateType === HelpCenterAutomateType.AUTOMATE
                }
                if (step === HelpCenterCreationWizardStep.Initialization) {
                    return false
                }
                return true
            }),
        [automateType],
    )

    const helpCenterStepName = helpCenter?.wizard?.step_name

    const wizardStep =
        helpCenterStepName &&
        Object.values(HelpCenterCreationWizardStep).includes(
            helpCenterStepName as HelpCenterCreationWizardStep,
        ) &&
        helpCenterStepName !== HelpCenterCreationWizardStep.Initialization
            ? helpCenterStepName
            : HelpCenterCreationWizardStep.Basics

    const onStepChanged = useCallback(
        (stepName: HelpCenterCreationWizardStep) => {
            logEvent(SegmentEvent.WizardPageViewed, {
                steps: steps.join(', '),
                automate:
                    automateType === HelpCenterAutomateType.AUTOMATE
                        ? 'yes'
                        : 'no',
                type: stepName,
            })
        },
        [automateType, steps],
    )

    return (
        <>
            {/* .help-center-wizard class used to understand on css level that wizard component inside body */}
            <div className={classnames(css.page, 'help-center-wizard')}>
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
                    <Wizard
                        steps={steps}
                        startAt={wizardStep}
                        onStepChanged={(step: string) =>
                            onStepChanged(step as HelpCenterCreationWizardStep)
                        }
                    >
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
                            />
                        </WizardStep>
                        {helpCenter && (
                            <WizardStep
                                name={HelpCenterCreationWizardStep.Articles}
                            >
                                <EditionManagerContextProvider>
                                    <HelpCenterCreationWizardStepArticles
                                        helpCenter={helpCenter}
                                        automateType={automateType}
                                    />
                                </EditionManagerContextProvider>
                            </WizardStep>
                        )}
                        {automateType === HelpCenterAutomateType.AUTOMATE &&
                            helpCenter && (
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

const HelpCenterCreationWizard = (props: Props) => (
    <ErrorBoundary
        sentryTags={{
            section: 'help-center-wizard',
            team: SentryTeam.ACTIONS_AND_CHANNELS,
        }}
    >
        <HelpCenterCreationWizardComponent {...props} />
    </ErrorBoundary>
)

export default HelpCenterCreationWizard
