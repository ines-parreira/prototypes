import React, { useMemo } from 'react'

import classnames from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { useParams } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import {
    AiAgentOnboardingWizardStep,
    StoreConfiguration,
} from 'models/aiAgent/types'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import PageHeader from 'pages/common/components/PageHeader'
import Wizard from 'pages/common/components/wizard/Wizard'
import WizardStep from 'pages/common/components/wizard/WizardStep'

import { isAiAgentOnboardingWizardStep } from '../hooks/utils/configurationForm.utils'
import AiAgentOnboardingWizardEducation from './AiAgentOnboardingWizardEducation'
import AiAgentOnboardingWizardKnowledge from './AiAgentOnboardingWizardKnowledge'
import AiAgentOnboardingWizardPersonalize from './AiAgentOnboardingWizardPersonalize'

import css from './AiAgentOnboardingWizard.less'

export type AiAgentOnboardingWizardProps = {
    shopType: string
    shopName: string
    storeConfiguration?: StoreConfiguration
}

const AiAgentOnboardingWizardComponent = (
    props: AiAgentOnboardingWizardProps,
) => {
    const isAiAgentOnboardingWizardEducationalStepEnabled =
        useFlags()[FeatureFlagKey.AiAgentOnboardingWizardEducationalStep]

    const steps = useMemo(
        () =>
            Object.values(AiAgentOnboardingWizardStep).filter((step) => {
                if (step === AiAgentOnboardingWizardStep.Education) {
                    return isAiAgentOnboardingWizardEducationalStepEnabled
                }
                return true
            }),
        [isAiAgentOnboardingWizardEducationalStepEnabled],
    )

    const stepName = props.storeConfiguration?.wizard?.stepName

    const wizardStep =
        stepName && isAiAgentOnboardingWizardStep(stepName)
            ? stepName
            : isAiAgentOnboardingWizardEducationalStepEnabled
              ? AiAgentOnboardingWizardStep.Education
              : AiAgentOnboardingWizardStep.Personalize

    return (
        <>
            <div className={classnames(css.page, 'ai-agent-onboarding-wizard')}>
                <PageHeader title="Set up AI Agent" />
                <div className={css.wrapper}>
                    <Wizard steps={steps} startAt={wizardStep}>
                        {isAiAgentOnboardingWizardEducationalStepEnabled && (
                            <WizardStep
                                name={AiAgentOnboardingWizardStep.Education}
                            >
                                <AiAgentOnboardingWizardEducation {...props} />
                            </WizardStep>
                        )}
                        <WizardStep
                            name={AiAgentOnboardingWizardStep.Personalize}
                        >
                            <AiAgentOnboardingWizardPersonalize {...props} />
                        </WizardStep>
                        <WizardStep
                            name={AiAgentOnboardingWizardStep.Knowledge}
                        >
                            <AiAgentOnboardingWizardKnowledge {...props} />
                        </WizardStep>
                    </Wizard>
                </div>
            </div>
        </>
    )
}

const AiAgentOnboardingWizard = () => {
    const { shopType, shopName } = useParams<{
        shopType: string
        shopName: string
    }>()

    const { storeConfiguration, isLoading } =
        useAiAgentStoreConfigurationContext()

    if (isLoading) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    return (
        <AiAgentOnboardingWizardComponent
            shopType={shopType}
            shopName={shopName}
            storeConfiguration={storeConfiguration}
        />
    )
}

export default AiAgentOnboardingWizard
