import { useCallback, useMemo, useState } from 'react'

import { useParams } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import { useSearchParam } from 'hooks/useSearchParam'
import {
    AiAgentOnboardingWizardStep,
    AiAgentOnboardingWizardType,
    StoreConfiguration,
} from 'models/aiAgent/types'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { HelpCenter } from 'models/helpCenter/types'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useConfigurationForm } from 'pages/aiAgent/hooks/useConfigurationForm'
import { useGetOrCreateSnippetHelpCenter } from 'pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter'
import { getFormValuesFromStoreConfiguration } from 'pages/aiAgent/hooks/utils/configurationForm.utils'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import history from 'pages/history'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import {
    DEFAULT_FORM_VALUES_WITH_WIZARD,
    INITIAL_FORM_VALUES,
    WIZARD_BUTTON_ACTIONS,
    WIZARD_POST_COMPLETION_QUERY_KEY,
    WIZARD_POST_COMPLETION_STATE,
    WIZARD_UPDATE_QUERY_KEY,
} from '../../constants'
import { FormValues, UpdateValue, WizardFormValues } from '../../types'

type handleSaveParams = {
    publicUrls?: string[]
    hasExternalFiles?: boolean
    redirectTo?: WIZARD_BUTTON_ACTIONS
    stepName?: AiAgentOnboardingWizardStep
    payload?: Partial<FormValues>
}

type AiAgentOnboardingWizardOutput = {
    storeFormValues: FormValues
    faqHelpCenters: HelpCenter[]
    snippetHelpCenter: HelpCenter | null
    handleFormUpdate: (payload: Partial<FormValues>) => void
    handleAction: (redirectTo: WIZARD_BUTTON_ACTIONS) => void
    handleSave: (params: handleSaveParams) => void
    isLoading: boolean
    updateValue: UpdateValue<FormValues>
    storeConfiguration: StoreConfiguration | undefined
    isUpdateWizardSetup: boolean
}

type Props = {
    step: AiAgentOnboardingWizardStep
}

const INITIAL_WIZARD_FORM_VALUES: WizardFormValues = {
    completedDatetime: null,
    stepName: null,
    enabledChannels: [],
    isAutoresponderTurnedOff: null,
    onCompletePathway: null,
}

export const useAiAgentOnboardingWizard = ({
    step,
}: Props): AiAgentOnboardingWizardOutput => {
    const { shopType, shopName } = useParams<{
        shopType: string
        shopName: string
    }>()
    const navigateWizardSteps = useNavigateWizardSteps()
    const { routes } = useAiAgentNavigation({ shopName })
    const [isLoading, setIsLoading] = useState(false)
    const { storeConfiguration, isLoading: isLoadingStoreConfiguration } =
        useAiAgentStoreConfigurationContext()
    const [wizardUpdate, setWizardUpdate] = useSearchParam(
        WIZARD_UPDATE_QUERY_KEY,
    )

    const isStepAfter = (
        registeredStep: AiAgentOnboardingWizardStep,
        currentStep: AiAgentOnboardingWizardStep,
    ) => {
        const stepOrder = [
            AiAgentOnboardingWizardStep.Personalize,
            AiAgentOnboardingWizardStep.Knowledge,
        ]

        return (
            stepOrder.indexOf(registeredStep) > stepOrder.indexOf(currentStep)
        )
    }

    const registeredStep = storeConfiguration?.wizard?.stepName
    const isOnWizardUpdate = useMemo(
        () => registeredStep && isStepAfter(registeredStep, step),
        [registeredStep, step],
    )

    const { data: helpCenterListData, isLoading: isLoadingHelpCenters } =
        useGetHelpCenterList(
            { type: 'faq', per_page: HELP_CENTER_MAX_CREATION },
            {
                staleTime: 1000 * 60 * 5,
            },
        )

    const faqHelpCenters = useMemo(
        () =>
            (helpCenterListData?.data.data ?? []).filter(
                (hc) => hc.shop_name === shopName || hc.shop_name === null,
            ),
        [helpCenterListData, shopName],
    )

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const {
        helpCenter: snippetHelpCenter,
        isLoading: isLoadingSnippetHelpCenter,
    } = useGetOrCreateSnippetHelpCenter({
        accountDomain,
        shopName,
    })

    const {
        isPendingCreateOrUpdate,
        handleOnSave,
        formValues,
        setFormValues,
        updateValue,
    } = useConfigurationForm({
        initValues: DEFAULT_FORM_VALUES_WITH_WIZARD,
        shopName,
    })

    useEffectOnce(() => {
        const initialStoreFormValues: FormValues = {
            ...INITIAL_FORM_VALUES,
            helpCenterId: null,
            ticketSampleRate: null,
            wizard: {
                ...INITIAL_WIZARD_FORM_VALUES,
            },
        }

        const newStoreFormValues: FormValues = storeConfiguration
            ? getFormValuesFromStoreConfiguration(storeConfiguration)
            : initialStoreFormValues

        setFormValues(newStoreFormValues)
    })

    const getPostCompletionSearchParams = (
        state: WIZARD_POST_COMPLETION_STATE,
    ) => {
        const searchParams = new URLSearchParams({
            [WIZARD_POST_COMPLETION_QUERY_KEY]: state,
        })
        return searchParams.toString()
    }

    const aiAgentNavigation = useAiAgentNavigation({ shopName })
    const handleAction = (redirectTo: WIZARD_BUTTON_ACTIONS) => {
        if (!shopType || !shopName) return

        const version = AiAgentOnboardingWizardType.TwoSteps

        switch (redirectTo) {
            case WIZARD_BUTTON_ACTIONS.CANCEL:
                logEvent(SegmentEvent.AiAgentOnboardingWizardCancelClicked, {
                    step,
                    version,
                })
                history.replace(aiAgentNavigation.routes.main)
                break
            case WIZARD_BUTTON_ACTIONS.SAVE_AND_CUSTOMIZE_LATER:
                logEvent(SegmentEvent.AiAgentOnboardingWizardSaveClicked, {
                    step,
                    version,
                })
                history.replace(aiAgentNavigation.routes.main)
                break
            case WIZARD_BUTTON_ACTIONS.PREVIOUS_STEP:
                logEvent(SegmentEvent.AiAgentOnboardingWizardBackClicked, {
                    step,
                    version,
                })
                navigateWizardSteps.goToPreviousStep()
                break
            case WIZARD_BUTTON_ACTIONS.NEXT_STEP:
                logEvent(SegmentEvent.AiAgentOnboardingWizardNextClicked, {
                    step,
                    version,
                })
                setWizardUpdate(isOnWizardUpdate ? 'true' : null)
                navigateWizardSteps.goToNextStep()
                break
            case WIZARD_BUTTON_ACTIONS.FINISH_TO_KNOWLEDGE:
                logEvent(SegmentEvent.AiAgentOnboardingWizardFinishClicked, {
                    step,
                    version,
                    redirectTo: 'knowledge',
                })

                history.replace({
                    pathname: routes.configuration(),
                    search: getPostCompletionSearchParams(
                        WIZARD_POST_COMPLETION_STATE.configuration,
                    ),
                })
                break
            case WIZARD_BUTTON_ACTIONS.FINISH_TO_TEST:
                logEvent(SegmentEvent.AiAgentOnboardingWizardFinishClicked, {
                    step,
                    version,
                    redirectTo: 'test',
                })
                history.replace({
                    pathname: routes.test,
                    search: getPostCompletionSearchParams(
                        WIZARD_POST_COMPLETION_STATE.test,
                    ),
                })
                break
            case WIZARD_BUTTON_ACTIONS.FINISH_TO_GUIDANCE:
                logEvent(SegmentEvent.AiAgentOnboardingWizardFinishClicked, {
                    step,
                    version,
                    redirectTo: 'guidance',
                })
                history.replace({
                    pathname: routes.guidance,
                    search: getPostCompletionSearchParams(
                        WIZARD_POST_COMPLETION_STATE.guidance,
                    ),
                })
                break
            default:
                break
        }
    }

    const logConnectedHelpCenterEvent = (helpCenterId: number | null) => {
        if (!helpCenterId) return

        logEvent(SegmentEvent.AiAgentOnboardingWizardHelpCenterConnected, {
            step: AiAgentOnboardingWizardStep.Knowledge,
            version: AiAgentOnboardingWizardType.TwoSteps,
            helpCenterId,
        })
    }

    const handleFormUpdate = useCallback(
        (payload: Partial<FormValues>) => {
            setFormValues((prevStoreFormValues) => ({
                ...prevStoreFormValues,
                ...payload,
            }))
        },
        [setFormValues],
    )

    const handleSave = async ({
        publicUrls,
        hasExternalFiles,
        redirectTo,
        stepName,
        payload,
    }: handleSaveParams) => {
        setIsLoading(true)
        const res = await handleOnSave({
            publicUrls,
            hasExternalFiles,
            shopName,
            payload,
            stepName: stepName || step,
        })

        setIsLoading(false)
        if (!res) return

        if (step === AiAgentOnboardingWizardStep.Knowledge) {
            logConnectedHelpCenterEvent(formValues.helpCenterId)
        }

        if (redirectTo) {
            handleAction(redirectTo)
        }
    }

    return {
        storeFormValues: formValues,
        faqHelpCenters,
        snippetHelpCenter,
        handleFormUpdate,
        handleAction,
        handleSave,
        updateValue,
        isUpdateWizardSetup: !!wizardUpdate,
        isLoading:
            isPendingCreateOrUpdate ||
            isLoadingHelpCenters ||
            isLoadingSnippetHelpCenter ||
            isLoading ||
            isLoadingStoreConfiguration,
        storeConfiguration,
    }
}
