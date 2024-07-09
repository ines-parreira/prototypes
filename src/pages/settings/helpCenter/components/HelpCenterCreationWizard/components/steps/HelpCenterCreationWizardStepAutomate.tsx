import React, {useEffect} from 'react'

import {
    HELP_CENTER_STEPS_DESCRIPTIONS,
    HELP_CENTER_STEPS_LABELS,
    HELP_CENTER_STEPS_TITLES,
    NEXT_ACTION,
} from 'pages/settings/helpCenter/constants'
import WizardStepSkeleton from 'pages/common/components/wizard/WizardStepSkeleton'
import {HelpCenter, HelpCenterCreationWizardStep} from 'models/helpCenter/types'
import {IntegrationFromType, IntegrationType} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import useHelpCenterAutomationSettings from 'pages/automate/common/hooks/useHelpCenterAutomationSettings'
import WizardFooter, {
    FOOTER_BUTTONS,
} from 'pages/common/components/wizard/WizardFooter'
import {reportError} from 'utils/errors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useEffectOnce from 'hooks/useEffectOnce'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import {useGetHelpCenterArticleList} from 'models/helpCenter/queries'
import HelpCenterWizardOrderManagement from '../HelpCenterWizardOrderManagement/HelpCenterWizardOrderManagement'
import {useHelpCenterAutomationForm} from '../../hooks/useHelpCenterAutomationForm'
import HelpCenterWizardArticleRec from '../HelpCenterWizardArticleRec/HelpCenterWizardArticleRec'
import HelpCenterWizardFlows from '../HelpCenterWizardFlows/HelpCenterWizardFlows'
import HelpCenterWizardAutomationPreview from '../HelpCenterWizardAutomationPreview/HelpCenterWizardAutomationPreview'
import {useHelpCenterCreationWizard} from '../../hooks/useHelpCenterCreationWizard'
import {mapEntrypointsToAutomationSettings} from '../../HelpCenterCreationWizardUtils'
import css from './HelpCenterCreationWizardStepAutomate.less'

const HELP_CENTER_SHOP_INTEGRATION_TYPES = [
    IntegrationType.Shopify,
    IntegrationType.BigCommerce,
    IntegrationType.Magento2,
]

type Props = {
    helpCenter: HelpCenter
    isUpdate: boolean
    helpCenterShopIntegration: IntegrationFromType<IntegrationType>
}

const HelpCenterCreationWizardStepAutomateComponent: React.FC<Props> = ({
    helpCenter,
    helpCenterShopIntegration,
}) => {
    const {
        isFetchPending: isSelfServiceConfigurationPending,
        isUpdatePending: isSelfServiceConfigurationUpdating,
        handleSelfServiceConfigurationUpdate,
        selfServiceConfiguration,
    } = useSelfServiceConfiguration(
        helpCenterShopIntegration.type,
        helpCenterShopIntegration.name,
        // Avoid notifications about the self service configuration
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {}
    )

    const isArticleRecomAlreadyEnabled =
        !!selfServiceConfiguration?.articleRecommendationHelpCenterId &&
        // we have different help center in the self service configuration. This prevents from case when user clicks "Save and customize later"
        selfServiceConfiguration?.articleRecommendationHelpCenterId !==
            helpCenter.id

    const chatIntegrations = useAppSelector(
        getIntegrationsByTypes([IntegrationType.GorgiasChat])
    )

    const {
        state,
        updateOrderManagementEnabled,
        updateArticleRecommendationEnabled,
        updateFlows,
    } = useHelpCenterAutomationForm({
        orderManagementEnabled:
            helpCenter.self_service_deactivated_datetime === null,
    })
    const {data: helpCenterArticles} = useGetHelpCenterArticleList(
        helpCenter.id,
        {
            version_status: 'latest_draft',
            locale: helpCenter.default_locale,
        }
    )
    const {
        isLoading: isHelpCenterWizardLoading,
        handleAction,
        handleSave,
    } = useHelpCenterCreationWizard(
        helpCenter,
        HelpCenterCreationWizardStep.Automate
    )
    const {
        automationSettings,
        handleHelpCenterAutomationSettingsUpdate,
        isFetchPending,
    } = useHelpCenterAutomationSettings(helpCenter.id, false)

    useEffect(() => {
        const helpCenterFlows = automationSettings.workflows
        if (!isFetchPending && helpCenterFlows) {
            updateFlows(
                helpCenterFlows.map((flow) => ({
                    workflow_id: flow.id,
                    enabled: flow.enabled,
                }))
            )
        }
    }, [automationSettings.workflows, isFetchPending, updateFlows])

    useEffect(() => {
        if (!isFetchPending && chatIntegrations.length > 0) {
            updateArticleRecommendationEnabled(!isArticleRecomAlreadyEnabled)
        }
    }, [
        chatIntegrations.length,
        isArticleRecomAlreadyEnabled,
        isFetchPending,
        updateArticleRecommendationEnabled,
    ])

    const onSave = async () => {
        const automationSettings = mapEntrypointsToAutomationSettings(
            state.flows
        )
        await handleHelpCenterAutomationSettingsUpdate(automationSettings)

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

    const onFooterAction = async (buttonClicked: FOOTER_BUTTONS) => {
        switch (buttonClicked) {
            case FOOTER_BUTTONS.BACK:
                handleAction(NEXT_ACTION.PREVIOUS_STEP)
                break
            case FOOTER_BUTTONS.FINISH:
                await onSave()
                handleSave({
                    redirectTo: NEXT_ACTION.NEW_HELP_CENTER,
                    payload: {
                        wizardCompleted: true,
                        orderManagementEnabled: state.orderManagementEnabled,
                    },
                    successModalParams: {
                        articlesCount: helpCenterArticles?.data.length,
                        isArticleRecommendationEnabled:
                            state.articleRecommendationEnabled,
                    },
                })
                break
            case FOOTER_BUTTONS.SAVE_AND_CUSTOMIZE_LATER:
                await onSave()
                handleSave({
                    redirectTo: NEXT_ACTION.BACK_HOME,
                    stepName: HelpCenterCreationWizardStep.Automate,
                    payload: {
                        orderManagementEnabled: state.orderManagementEnabled,
                    },
                })
                break
            default:
                break
        }
    }

    const isLoading =
        isHelpCenterWizardLoading ||
        isSelfServiceConfigurationPending ||
        isSelfServiceConfigurationUpdating

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
                <HelpCenterWizardAutomationPreview
                    shopType={helpCenterShopIntegration.type}
                    shopName={helpCenterShopIntegration.name}
                    helpCenter={helpCenter}
                    flows={state.flows}
                    orderManagementEnabled={state.orderManagementEnabled}
                />
            }
        >
            <div className={css.container}>
                <HelpCenterWizardOrderManagement
                    onChange={updateOrderManagementEnabled}
                    enabled={state.orderManagementEnabled}
                />
                {chatIntegrations.length > 0 && (
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
                    />
                )}

                {helpCenterShopIntegration && (
                    <HelpCenterWizardFlows
                        helpCenterId={helpCenter.id}
                        shopType={helpCenterShopIntegration.type}
                        shopName={helpCenterShopIntegration.name}
                        supportedLocales={helpCenter.supported_locales}
                        flows={state.flows}
                        onChange={updateFlows}
                        isLoading={isFetchPending}
                    />
                )}
            </div>
        </WizardStepSkeleton>
    )
}

const HelpCenterCreationWizardStepAutomate = (
    props: Omit<Props, 'helpCenterShopIntegration'>
) => {
    const integrations = useAppSelector(
        getIntegrationsByTypes(HELP_CENTER_SHOP_INTEGRATION_TYPES)
    )

    const helpCenterShopName = props.helpCenter.shop_name

    const helpCenterShopIntegration = integrations.find(
        (integration) => integration.name === helpCenterShopName
    )
    const dispatch = useAppDispatch()

    // This should be the case, but we want to be sure
    useEffectOnce(() => {
        if (!helpCenterShopIntegration) {
            reportError(
                new Error(
                    'Shop integration not found for Help Center Wizard Automation'
                ),
                {
                    tags: {
                        section: 'help-center-wizard',
                        team: 'automate-obs',
                    },
                }
            )
            void dispatch(
                notify({
                    message: `No integration found for shop ${
                        helpCenterShopName ?? ''
                    }`,
                    status: NotificationStatus.Error,
                })
            )
        }
    })

    if (!helpCenterShopIntegration) {
        return null
    }

    return (
        <HelpCenterCreationWizardStepAutomateComponent
            {...props}
            helpCenterShopIntegration={helpCenterShopIntegration}
        />
    )
}

export default HelpCenterCreationWizardStepAutomate
