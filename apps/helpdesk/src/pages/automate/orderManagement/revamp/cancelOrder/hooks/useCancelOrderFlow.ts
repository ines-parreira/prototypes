import { useCallback, useEffect, useMemo } from 'react'

import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { IntegrationType } from 'models/integration/constants'
import type {
    ResponseMessageContent,
    SelfServiceConfiguration,
    SelfServiceConfigurationFilter,
} from 'models/selfServiceConfiguration/types'
import {
    AUTOMATED_RESPONSE,
    FilterKeyEnum,
    FilterOperatorEnum,
} from 'models/selfServiceConfiguration/types'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'

const DEFAULT_RESPONSE_MESSAGE_CONTENT: ResponseMessageContent = {
    html: '',
    text: '',
}

type CancelOrderFormValues = {
    eligibilities: SelfServiceConfigurationFilter[]
    exceptions: SelfServiceConfigurationFilter[]
    action: {
        type: typeof AUTOMATED_RESPONSE
        responseMessageContent: ResponseMessageContent
    }
}

export const useCancelOrderFlow = () => {
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
            selfServiceConfiguration?.cancelOrderPolicy
                ? ({
                      eligibilities:
                          selfServiceConfiguration.cancelOrderPolicy
                              .eligibilities,
                      exceptions:
                          selfServiceConfiguration.cancelOrderPolicy.exceptions,
                      action: selfServiceConfiguration.cancelOrderPolicy
                          .action ?? {
                          type: AUTOMATED_RESPONSE,
                          responseMessageContent:
                              DEFAULT_RESPONSE_MESSAGE_CONTENT,
                      },
                  } satisfies CancelOrderFormValues)
                : undefined,
        [selfServiceConfiguration?.cancelOrderPolicy],
    )

    const {
        watch,
        setValue,
        reset,
        formState: { isDirty },
    } = useForm<CancelOrderFormValues>({
        defaultValues,
    })

    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues)
        }
    }, [defaultValues, reset])

    const formValues = watch()

    const eligibility = formValues.eligibilities?.[0]

    const responseMessageContent =
        formValues.action?.responseMessageContent ??
        DEFAULT_RESPONSE_MESSAGE_CONTENT

    const handleEligibilityChange = useCallback(
        (value: string[] | undefined) => {
            const eligibility: SelfServiceConfigurationFilter | undefined =
                value
                    ? {
                          key: FilterKeyEnum.GORGIAS_ORDER_STATUS,
                          value,
                          operator: FilterOperatorEnum.ONE_OF,
                      }
                    : undefined

            setValue('eligibilities', eligibility ? [eligibility] : [], {
                shouldDirty: true,
            })
        },
        [setValue],
    )

    const handleResponseMessageChange = useCallback(
        (responseMessageContent: ResponseMessageContent) => {
            setValue(
                'action',
                {
                    type: AUTOMATED_RESPONSE,
                    responseMessageContent,
                },
                { shouldDirty: true },
            )
        },
        [setValue],
    )

    const handleSave = useCallback(async () => {
        if (!defaultValues) {
            return
        }

        await handleSelfServiceConfigurationUpdate(
            (draft: SelfServiceConfiguration) => {
                draft.cancelOrderPolicy.exceptions = formValues.exceptions
                draft.cancelOrderPolicy.eligibilities = formValues.eligibilities
                draft.cancelOrderPolicy.action = formValues.action
            },
        )
    }, [formValues, defaultValues, handleSelfServiceConfigurationUpdate])

    const handleReset = useCallback(() => {
        if (defaultValues) {
            reset(defaultValues)
        }
    }, [defaultValues, reset])

    const isLoading = isFetchPending || !selfServiceConfiguration

    return {
        isLoading,
        isUpdatePending,
        isDirty,
        storeIntegration,
        eligibility,
        responseMessageContent,
        handleEligibilityChange,
        handleResponseMessageChange,
        handleSave,
        handleReset,
    }
}
