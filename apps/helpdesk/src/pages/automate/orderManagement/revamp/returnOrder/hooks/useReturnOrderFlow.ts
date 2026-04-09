import { useCallback, useEffect, useMemo } from 'react'

import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { IntegrationType } from 'models/integration/constants'
import type {
    ReturnAction,
    SelfServiceConfiguration,
    SelfServiceConfigurationFilter,
} from 'models/selfServiceConfiguration/types'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'

import { DEFAULT_RETURN_ACTION } from '../../../legacy/returnOrder/constants'

type ReturnOrderFormValues = {
    eligibilities: SelfServiceConfigurationFilter[]
    exceptions: SelfServiceConfigurationFilter[]
    action: ReturnAction
}

export const useReturnOrderFlow = () => {
    const { shopName } = useParams<{ shopName: string }>()

    const {
        isFetchPending,
        isUpdatePending,
        storeIntegration,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(IntegrationType.Shopify, shopName)

    const defaultValues = useMemo(
        () =>
            selfServiceConfiguration?.returnOrderPolicy
                ? ({
                      eligibilities:
                          selfServiceConfiguration.returnOrderPolicy
                              .eligibilities,
                      exceptions:
                          selfServiceConfiguration.returnOrderPolicy.exceptions,
                      action:
                          selfServiceConfiguration.returnOrderPolicy.action ??
                          DEFAULT_RETURN_ACTION,
                  } satisfies ReturnOrderFormValues)
                : undefined,
        [selfServiceConfiguration?.returnOrderPolicy],
    )

    const {
        watch,
        setValue,
        reset,
        formState: { isDirty },
    } = useForm<ReturnOrderFormValues>({
        defaultValues,
    })

    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues)
        }
    }, [defaultValues, reset])

    const formValues = watch()

    const eligibility = formValues.eligibilities?.[0]

    const action = formValues.action ?? DEFAULT_RETURN_ACTION

    const handleEligibilityChange = useCallback(
        (eligibility?: SelfServiceConfigurationFilter) => {
            setValue('eligibilities', eligibility ? [eligibility] : [], {
                shouldDirty: true,
            })
        },
        [setValue],
    )

    const handleActionChange = useCallback(
        (action: ReturnAction) => {
            setValue('action', action, { shouldDirty: true })
        },
        [setValue],
    )

    const handleSave = useCallback(async () => {
        if (!defaultValues) {
            return
        }

        await handleSelfServiceConfigurationUpdate(
            (draft: SelfServiceConfiguration) => {
                draft.returnOrderPolicy.exceptions = formValues.exceptions
                draft.returnOrderPolicy.eligibilities = formValues.eligibilities
                draft.returnOrderPolicy.action = formValues.action
            },
        )
    }, [formValues, defaultValues, handleSelfServiceConfigurationUpdate])

    const isLoading = isFetchPending || !selfServiceConfiguration

    return {
        isLoading,
        isUpdatePending,
        isDirty,
        storeIntegration,
        eligibility,
        action,
        handleEligibilityChange,
        handleActionChange,
        handleSave,
    }
}

export default useReturnOrderFlow
