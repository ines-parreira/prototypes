import {useParams} from 'react-router-dom'
import {useCallback, useMemo, useState} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import {
    AiAgentOnboardingWizardStep,
    StoreConfiguration,
} from 'models/aiAgent/types'
import history from 'pages/history'
import {useGetHelpCenterList} from 'models/helpCenter/queries'
import {HELP_CENTER_MAX_CREATION} from 'pages/settings/helpCenter/constants'
import {HelpCenter} from 'models/helpCenter/types'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import {useConfigurationForm} from 'pages/automate/aiAgent/hooks/useConfigurationForm'
import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {useGetOrCreateSnippetHelpCenter} from 'pages/automate/aiAgent/hooks/useGetOrCreateSnippetHelpCenter'
import {logEvent, SegmentEvent} from 'common/segment'
import {FormValues, UpdateValue, WizardFormValues} from '../../types'
import {getFormValuesFromStoreConfiguration} from '../../components/StoreConfigForm/StoreConfigForm.utils'
import {
    DEFAULT_FORM_VALUES_WITH_WIZARD,
    INITIAL_FORM_VALUES,
    WIZARD_BUTTON_ACTIONS,
} from '../../constants'

type handleSaveParams = {
    publicUrls?: string[]
    redirectTo?: WIZARD_BUTTON_ACTIONS
    stepName?: AiAgentOnboardingWizardStep
    payload?: Partial<FormValues>
    successModalParams?: string
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
}

type Props = {
    storeConfiguration?: StoreConfiguration
    step: AiAgentOnboardingWizardStep
}

const INITIAL_WIZARD_FORM_VALUES: WizardFormValues = {
    completedDatetime: null,
    stepName: null,
    hasEducationStepEnabled: false,
    enabledChannels: [],
    isAutoresponderTurnedOff: null,
    onCompletePathway: null,
}

export const useAiAgentOnboardingWizard = ({
    storeConfiguration,
    step,
}: Props): AiAgentOnboardingWizardOutput => {
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()
    const navigateWizardSteps = useNavigateWizardSteps()
    const {routes} = useAiAgentNavigation({shopName})
    const [isLoading, setIsLoading] = useState(false)

    const {data: helpCenterListData, isLoading: isLoadingHelpCenters} =
        useGetHelpCenterList(
            {type: 'faq', per_page: HELP_CENTER_MAX_CREATION},
            {
                staleTime: 1000 * 60 * 5,
            }
        )

    const faqHelpCenters = useMemo(
        () =>
            (helpCenterListData?.data.data ?? []).filter(
                (hc) => hc.shop_name === shopName || hc.shop_name === null
            ),
        [helpCenterListData, shopName]
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

    const isAiAgentOnboardingWizardEducationalStepEnabled =
        useFlags()[FeatureFlagKey.AiAgentOnboardingWizardEducationalStep]

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
                hasEducationStepEnabled:
                    isAiAgentOnboardingWizardEducationalStepEnabled,
            },
        }

        const newStoreFormValues: FormValues = storeConfiguration
            ? getFormValuesFromStoreConfiguration(storeConfiguration)
            : initialStoreFormValues

        setFormValues(newStoreFormValues)
    })

    const handleAction = (
        redirectTo: WIZARD_BUTTON_ACTIONS,
        searchParams?: string
    ) => {
        if (!shopType || !shopName) return

        switch (redirectTo) {
            case WIZARD_BUTTON_ACTIONS.CANCEL:
                logEvent(SegmentEvent.AiAgentOnboardingWizardCancelClicked)
                history.replace(
                    `/app/automation/${shopType}/${shopName}/ai-agent`
                )
                break
            case WIZARD_BUTTON_ACTIONS.SAVE_AND_CUSTOMIZE_LATER:
                logEvent(SegmentEvent.AiAgentOnboardingWizardSaveClicked)
                history.replace(
                    `/app/automation/${shopType}/${shopName}/ai-agent`
                )
                break
            case WIZARD_BUTTON_ACTIONS.PREVIOUS_STEP:
                logEvent(SegmentEvent.AiAgentOnboardingWizardBackClicked)
                navigateWizardSteps.goToPreviousStep()
                break
            case WIZARD_BUTTON_ACTIONS.NEXT_STEP:
                logEvent(SegmentEvent.AiAgentOnboardingWizardNextClicked)
                navigateWizardSteps.goToNextStep()
                break
            case WIZARD_BUTTON_ACTIONS.FINISH_TO_KNOWLEDGE:
                logEvent(SegmentEvent.AiAgentOnboardingWizardFinishClicked, {
                    redirectTo: 'knowledge',
                })
                history.replace({
                    // TODO link to knowledge tab once it is implemented
                    pathname: routes.configuration('knowledge'),
                    search: searchParams,
                })
                break
            case WIZARD_BUTTON_ACTIONS.FINISH_TO_TEST:
                logEvent(SegmentEvent.AiAgentOnboardingWizardFinishClicked, {
                    redirectTo: 'test',
                })
                history.replace({
                    pathname: routes.test,
                    search: searchParams,
                })
                break
            case WIZARD_BUTTON_ACTIONS.FINISH_TO_GUIDANCE:
                logEvent(SegmentEvent.AiAgentOnboardingWizardFinishClicked, {
                    redirectTo: 'guidance',
                })
                history.replace({
                    pathname: routes.guidance,
                    search: searchParams,
                })
                break
            default:
                break
        }
    }

    const logConnectedHelpCenterEvent = (helpCenterId: number | null) => {
        if (!helpCenterId) return
        logEvent(SegmentEvent.AiAgentOnboardingWizardHelpCenterConnected, {
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
        [setFormValues]
    )

    const handleSave = async ({
        publicUrls,
        redirectTo,
        successModalParams,
        stepName,
        payload,
    }: handleSaveParams) => {
        setIsLoading(true)
        const res = await handleOnSave({
            publicUrls,
            shopName,
            storeConfiguration,
            payload,
            stepName: stepName || step,
        })

        setIsLoading(false)
        if (!res) return

        if (step === AiAgentOnboardingWizardStep.Knowledge) {
            logConnectedHelpCenterEvent(formValues.helpCenterId)
        }

        if (redirectTo) {
            handleAction(redirectTo, successModalParams)
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
        isLoading:
            isPendingCreateOrUpdate ||
            isLoadingHelpCenters ||
            isLoadingSnippetHelpCenter ||
            isLoading,
    }
}
