import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from '../constants/shoppingAssistant'

export const useTrialProgress = (
    remainingDays: number,
): {
    progressPercentage: number
    progressText: string
} => {
    const progressPercentage = Math.max(
        0,
        Math.min(
            100,
            Math.round(
                (remainingDays / SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS) * 100,
            ),
        ),
    )

    let progressText: string
    if (remainingDays === 0) {
        progressText = 'Trial ends today'
    } else if (remainingDays === 1) {
        progressText = '1 day left'
    } else {
        progressText = `${remainingDays} days left`
    }

    return {
        progressPercentage,
        progressText,
    }
}
