import { useCustomBusinessHoursContext } from './CustomBusinessHoursContext'
import type { CustomBusinessHoursFormValues } from './types'

export const useCustomBusinessHoursForm = () => {
    const { integrationsToOverride } = useCustomBusinessHoursContext()

    const clientSideValidation = (
        values: CustomBusinessHoursFormValues,
    ): Partial<Record<keyof CustomBusinessHoursFormValues, string>> => {
        const errors: Partial<
            Record<keyof CustomBusinessHoursFormValues, string>
        > = {}

        if (integrationsToOverride.length > 0 && !values.overrideConfirmation) {
            errors.overrideConfirmation =
                'You have to confirm overwriting the existing schedules to be able to add the custom business hours.'
        }

        return errors
    }

    return {
        clientSideValidation,
    }
}
