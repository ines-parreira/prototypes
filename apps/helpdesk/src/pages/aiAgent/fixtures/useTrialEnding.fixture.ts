import { UseTrialEndingReturn } from 'pages/aiAgent/trial/hooks/useTrialEnding'

export const getUseTrialEndingFixture = (
    props?: Partial<UseTrialEndingReturn>,
): UseTrialEndingReturn => ({
    remainingDays: 14,
    remainingDaysFloat: 14.0,
    isTrialExtended: false,
    trialEndDatetime: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    trialTerminationDatetime: null,
    optedOutDatetime: null,
    ...props,
})
