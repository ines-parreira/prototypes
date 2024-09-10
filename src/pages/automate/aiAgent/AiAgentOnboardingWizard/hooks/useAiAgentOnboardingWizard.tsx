import {useParams} from 'react-router-dom'
import {useCallback, useMemo, useState} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import {
    AiAgentOnboardingWizardStep,
    CreateStoreConfigurationPayload,
    StoreConfiguration,
} from 'models/aiAgent/types'
import history from 'pages/history'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useEffectOnce from 'hooks/useEffectOnce'
import {useGetHelpCenterList} from 'models/helpCenter/queries'
import {HELP_CENTER_MAX_CREATION} from 'pages/settings/helpCenter/constants'
import {HelpCenter} from 'models/helpCenter/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {INITIAL_FORM_VALUES} from '../../components/StoreConfigForm/StoreConfigForm'
import {FormValues, ValidFormValues, WizardFormValues} from '../../types'
import {useAiAgentStoreConfigurationContext} from '../../providers/AiAgentStoreConfigurationContext'
import {
    getFormValuesFromStoreConfiguration,
    getStoreConfigurationFromFormValues,
} from '../../components/StoreConfigForm/StoreConfigForm.utils'
import {validateConfigurationFormValues} from '../../hooks/useConfigurationForm'
import {
    DEFAULT_FORM_VALUES_WITH_WIZARD,
    WIZARD_BUTTON_ACTIONS,
} from '../../constants'
import {useAiAgentNavigation} from '../../hooks/useAiAgentNavigation'

type handleSaveParams = {
    publicUrls?: string[]
    redirectTo?: WIZARD_BUTTON_ACTIONS
    successModalParams?: string
}

type AiAgentOnboardingWizardOutput = {
    storeFormValues: FormValues
    allHelpCenters: HelpCenter[]
    handleFormUpdate: (payload: Partial<FormValues>) => void
    handleAction: (redirectTo: WIZARD_BUTTON_ACTIONS) => void
    handleSave: (params: handleSaveParams) => void
    isLoading: boolean
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
    const dispatch = useAppDispatch()
    const navigateWizardSteps = useNavigateWizardSteps()
    const {routes} = useAiAgentNavigation({shopName})

    const {data: helpCenterListData, isLoading: isLoadingHelpCenters} =
        useGetHelpCenterList(
            {type: 'faq', per_page: HELP_CENTER_MAX_CREATION},
            {
                staleTime: 1000 * 60 * 5,
            }
        )

    const helpCenters = useMemo(
        () =>
            (helpCenterListData?.data.data ?? []).filter(
                (hc) => hc.shop_name === shopName || hc.shop_name === null
            ),
        [helpCenterListData, shopName]
    )

    const {
        isPendingCreateOrUpdate,
        createStoreConfiguration,
        updateStoreConfiguration,
    } = useAiAgentStoreConfigurationContext()

    const isAiAgentOnboardingWizardEducationalStepEnabled =
        useFlags()[FeatureFlagKey.AiAgentOnboardingWizardEducationalStep]

    const [newStoreFormValues, setNewStoreFormValues] = useState<FormValues>(
        DEFAULT_FORM_VALUES_WITH_WIZARD
    )

    const isUpdate = !!storeConfiguration?.wizard

    useEffectOnce(() => {
        const initialHelpCenter = helpCenters[0]

        const initialStoreFormValues: FormValues = {
            ...INITIAL_FORM_VALUES,
            helpCenterId: initialHelpCenter?.id ?? null,
            ticketSampleRate: null,
            wizard: {
                ...INITIAL_WIZARD_FORM_VALUES,
                stepName: step,
                hasEducationStepEnabled:
                    isAiAgentOnboardingWizardEducationalStepEnabled,
            },
        }

        const newStoreFormValues: FormValues = storeConfiguration
            ? getFormValuesFromStoreConfiguration(storeConfiguration)
            : initialStoreFormValues

        setNewStoreFormValues(newStoreFormValues)
    })

    const handleAction = (
        redirectTo: WIZARD_BUTTON_ACTIONS,
        searchParams?: string
    ) => {
        if (!shopType || !shopName) return

        switch (redirectTo) {
            case WIZARD_BUTTON_ACTIONS.BACK_TO_WELCOME_PAGE:
                history.replace(
                    `/app/automation/${shopType}/${shopName}/ai-agent`
                )
                break
            case WIZARD_BUTTON_ACTIONS.PREVIOUS_STEP:
                navigateWizardSteps.goToPreviousStep()
                break
            case WIZARD_BUTTON_ACTIONS.NEXT_STEP:
                navigateWizardSteps.goToNextStep()
                break
            case WIZARD_BUTTON_ACTIONS.FINISH_TO_KNOWLEDGE:
                history.replace({
                    // TODO link to knowledge tab once it is implemented
                    pathname: routes.configuration('knowledge'),
                    search: searchParams,
                })
                break
            case WIZARD_BUTTON_ACTIONS.FINISH_TO_TEST:
                history.replace({
                    pathname: `/app/automation/${shopType}/${shopName}/ai-agent/test`,
                    search: searchParams,
                })
                break
            case WIZARD_BUTTON_ACTIONS.FINISH_TO_GUIDANCE:
                history.replace({
                    pathname: `/app/automation/${shopType}/${shopName}/ai-agent/guidance`,
                    search: searchParams,
                })
                break
            default:
                break
        }
    }

    const handleFormUpdate = useCallback(
        (payload: Partial<FormValues>) => {
            setNewStoreFormValues((prevStoreFormValues) => ({
                ...prevStoreFormValues,
                ...payload,
            }))
        },
        [setNewStoreFormValues]
    )

    const handleCreateStoreConfiguration = async (
        payload: CreateStoreConfigurationPayload
    ) => {
        try {
            await createStoreConfiguration(payload)
        } catch (error) {
            void dispatch(
                notify({
                    message: 'Failed to create AI Agent Configuration',
                    status: NotificationStatus.Error,
                })
            )
        }
    }

    const handleUpdateStoreConfiguration = async (
        payload: StoreConfiguration
    ) => {
        try {
            await updateStoreConfiguration(payload)
        } catch (error) {
            void dispatch(
                notify({
                    message: 'Failed to update AI Agent Configuration',
                    status: NotificationStatus.Error,
                })
            )
        }
    }

    const handleSave = async ({
        publicUrls,
        redirectTo,
        successModalParams,
    }: handleSaveParams) => {
        let validFormValues: ValidFormValues
        try {
            validFormValues = validateConfigurationFormValues(
                newStoreFormValues,
                publicUrls ?? []
            )
        } catch (error) {
            void dispatch(
                notify({
                    message: (error as Error).message,
                    status: NotificationStatus.Error,
                })
            )
            return
        }

        const configurationToSubmit = getStoreConfigurationFromFormValues(
            shopName,
            validFormValues
        )

        const storeConfigurationAction = () =>
            isUpdate
                ? handleUpdateStoreConfiguration({
                      ...storeConfiguration,
                      ...configurationToSubmit,
                      wizard: storeConfiguration.wizard && {
                          ...storeConfiguration.wizard,
                          ...configurationToSubmit.wizard,
                      },
                  })
                : handleCreateStoreConfiguration(configurationToSubmit)

        await storeConfigurationAction()

        if (redirectTo) {
            handleAction(redirectTo, successModalParams)
        }
    }

    return {
        storeFormValues: newStoreFormValues,
        allHelpCenters: helpCenters,
        handleFormUpdate,
        handleAction,
        handleSave,
        isLoading: isPendingCreateOrUpdate || isLoadingHelpCenters,
    }
}
