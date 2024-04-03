import {useCallback, useState} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
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
    HELP_CENTER_WIZARD_COMPLETED_QUERY_KEY,
    HELP_CENTER_WIZARD_COMPLETED_STATE,
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
import useEffectOnce from 'hooks/useEffectOnce'
import {getCurrentDomain} from 'state/currentAccount/selectors'
import {HelpCenterLayout} from 'pages/settings/helpCenter/types/layout.enum'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    getHelpCenterWizardInitialData,
    getUpdatedFields,
    handleOnError,
    mapApiHelpCenterToUIHelpCenter,
    mapUIHelpCenterToApiHelpCenter,
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
    deactivated: true, // Unpublish help center by default
    layout: HelpCenterLayout.ONEPAGER,
}

type SuccessModalParams = {
    articlesCount?: number
    isArticleRecommendationEnabled?: boolean
}

type HandleSaveParams = {
    stepName?: HelpCenterCreationWizardStep
    payload?: Partial<HelpCenterCreationWizard>
    redirectTo?: NEXT_ACTION
    successModalParams?: SuccessModalParams
}

type HelpCenterWizardOutput = {
    helpCenter: HelpCenterCreationWizard
    allStoreIntegrations: Integration[]
    handleFormUpdate: (payload: Partial<HelpCenterCreationWizard>) => void
    handleAction: (redirectTo: NEXT_ACTION, id?: number) => void
    handleSave: (params: HandleSaveParams) => void
    isLoading: boolean
}

const getNewHelpCenterSearchParams = (
    successModalParams?: SuccessModalParams
) => {
    if (!successModalParams || successModalParams.articlesCount === undefined)
        return undefined

    const helpCenterCompletedState =
        successModalParams.articlesCount > 0
            ? HELP_CENTER_WIZARD_COMPLETED_STATE.AllSet
            : successModalParams.isArticleRecommendationEnabled
            ? HELP_CENTER_WIZARD_COMPLETED_STATE.AlmostDone
            : undefined

    if (!helpCenterCompletedState) return undefined

    const searchParams = new URLSearchParams({
        [HELP_CENTER_WIZARD_COMPLETED_QUERY_KEY]: helpCenterCompletedState,
    })

    return searchParams.toString()
}

export const useHelpCenterCreationWizard = (
    helpCenter: HelpCenter | undefined,
    step: HelpCenterCreationWizardStep
): HelpCenterWizardOutput => {
    const isHelpCenterOnePagerEnabled =
        useFlags()[FeatureFlagKey.HelpCenterOnePager] || false
    const accountCurrentDomain = useAppSelector(getCurrentDomain)
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

    const {mutateAsync: createHelpCenterMutateAsync, isLoading: isCreating} =
        useCreateHelpCenter()
    const {mutateAsync: updateHelpCenterMutateAsync, isLoading: isUpdating} =
        useUpdateHelpCenter()
    const {
        mutateAsync: createHelpCenterTranslationMutateAsync,
        isLoading: isCreatingHelpCenterTranslation,
    } = useCreateHelpCenterTranslation()
    const {
        mutateAsync: deleteHelpCenterTranslationMutateAsync,
        isLoading: isDeletingHelpCenterTranslation,
    } = useDeleteHelpCenterTranslation()

    const isUpdate = !!helpCenter?.id

    useEffectOnce(() => {
        const newHelpCenter = mapApiHelpCenterToUIHelpCenter(helpCenter)

        const initialData = getHelpCenterWizardInitialData(
            accountCurrentDomain,
            allStoreIntegrations,
            isHelpCenterOnePagerEnabled
        )

        setNewHelpCenter(
            helpCenter ? newHelpCenter : {...newHelpCenter, ...initialData}
        )
    })

    const handleAction = (
        redirectTo: NEXT_ACTION,
        id?: number,
        searchParams?: string
    ) => {
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
            case NEXT_ACTION.NEW_HELP_CENTER:
                if (!id) return
                history.replace({
                    pathname: `/app/settings/help-center/${id}/articles`, // Article is default path for the HC
                    search: searchParams,
                })
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

    const handleCreateHelpCenter = async (payload: Partial<HelpCenter>) => {
        try {
            const res = await createHelpCenterMutateAsync([
                undefined,
                payload as HelpCenter,
            ])
            if (res) {
                dispatch(helpCenterCreated(res.data))
                void enableArticleRecommendation(res.data)
                await handleSaveCallback(res.data)
            }

            return res?.data
        } catch (error) {
            handleOnError(
                error,
                'Help center not successfully created.',
                dispatch
            )

            return null
        }
    }

    const handleUpdateHelpCenter = async (payload: Partial<HelpCenter>) => {
        if (!helpCenter) return

        const fieldsToUpdate = getUpdatedFields(payload, helpCenter)

        try {
            const res = await updateHelpCenterMutateAsync([
                undefined,
                {help_center_id: helpCenter.id},
                fieldsToUpdate,
            ])

            if (res) {
                await handleSaveCallback(res.data)
            }

            return res?.data
        } catch (error) {
            handleOnError(
                error,
                'Help center not successfully updated.',
                dispatch
            )

            return null
        }
    }

    const handleSave = async ({
        redirectTo,
        stepName,
        payload,
        successModalParams,
    }: HandleSaveParams) => {
        const tempHelpCenterData = mapUIHelpCenterToApiHelpCenter({
            ...newHelpCenter,
            ...payload,
            stepName: stepName ?? step,
        })

        const helpCenterAction = () =>
            isUpdate
                ? handleUpdateHelpCenter(tempHelpCenterData)
                : handleCreateHelpCenter(tempHelpCenterData)

        const helpCenter = await helpCenterAction()

        if (redirectTo) {
            const searchParams =
                getNewHelpCenterSearchParams(successModalParams)
            handleAction(redirectTo, helpCenter?.id, searchParams)
        }

        return
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

    const handleSaveCallback = async (payload: HelpCenter) => {
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
