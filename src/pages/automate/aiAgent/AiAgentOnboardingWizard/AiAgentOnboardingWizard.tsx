import React, {useMemo} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import classnames from 'classnames'
import {useParams} from 'react-router-dom'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    AiAgentOnboardingWizardStep,
    StoreConfiguration,
} from 'models/aiAgent/types'
import PageHeader from 'pages/common/components/PageHeader'
import Wizard from 'pages/common/components/wizard/Wizard'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import Loader from 'pages/common/components/Loader/Loader'
import {useAiAgentStoreConfigurationContext} from '../providers/AiAgentStoreConfigurationContext'
import {isAiAgentOnboardingWizardStep} from '../components/StoreConfigForm/StoreConfigForm.utils'
import AiAgentOnboardingWizardEducation from './AiAgentOnboardingWizardEducation'
import AiAgentOnboardingWizardPersonalize from './AiAgentOnboardingWizardPersonalize'
import AiAgentOnboardingWizardKnowledge from './AiAgentOnboardingWizardKnowledge'
import css from './AiAgentOnboardingWizard.less'

export type AiAgentOnboardingWizardProps = {
    shopType?: string
    shopName?: string
    storeConfiguration?: StoreConfiguration
}

const AiAgentOnboardingWizardComponent = (
    props: AiAgentOnboardingWizardProps
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
        [isAiAgentOnboardingWizardEducationalStepEnabled]
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
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()

    const {storeConfiguration, isLoading} =
        useAiAgentStoreConfigurationContext()

    if (isLoading) {
        return <Loader data-testid="loader" />
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
