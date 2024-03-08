import {useMemo} from 'react'

type Args = {
    count?: number
    isPristine?: boolean
    isValid?: boolean
    isEditMode?: boolean
}
export function useStepState({count, isPristine, isValid, isEditMode}: Args) {
    const props = useMemo(() => {
        if (isEditMode) {
            return {}
        }

        if (isPristine) {
            return {
                count: !isEditMode ? count : undefined,
            }
        }

        return {
            isValid: isValid,
            isInvalid: !isValid,
        }
    }, [isPristine, isEditMode, isValid, count])

    return props
}
