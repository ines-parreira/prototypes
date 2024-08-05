import {useMemo} from 'react'

type Args = {
    count?: number
    isPristine?: boolean
    isValid?: boolean
    isDisabled?: boolean
    isEditMode?: boolean
}
export function useStepState({
    count,
    isPristine,
    isValid,
    isEditMode,
    isDisabled,
}: Args) {
    const props = useMemo(() => {
        if (isEditMode) {
            return {
                isDisabled,
            }
        }

        if (isPristine) {
            return {
                count: !isEditMode ? count : undefined,
                isDisabled,
            }
        }

        return {
            isValid: isValid,
            isInvalid: !isValid,
            isDisabled: isDisabled,
        }
    }, [isPristine, isEditMode, isValid, isDisabled, count])

    return props
}
