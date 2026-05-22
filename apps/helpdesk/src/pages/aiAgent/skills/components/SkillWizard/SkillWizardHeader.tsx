import { Box, Button, Heading, Loader, ProgressBar, Text } from '@gorgias/axiom'

import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'

import { useSkillWizardContext } from './SkillWizardContext'
import { useMinDisplayTime } from './useMinDisplayTime'

import css from './SkillWizardHeader.less'

const MIN_SAVING_DISPLAY_MS = 30

type Props = {
    isSaving?: boolean
    onClose: () => void
}

export const SkillWizardHeader = ({ isSaving, onClose }: Props) => {
    const isSavingVisible = useMinDisplayTime(
        isSaving ?? false,
        MIN_SAVING_DISPLAY_MS,
    )
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
                <Heading size="xl" className={css.heading}>
                    <TruncatedTextWithTooltip
                        tooltipContent={
                            isRecapStep ? 'Final approval' : 'Review skill'
                        }
                    >
                        {isRecapStep ? 'Final approval' : 'Review skill'}
                    </TruncatedTextWithTooltip>
                </Heading>
                {isSavingVisible ? (
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
                        isDisabled={isFirstStep || isSavingVisible}
                        aria-label="Back"
                    >
                        <span className={css.buttonLabel}>Back</span>
                    </Button>
                    <Button
                        variant="primary"
                        trailingSlot="arrow-chevron-right"
                        onClick={goNext}
                        isDisabled={isLastStep || isSavingVisible}
                        aria-label="Next"
                    >
                        <span className={css.buttonLabel}>Next</span>
                    </Button>
                </Box>
            )}
        </Box>
    )
}
