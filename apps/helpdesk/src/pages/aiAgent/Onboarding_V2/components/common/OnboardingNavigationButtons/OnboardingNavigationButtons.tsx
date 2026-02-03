import { Button } from '@gorgias/axiom'

import css from '../../../layout/ConvAiOnboardingLayoutV2.less'

type Props = {
    step: number
    totalSteps: number
    onBackClick: () => void
    onNextClick: () => void
    isLoading: boolean
}

export const OnboardingNavigationButtons = (props: Props) => {
    const { step, totalSteps, onBackClick, onNextClick, isLoading } = props
    const nextBtnText = step === totalSteps ? 'Finish setup' : 'Next'

    return (
        <div className={css.navigationButtonsContainer}>
            {step !== 1 && (
                <Button
                    variant="tertiary"
                    size="md"
                    onClick={onBackClick}
                    style={{
                        color: 'var(--surface-inverted-default)',
                    }}
                >
                    Back
                </Button>
            )}
            <div className={css.nextButton}>
                <Button
                    variant="primary"
                    size="md"
                    onClick={onNextClick}
                    isLoading={isLoading}
                    style={{
                        backgroundColor: 'var(--surface-inverted-default)',
                    }}
                >
                    {nextBtnText}
                </Button>
            </div>
        </div>
    )
}
