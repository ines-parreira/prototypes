import { Button } from '@gorgias/axiom'

import css from '../../../layout/ConvAiOnboardingLayoutV2.less'

type Props = {
    step: number
    totalSteps: number
    onBackClick: () => void
    onNextClick: () => void
    isLoading: boolean
    onCloseClick?: () => void
}

export const OnboardingNavigationButtons = (props: Props) => {
    const {
        step,
        totalSteps,
        onBackClick,
        onNextClick,
        isLoading,
        onCloseClick,
    } = props
    const nextBtnText = step === totalSteps ? 'Finish setup' : 'Next'

    return (
        <div className={css.navigationButtonsContainer}>
            {onCloseClick ? (
                <Button variant="secondary" size="md" onClick={onCloseClick}>
                    Close
                </Button>
            ) : (
                step !== 1 && (
                    <Button variant="secondary" size="md" onClick={onBackClick}>
                        Back
                    </Button>
                )
            )}
            <div className={css.nextButton}>
                <Button
                    variant="primary"
                    size="md"
                    onClick={onNextClick}
                    isLoading={isLoading}
                >
                    {nextBtnText}
                </Button>
            </div>
        </div>
    )
}
