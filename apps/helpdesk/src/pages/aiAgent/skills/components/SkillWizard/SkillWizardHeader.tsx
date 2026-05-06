import { Box, Button, Heading, Loader, ProgressBar, Text } from '@gorgias/axiom'

import { useSkillWizardContext } from './SkillWizardContext'

import css from './SkillWizardHeader.less'

type Props = {
    isSaving?: boolean
    onClose: () => void
}

export const SkillWizardHeader = ({ isSaving, onClose }: Props) => {
    const {
        currentStep,
        reviewStepsCount,
        isFirstStep,
        isLastStep,
        isRecapStep,
        goNext,
        goBack,
        onTest,
    } = useSkillWizardContext()

    const progressValue =
        reviewStepsCount > 0
            ? Math.round((currentStep / reviewStepsCount) * 100)
            : 0

    return (
        <Box
            alignItems="center"
            justifyContent="space-between"
            padding="lg"
            className={css.header}
        >
            <Box alignItems="center" gap="sm" className={css.leftSlot}>
                <Button
                    variant="secondary"
                    size="sm"
                    icon="arrow-left"
                    aria-label="Back to skills"
                    onClick={onClose}
                />
                <Heading size="xl">
                    {isRecapStep ? 'Final approval' : 'Review skill'}
                </Heading>
                {isSaving ? (
                    <span className={css.savingIndicator}>
                        <Loader size="sm" aria-label="Saving" />
                        <Text size="sm" color="content-neutral-secondary">
                            Saving
                        </Text>
                    </span>
                ) : (
                    <span className={css.savingIndicator}>
                        <Text size="sm" color="content-neutral-secondary">
                            Progress saved
                        </Text>
                    </span>
                )}
            </Box>

            {!isRecapStep && reviewStepsCount > 0 && (
                <Box
                    flexDirection="column"
                    alignItems="center"
                    gap="xs"
                    className={css.progressIndicator}
                >
                    <Text size="sm" color="content-neutral-secondary">
                        Reviewing draft {currentStep} of {reviewStepsCount}
                    </Text>
                    <ProgressBar
                        value={progressValue}
                        aria-label={`Step ${currentStep} of ${reviewStepsCount}`}
                        className={css.progressBar}
                    />
                </Box>
            )}

            {!isRecapStep && (
                <Box alignItems="center" gap="xs" className={css.rightSlot}>
                    <Button variant="secondary" onClick={onTest}>
                        Test
                    </Button>
                    <Button
                        variant="secondary"
                        leadingSlot="arrow-chevron-left"
                        onClick={goBack}
                        isDisabled={isFirstStep || isSaving}
                    >
                        Back
                    </Button>
                    <Button
                        variant="primary"
                        trailingSlot="arrow-chevron-right"
                        onClick={goNext}
                        isDisabled={isLastStep || isSaving}
                    >
                        Next
                    </Button>
                </Box>
            )}
        </Box>
    )
}
