import {useCallback, useEffect, useState} from 'react'
import {
    useCreateHelpCenter,
    useCreateHelpCenterTranslation,
    useDeleteHelpCenterTranslation,
    useUpdateHelpCenter,
} from 'models/helpCenter/queries'
import {
    helpCenterCreated,
    helpCenterUpdated,
} from 'state/entities/helpCenter/helpCenters'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    HELP_CENTER_DEFAULT_LOCALE,
    HelpCenterCreationWizard,
    NEXT_ACTION,
    PlatformType,
} from 'pages/settings/helpCenter/constants'
import {HelpCenter, HelpCenterCreationWizardStep} from 'models/helpCenter/types'
import {useEnableArticleRecommendation} from 'pages/settings/helpCenter/hooks/useEnableArticleRecommendation'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/constants'
import {Integration} from 'models/integration/types'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import history from 'pages/history'
import {getNewHelpCenterTranslation} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import {
    getUpdatedFields,
    mapUIHelpCenterToApiHelpCenter,
    mapApiHelpCenterToUIHelpCenter,
    handleOnError,
} from '../HelpCenterCreationWizardUtils'

const defaultHelpCenter: HelpCenterCreationWizard = {
    name: '',
    subdomain: '',
    defaultLocale: HELP_CENTER_DEFAULT_LOCALE,
    supportedLocales: [HELP_CENTER_DEFAULT_LOCALE],
    platformType: PlatformType.ECOMMERCE,
    stepName: HelpCenterCreationWizardStep.Basics,
    shopName: '',
    brandLogoUrl: '',
    primaryColor: '#4A8DF9',
    primaryFontFamily: 'Inter',
}

type HelpCenterWizardOutput = {
    helpCenter: HelpCenterCreationWizard
    allStoreIntegrations: Integration[]
    handleFormUpdate: (payload: Partial<HelpCenterCreationWizard>) => void
    handleAction: (redirectTo: NEXT_ACTION, id?: number) => void
    handleSave: (
        redirectTo?: NEXT_ACTION,
        stepName?: HelpCenterCreationWizardStep,
        payload?: Partial<HelpCenterCreationWizard>
    ) => void
    isLoading: boolean
}

export const useHelpCenterCreationWizard = (
    helpCenter: HelpCenter | undefined,
    step: HelpCenterCreationWizardStep
): HelpCenterWizardOutput => {
    const dispatch = useAppDispatch()
    const enableArticleRecommendation = useEnableArticleRecommendation()
    const navigateWizardSteps = useNavigateWizardSteps()

    const allStoreIntegrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ])
    )

    const [newHelpCenter, setNewHelpCenter] =
        useState<HelpCenterCreationWizard>(defaultHelpCenter)

    const {mutate: createHelpCenterMutate, isLoading: isCreating} =
        useCreateHelpCenter()
    const {mutate: updateHelpCenterMutate, isLoading: isUpdating} =
        useUpdateHelpCenter()
    const {
        mutateAsync: createHelpCenterTranslationMutateAsync,
        isLoading: isCreatingHelpCenterTranslation,
    } = useCreateHelpCenterTranslation()
    const {
        mutate: deleteHelpCenterTranslationMutateAsync,
        isLoading: isDeletingHelpCenterTranslation,
    } = useDeleteHelpCenterTranslation()

    const isUpdate = !!helpCenter?.id

    useEffect(() => {
        const newHelpCenter = mapApiHelpCenterToUIHelpCenter(
            helpCenter,
            allStoreIntegrations
        )
        setNewHelpCenter(newHelpCenter)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleAction = (redirectTo: NEXT_ACTION, id?: number) => {
        switch (redirectTo) {
            case NEXT_ACTION.BACK_HOME:
                history.replace('/app/settings/help-center')
                break
            case NEXT_ACTION.NEXT_STEP:
                navigateWizardSteps.goToNextStep()
                break
            case NEXT_ACTION.PREVIOUS_STEP:
                navigateWizardSteps.goToPreviousStep()
                break
            case NEXT_ACTION.NEW_WIZARD:
                if (!id) return
                history.replace(`/app/settings/help-center/${id}/new`)
                break
        }
    }

    const handleFormUpdate = useCallback(
        (payload: Partial<HelpCenterCreationWizard>) => {
            setNewHelpCenter((prevHelpCenter) => ({
                ...prevHelpCenter,
                ...payload,
            }))
        },
        [setNewHelpCenter]
    )

    const handleSave = (
        redirectTo?: NEXT_ACTION,
        stepName?: HelpCenterCreationWizardStep,
        payload?: Partial<HelpCenterCreationWizard>
    ) => {
        const tempHelpCenterData = mapUIHelpCenterToApiHelpCenter({
            ...newHelpCenter,
            ...payload,
            stepName: stepName ?? newHelpCenter.stepName,
        })

        return isUpdate
            ? handleUpdateHelpCenter(tempHelpCenterData, redirectTo)
            : handleCreateHelpCenter(tempHelpCenterData, redirectTo)
    }

    const handleCreateHelpCenter = (
        payload: Partial<HelpCenter>,
        redirectTo?: NEXT_ACTION
    ) => {
        createHelpCenterMutate([undefined, payload as HelpCenter], {
            onSuccess: async (response) => {
                if (!response) return
                dispatch(helpCenterCreated(response.data))
                void enableArticleRecommendation(response.data)
                await handleSaveCallback(response.data, redirectTo)
            },
            onError: (error) =>
                handleOnError(
                    error,
                    'Help center not successfully created.',
                    dispatch
                ),
        })
    }

    const handleUpdateHelpCenter = (
        payload: Partial<HelpCenter>,
        redirectTo?: NEXT_ACTION
    ) => {
        if (!helpCenter) return

        const fieldsToUpdate = getUpdatedFields(payload, helpCenter)

        updateHelpCenterMutate(
            [undefined, {help_center_id: helpCenter.id}, fieldsToUpdate],
            {
                onSuccess: async (response) => {
                    if (!response) return
                    await handleSaveCallback(response.data, redirectTo)
                },
                onError: (error) =>
                    handleOnError(
                        error,
                        'Help center not successfully updated.',
                        dispatch
                    ),
            }
        )
    }

    const handleTranslations = async (helpCenterId: number) => {
        const otherLocales = !isUpdate
            ? newHelpCenter?.supportedLocales?.filter(
                  (locale) => locale !== newHelpCenter.defaultLocale
              )
            : newHelpCenter?.supportedLocales

        const createTranslationsWithMutation =
            otherLocales.map((locale) => {
                if (
                    !helpCenter ||
                    !helpCenter.supported_locales.includes(locale)
                ) {
                    return createHelpCenterTranslationMutateAsync([
                        undefined,
                        {help_center_id: helpCenterId},
                        getNewHelpCenterTranslation(locale),
                    ])
                }
            }) || []

        const deleteTranslationsWithMutation =
            helpCenter?.supported_locales?.map((locale) => {
                if (
                    !otherLocales.includes(locale) &&
                    locale !== newHelpCenter.defaultLocale
                ) {
                    return deleteHelpCenterTranslationMutateAsync([
                        undefined,
                        {help_center_id: helpCenterId, locale},
                    ])
                }
            }) || []

        try {
            await Promise.all(createTranslationsWithMutation)
            await Promise.all(deleteTranslationsWithMutation)
        } catch (error) {
            handleOnError(
                error,
                'Translations not successfully updated.',
                dispatch
            )
        }
    }

    const handleSaveCallback = async (
        payload: HelpCenter,
        redirectTo?: NEXT_ACTION
    ) => {
        switch (step) {
            case HelpCenterCreationWizardStep.Basics:
                await handleTranslations(payload.id)
                dispatch(
                    helpCenterUpdated({
                        ...payload,
                        supported_locales: newHelpCenter.supportedLocales,
                    })
                )
                break
            case HelpCenterCreationWizardStep.Branding:
                dispatch(
                    helpCenterUpdated({
                        ...payload,
                    })
                )
                break
            default:
                break
        }

        if (redirectTo) {
            handleAction(redirectTo, payload.id)
        }
    }

    return {
        helpCenter: newHelpCenter,
        allStoreIntegrations,
        handleFormUpdate,
        handleAction,
        handleSave,
        isLoading:
            isCreating ||
            isUpdating ||
            isCreatingHelpCenterTranslation ||
            isDeletingHelpCenterTranslation,
    }
}
