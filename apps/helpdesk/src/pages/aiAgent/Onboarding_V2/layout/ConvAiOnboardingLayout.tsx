import type { ReactNode } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import { useParams } from 'react-router-dom'

import { useHideBanners } from 'AlertBanners/hooks/useHideBanners'
import { OnboardingNavigationButtons } from 'pages/aiAgent/Onboarding_V2/components/common/OnboardingNavigationButtons/OnboardingNavigationButtons'

import css from './ConvAiOnboardingLayoutV2.less'

export const OnboardingBody: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    return <div className={css.onboardingBody}>{children}</div>
}

export const LoadingPulserIcon: React.FC<{ icon: string | JSX.Element }> = ({
    icon,
}) => {
    return (
        <div className={css.loadingPulserIcon}>
            <div>
                <div>
                    {typeof icon === 'string' ? (
                        <i className="material-icons">{icon}</i>
                    ) : (
                        icon
                    )}
                </div>
            </div>
        </div>
    )
}

export const OnboardingPreviewContainer: React.FC<{
    isLoading: boolean
    icon: string | JSX.Element
    caption?: string
    children?: ReactNode
}> = ({ children, isLoading, icon, caption }) => {
    return (
        <div className={css.onboardingPreviewContainerWrapper}>
            <div className={css.onboardingPreviewContainer}>
                {isLoading && (
                    <div
                        className={classNames(css.ghostContainer, css.loading)}
                    >
                        <LoadingPulserIcon icon={icon} />
                    </div>
                )}
                {!isLoading && (
                    <>
                        <div className={css.ghostContainer}>{children}</div>
                        <div className={css.caption}>{caption}</div>
                    </>
                )}
            </div>
        </div>
    )
}

export const OnboardingContentContainer: React.FC<{
    children: ReactNode
    totalSteps: number
    currentStep: number
    onNextClick: () => void
    onBackClick: () => void
    isLoading?: boolean
    containerClassName?: string
}> = ({
    children,
    totalSteps,
    currentStep,
    onNextClick,
    onBackClick,
    isLoading,
    containerClassName,
}) => {
    const { step, shopName } = useParams<{ step: string; shopName: string }>()

    const onNextAction = () => {
        logEvent(SegmentEvent.AiAgentNewOnboardingWizardButtonClicked, {
            Step: step,
            shopName,
            type: 'next',
        })
        onNextClick()
    }

    const onBackAction = () => {
        logEvent(SegmentEvent.AiAgentNewOnboardingWizardButtonClicked, {
            Step: step,
            shopName,
            type: 'back',
        })
        onBackClick()
    }

    return (
        <div
            className={classNames(
                css.onboardingContentContainer,
                containerClassName,
            )}
        >
            <div className={css.onboardingHeader}>
                <div title="Gorgias logo" className={css.logo} />
            </div>
            <div className={css.onboardingContentBody}>
                <div>{children}</div>
                <OnboardingNavigationButtons
                    step={currentStep}
                    totalSteps={totalSteps}
                    onBackClick={onBackAction}
                    onNextClick={onNextAction}
                    isLoading={isLoading ?? false}
                />
            </div>
        </div>
    )
}

export const ConvAiOnboardingLayout: React.FC<{
    children: ReactNode
}> = ({ children }) => {
    useHideBanners()
    return <div className={css.onboardingLayout}>{children}</div>
}
