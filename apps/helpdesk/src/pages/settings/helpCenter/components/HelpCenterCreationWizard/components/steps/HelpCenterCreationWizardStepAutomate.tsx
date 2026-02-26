import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'

import { useEffectOnce } from '@repo/hooks'

import { LegacyLabel as Label } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { useGetHelpCenterArticleList } from 'models/helpCenter/queries'
import type { HelpCenter } from 'models/helpCenter/types'
import { HelpCenterCreationWizardStep } from 'models/helpCenter/types'
import type { StoreIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import type { Entrypoint } from 'pages/automate/common/components/WorkflowsFeatureList'
import useHelpCenterAutomationSettings from 'pages/automate/common/hooks/useHelpCenterAutomationSettings'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import WizardFooter, {
    FOOTER_BUTTONS,
} from 'pages/common/components/wizard/WizardFooter'
import WizardStepSkeleton from 'pages/common/components/wizard/WizardStepSkeleton'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'
import type { HelpCenterContactFormIntegrationTypes } from 'pages/settings/common/SelectStore/SelectStore'
import SelectStore from 'pages/settings/common/SelectStore/SelectStore'
import {
    HELP_CENTER_STEPS_DESCRIPTIONS,
    HELP_CENTER_STEPS_LABELS,
    HELP_CENTER_STEPS_TITLES,
    NEXT_ACTION,
} from 'pages/settings/helpCenter/constants'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

import { mapEntrypointsToAutomationSettings } from '../../HelpCenterCreationWizardUtils'
import type { UseHelpCenterAutomationFormState } from '../../hooks/useHelpCenterAutomationForm'
import { useHelpCenterAutomationForm } from '../../hooks/useHelpCenterAutomationForm'
import { useHelpCenterCreationWizard } from '../../hooks/useHelpCenterCreationWizard'
import HelpCenterWizardArticleRec from '../HelpCenterWizardArticleRec/HelpCenterWizardArticleRec'
import HelpCenterWizardAutomationPreview from '../HelpCenterWizardAutomationPreview/HelpCenterWizardAutomationPreview'
import HelpCenterWizardFlows from '../HelpCenterWizardFlows/HelpCenterWizardFlows'
import HelpCenterWizardOrderManagement from '../HelpCenterWizardOrderManagement/HelpCenterWizardOrderManagement'

import css from './HelpCenterCreationWizardStepAutomate.less'

type Props = {
    helpCenter: HelpCenter
    isUpdate?: boolean
}

type HelpCenterCreationWizardAutomateItemsProps = Props & {
    storeIntegration: StoreIntegration
    storeIntegrationName: string
    isHelpCenterWizardLoading: boolean
    state: UseHelpCenterAutomationFormState
    updateOrderManagementEnabled: (enabled: boolean) => void
    updateArticleRecommendationEnabled: (enabled: boolean) => void
    updateFlows: (flows: Entrypoint[]) => void
    setIsSelfServiceConfigurationLoading: (isLoading: boolean) => void
    isArticleRecommendationFeatureEnabled: boolean
}

type HelpCenterCreationWizardAutomateItemsRef = () => Promise<void>

const HelpCenterCreationWizardAutomateItems = forwardRef<
    HelpCenterCreationWizardAutomateItemsRef,
    HelpCenterCreationWizardAutomateItemsProps
>(
    (
        {
            helpCenter,
            storeIntegration,
            storeIntegrationName,
            isHelpCenterWizardLoading,
            state,
            updateOrderManagementEnabled,
            updateArticleRecommendationEnabled,
            updateFlows,
            setIsSelfServiceConfigurationLoading,
            isArticleRecommendationFeatureEnabled,
        },
        ref,
    ) => {
        const {
            isFetchPending: isSelfServiceConfigurationPending,
            isUpdatePending: isSelfServiceConfigurationUpdating,
            handleSelfServiceConfigurationUpdate,
            selfServiceConfiguration,
        } = useSelfServiceConfiguration(
            storeIntegration.type,
            storeIntegrationName,
            // Avoid notifications about the self service configuration
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            () => {},
        )

        useEffect(() => {
            setIsSelfServiceConfigurationLoading(
                isSelfServiceConfigurationPending ||
                    isSelfServiceConfigurationUpdating,
            )
        }, [
            isSelfServiceConfigurationPending,
            isSelfServiceConfigurationUpdating,
            setIsSelfServiceConfigurationLoading,
        ])

        const isArticleRecomAlreadyEnabled =
            !!selfServiceConfiguration?.articleRecommendationHelpCenterId &&
            // we have different help center in the self service configuration. This prevents from case when user clicks "Save and customize later"
            selfServiceConfiguration?.articleRecommendationHelpCenterId !==
                helpCenter.id

        const chatIntegrations = useAppSelector(
            getIntegrationsByTypes([IntegrationType.GorgiasChat]),
        )

        const {
            automationSettings,
            handleHelpCenterAutomationSettingsUpdate,
            isFetchPending,
        } = useHelpCenterAutomationSettings(helpCenter.id, false)

        useEffect(() => {
            const shouldEnableOrderManagement =
                storeIntegration.type === IntegrationType.Shopify &&
                helpCenter.self_service_deactivated_datetime === null
            if (!isFetchPending) {
                updateOrderManagementEnabled(shouldEnableOrderManagement)
            }
        }, [
            helpCenter.self_service_deactivated_datetime,
            isFetchPending,
            storeIntegration.type,
            updateOrderManagementEnabled,
        ])

        useEffect(() => {
            const helpCenterFlows = automationSettings.workflows
            if (!isFetchPending && helpCenterFlows) {
                updateFlows(
                    helpCenterFlows.map((flow) => ({
                        workflow_id: flow.id,
                        enabled: flow.enabled,
                    })),
                )
            }
        }, [automationSettings.workflows, isFetchPending, updateFlows])

        useEffect(() => {
            if (
                !isFetchPending &&
                chatIntegrations.length > 0 &&
                isArticleRecommendationFeatureEnabled
            ) {
                updateArticleRecommendationEnabled(
                    !isArticleRecomAlreadyEnabled,
                )
            }
        }, [
            chatIntegrations.length,
            isArticleRecomAlreadyEnabled,
            isFetchPending,
            updateArticleRecommendationEnabled,
            isArticleRecommendationFeatureEnabled,
        ])

        const onSave = useCallback(async () => {
            const automationSettings = mapEntrypointsToAutomationSettings(
                state.flows,
            )
            await handleHelpCenterAutomationSettingsUpdate(automationSettings)

            // Only update article recommendation if the feature is enabled
            if (isArticleRecommendationFeatureEnabled) {
                // These 2 conditions help avoid the case when AR toggle disabled but we have different HC in the selfServiceConfiguration
                if (
                    state.articleRecommendationEnabled &&
                    selfServiceConfiguration?.articleRecommendationHelpCenterId !==
                        helpCenter.id
                ) {
                    await handleSelfServiceConfigurationUpdate((draft) => {
                        draft.articleRecommendationHelpCenterId = helpCenter.id
                    })
                }

                if (
                    !state.articleRecommendationEnabled &&
                    selfServiceConfiguration?.articleRecommendationHelpCenterId ===
                        helpCenter.id
                ) {
                    await handleSelfServiceConfigurationUpdate((draft) => {
                        draft.articleRecommendationHelpCenterId = undefined
                    })
                }
            }
        }, [
            handleHelpCenterAutomationSettingsUpdate,
            handleSelfServiceConfigurationUpdate,
            helpCenter.id,
            selfServiceConfiguration?.articleRecommendationHelpCenterId,
            state.articleRecommendationEnabled,
            state.flows,
            isArticleRecommendationFeatureEnabled,
        ])

        useImperativeHandle(ref, () => onSave, [onSave])

        const isLoading =
            isHelpCenterWizardLoading ||
            isSelfServiceConfigurationPending ||
            isSelfServiceConfigurationUpdating

        const isFormDisabled = !automationSettings || isLoading

        const hasActiveChat = !!chatIntegrations.length
        const shouldShowArticleRecommendation =
            hasActiveChat && isArticleRecommendationFeatureEnabled

        return (
            <>
                {storeIntegration?.type === IntegrationType.Shopify && (
                    <HelpCenterWizardOrderManagement
                        onChange={updateOrderManagementEnabled}
                        isToggled={state.orderManagementEnabled}
                        isDisabled={isFormDisabled}
                    />
                )}
                {shouldShowArticleRecommendation && (
                    <HelpCenterWizardArticleRec
                        isArticleRecomAlreadyEnabled={
                            isArticleRecomAlreadyEnabled
                        }
                        articleRecommendationEnabled={
                            state.articleRecommendationEnabled
                        }
                        onArticleRecommendationEnabledChange={
                            updateArticleRecommendationEnabled
                        }
                        isSectionDisabled={isFormDisabled}
                    />
                )}

                <HelpCenterWizardFlows
                    helpCenterId={helpCenter.id}
                    shopType={storeIntegration.type}
                    shopName={storeIntegrationName}
                    supportedLocales={helpCenter.supported_locales}
                    flows={state.flows}
                    onChange={updateFlows}
                    isLoading={isFetchPending}
                    isDisabled={isFormDisabled}
                />
            </>
        )
    },
)

const HelpCenterCreationWizardStepAutomate = ({ helpCenter }: Props) => {
    const [selectedStoreIntegration, setSelectedStoreIntegration] =
        useState<StoreIntegration>()
    const [
        isSelfServiceConfigurationLoading,
        setIsSelfServiceConfigurationLoading,
    ] = useState(false)
    const [shouldDisplayFormErrors, setShouldDisplayFormErrors] =
        useState(false)
    const automateItemsRef =
        useRef<HelpCenterCreationWizardAutomateItemsRef>(null)

    const { enabledInSettings: isArticleRecommendationFeatureEnabled } =
        useIsArticleRecommendationsEnabledWhileSunset()

    const {
        isLoading: isHelpCenterWizardLoading,
        handleAction,
        handleSave,
        handleFormUpdate,
    } = useHelpCenterCreationWizard(
        helpCenter,
        HelpCenterCreationWizardStep.Automate,
    )

    const allStoreIntegrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ]),
    )

    const shopifyIntegrations = useMemo(
        () =>
            allStoreIntegrations.filter(
                (storeIntegration) =>
                    storeIntegration.type === IntegrationType.Shopify,
            ),
        [allStoreIntegrations],
    )

    useEffectOnce(() => {
        const foundIntegration = allStoreIntegrations.find(
            (integration) => integration.name === helpCenter.shop_name,
        )
        if (foundIntegration) {
            setSelectedStoreIntegration(foundIntegration)
        }
    })

    const selectedStoreIntegrationName = selectedStoreIntegration
        ? getShopNameFromStoreIntegration(selectedStoreIntegration)
        : ''

    const {
        state,
        updateOrderManagementEnabled,
        updateArticleRecommendationEnabled,
        updateFlows,
    } = useHelpCenterAutomationForm({
        orderManagementEnabled:
            helpCenter.self_service_deactivated_datetime === null,
    })

    const { data: helpCenterArticles } = useGetHelpCenterArticleList(
        helpCenter.id,
        {
            version_status: 'latest_draft',
            locale: helpCenter.default_locale,
        },
    )

    const isStoreRequired = !!shopifyIntegrations.length

    const isInvalidForm = isStoreRequired && !selectedStoreIntegration

    const onSave = async () => {
        if (automateItemsRef.current) {
            await automateItemsRef.current()
        }
    }

    const onFooterAction = async (buttonClicked: FOOTER_BUTTONS) => {
        if (buttonClicked !== FOOTER_BUTTONS.BACK) {
            setShouldDisplayFormErrors(isInvalidForm)
        }
        switch (buttonClicked) {
            case FOOTER_BUTTONS.BACK:
                handleAction(NEXT_ACTION.PREVIOUS_STEP)
                break
            case FOOTER_BUTTONS.FINISH:
                if (!isInvalidForm) {
                    await onSave()
                    handleSave({
                        redirectTo: NEXT_ACTION.NEW_HELP_CENTER,
                        payload: {
                            wizardCompleted: true,
                            orderManagementEnabled:
                                state.orderManagementEnabled,
                        },
                        successModalParams: {
                            articlesCount: helpCenterArticles?.data.length,
                            isArticleRecommendationEnabled:
                                state.articleRecommendationEnabled,
                        },
                    })
                }
                break
            case FOOTER_BUTTONS.SAVE_AND_CUSTOMIZE_LATER:
                if (!isInvalidForm) {
                    await onSave()
                    handleSave({
                        redirectTo: NEXT_ACTION.BACK_HOME,
                        stepName: HelpCenterCreationWizardStep.Automate,
                        payload: {
                            orderManagementEnabled:
                                state.orderManagementEnabled,
                        },
                    })
                }
                break
            default:
                break
        }
    }

    const handleStoreChange = (
        integration: HelpCenterContactFormIntegrationTypes,
    ) => {
        if (integration) {
            setSelectedStoreIntegration(integration)
            handleFormUpdate({
                shopName: integration.name,
                shopIntegrationId: integration.id,
            })
            handleSave({
                stepName: HelpCenterCreationWizardStep.Automate,
                payload: {
                    shopName: integration.name,
                    shopIntegrationId: integration.id,
                },
            })
        }
    }

    const isLoading =
        isHelpCenterWizardLoading || isSelfServiceConfigurationLoading

    return (
        <WizardStepSkeleton
            step={HelpCenterCreationWizardStep.Automate}
            labels={HELP_CENTER_STEPS_LABELS}
            titles={HELP_CENTER_STEPS_TITLES}
            descriptions={HELP_CENTER_STEPS_DESCRIPTIONS}
            footer={
                <WizardFooter
                    displaySaveAndCustomizeLater
                    displayFinishButton
                    displayBackButton
                    onClick={onFooterAction}
                    isDisabled={isLoading}
                />
            }
            preview={
                selectedStoreIntegration ? (
                    <HelpCenterWizardAutomationPreview
                        shopType={selectedStoreIntegration.type}
                        shopName={selectedStoreIntegrationName}
                        helpCenter={helpCenter}
                        flows={state.flows}
                        orderManagementEnabled={state.orderManagementEnabled}
                    />
                ) : undefined
            }
        >
            <div className={css.container}>
                <div>
                    <Label isRequired={isStoreRequired}>Connect a store</Label>
                    <div className={css.connectStoreDescription}>
                        A store connection is required to enable AI Agent
                        features.
                    </div>
                    <SelectStore
                        handleStoreChange={handleStoreChange}
                        shopName={selectedStoreIntegration?.name}
                        shopIntegrationId={selectedStoreIntegration?.id}
                    />
                    {shouldDisplayFormErrors && !selectedStoreIntegration && (
                        <div className={css.error}>This field is required.</div>
                    )}
                </div>
                {!isHelpCenterWizardLoading && selectedStoreIntegration && (
                    <HelpCenterCreationWizardAutomateItems
                        ref={automateItemsRef}
                        helpCenter={helpCenter}
                        storeIntegration={selectedStoreIntegration}
                        storeIntegrationName={selectedStoreIntegrationName}
                        isHelpCenterWizardLoading={isHelpCenterWizardLoading}
                        state={state}
                        updateOrderManagementEnabled={
                            updateOrderManagementEnabled
                        }
                        updateArticleRecommendationEnabled={
                            updateArticleRecommendationEnabled
                        }
                        updateFlows={updateFlows}
                        setIsSelfServiceConfigurationLoading={
                            setIsSelfServiceConfigurationLoading
                        }
                        isArticleRecommendationFeatureEnabled={
                            isArticleRecommendationFeatureEnabled
                        }
                    />
                )}
            </div>
        </WizardStepSkeleton>
    )
}

export default HelpCenterCreationWizardStepAutomate
