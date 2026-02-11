import type { ReactNode } from 'react'
import { useEffect } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import { useParams } from 'react-router-dom'

import { Box, ProgressBar, Text } from '@gorgias/axiom'

import { useHideBanners } from 'AlertBanners/hooks/useHideBanners'
import { OnboardingNavigationButtons } from 'pages/aiAgent/Onboarding_V2/components/common/OnboardingNavigationButtons/OnboardingNavigationButtons'
import { useTrackStepCompleted } from 'pages/aiAgent/Onboarding_V2/hooks/useTrackStepCompleted'

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
    isLoading?: boolean
    icon?: string | JSX.Element
    showCaption?: boolean
    caption?: string | ReactNode
    children?: ReactNode
}> = ({
    children,
    isLoading,
    icon,
    showCaption,
    caption = 'This is a sample conversation with AI Agent.',
}) => {
    return (
        <div className={css.onboardingPreviewContainerWrapper}>
            <div className={css.onboardingPreviewContainer}>
                {isLoading && icon ? (
                    <div
                        className={classNames(css.ghostContainer, css.loading)}
                    >
                        <LoadingPulserIcon icon={icon} />
                    </div>
                ) : (
                    <div className={css.ghostContainer}>{children}</div>
                )}
                {showCaption && (
                    <Box marginLeft="xxxl" marginRight="xxxl">
                        <Text
                            className={css.onboardingPreviewCaption}
                            align="center"
                        >
                            {caption}
                        </Text>
                    </Box>
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
    onCloseClick?: () => void
}> = ({
    children,
    totalSteps,
    currentStep,
    onNextClick,
    onBackClick,
    isLoading,
    containerClassName,
    onCloseClick,
}) => {
    const { step, shopName } = useParams<{ step: string; shopName: string }>()

    const stepName = step ?? 'unknown'
    const safeShopName = shopName ?? 'unknown'
    const isLastStep = currentStep === totalSteps

    const trackStepCompleted = useTrackStepCompleted({
        currentStep,
        stepName: stepName,
        shopName: safeShopName,
    })

    useEffect(() => {
        logEvent(SegmentEvent.AiAgentOnboardingStepViewed, {
            onboardingFlow: 'wizard',
            stepName,
            stepNumber: currentStep,
            shopName: safeShopName,
        })
    }, [stepName, currentStep, safeShopName])

    const onNextAction = () => {
        trackStepCompleted()
        logEvent(SegmentEvent.AiAgentOnboardingButtonClicked, {
            onboardingFlow: 'wizard',
            buttonType: isLastStep ? 'finish' : 'next',
            stepName,
            stepNumber: currentStep,
            shopName: safeShopName,
        })
        onNextClick()
    }

    const onBackAction = () => {
        logEvent(SegmentEvent.AiAgentOnboardingButtonClicked, {
            onboardingFlow: 'wizard',
            buttonType: 'back',
            stepName,
            stepNumber: currentStep,
            shopName: safeShopName,
        })
        onBackClick()
    }

    const onCloseAction = () => {
        logEvent(SegmentEvent.AiAgentOnboardingClosed, {
            onboardingFlow: 'wizard',
            stepNumber: currentStep,
            isCompleted: false,
            shopName: safeShopName,
        })
        onCloseClick?.()
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
                <Box marginTop="xl" className={css.progressBarWrapper}>
                    <ProgressBar value={currentStep} maxValue={totalSteps} />
                </Box>
                <div>{children}</div>
                <OnboardingNavigationButtons
                    step={currentStep}
                    totalSteps={totalSteps}
                    onBackClick={onBackAction}
                    onNextClick={onNextAction}
                    isLoading={isLoading ?? false}
                    onCloseClick={onCloseClick ? onCloseAction : undefined}
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
