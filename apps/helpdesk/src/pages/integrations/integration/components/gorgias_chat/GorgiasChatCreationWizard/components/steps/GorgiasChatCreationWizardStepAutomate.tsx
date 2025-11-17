import type React from 'react'
import { useMemo, useState } from 'react'

import { SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import {
    LegacyButton as Button,
    LegacyLabel as Label,
    LegacyToggleField as ToggleField,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { upsertChatApplicationAutomationSettings } from 'models/chatApplicationAutomationSettings/resources'
import type { ChatApplicationAutomationSettings } from 'models/chatApplicationAutomationSettings/types'
import type {
    GorgiasChatIntegration,
    IntegrationFromType,
} from 'models/integration/types'
import {
    GorgiasChatCreationWizardSteps,
    IntegrationType,
} from 'models/integration/types'
import { useGetSelfServiceConfiguration } from 'models/selfServiceConfiguration/queries'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import SelfServiceChatIntegrationHomePage from 'pages/automate/common/components/preview/SelfServiceChatIntegrationHomePage'
import SelfServicePreviewContext from 'pages/automate/common/components/preview/SelfServicePreviewContext'
import { useSelfServiceConfigurationUpdate } from 'pages/automate/common/hooks/useSelfServiceConfigurationUpdate'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import { chatApplicationAutomationSettingsUpdated } from 'state/entities/chatsApplicationAutomationSettings/actions'
import { getChatsApplicationAutomationSettings } from 'state/entities/chatsApplicationAutomationSettings/selectors'
import { updateOrCreateIntegration } from 'state/integrations/actions'
import { getIntegrationsByTypes } from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { StoreNameDropdown } from '../../../GorgiasChatIntegrationAppearance/StoreNameDropdown'
import useThemeAppExtensionInstallation from '../../../hooks/useThemeAppExtensionInstallation'
import useLogWizardEvent from '../../hooks/useLogWizardEvent'
import GorgiasChatCreationWizardPreview from '../GorgiasChatCreationWizardPreview'
import GorgiasChatCreationWizardStep from '../GorgiasChatCreationWizardStep'

import css from './GorgiasChatCreationWizardStepAutomate.less'

type SubmitForm = {
    type: IntegrationType.GorgiasChat
    id: number
    meta: Record<string, any>
}

type Props = {
    integration: Map<any, any>
    isSubmitting: boolean
}

const GorgiasChatCreationWizardStepAutomate: React.FC<Props> = ({
    integration,
    isSubmitting,
}) => {
    const gorgiasChatIntegration = integration
        ? (integration.toJS() as GorgiasChatIntegration)
        : undefined

    const logWizardEvent = useLogWizardEvent()

    const dispatch = useAppDispatch()

    const { goToNextStep, goToPreviousStep } = useNavigateWizardSteps()

    const [hasSubmitted, setHasSubmitted] = useState(false)

    const [isSubmittingAutomation, setIsSubmittingAutomation] = useState(false)

    const [currentStoreIntegration, setCurrentStoreIntegration] =
        useState<
            IntegrationFromType<
                | IntegrationType.Shopify
                | IntegrationType.BigCommerce
                | IntegrationType.Magento2
            >
        >()

    const [
        currentIsOrderManagementEnabled,
        setCurrentIsOrderManagementEnabled,
    ] = useState<boolean>()

    const appId = gorgiasChatIntegration
        ? gorgiasChatIntegration.meta.app_id
        : undefined

    const applicationsAutomationSettings = useAppSelector(
        getChatsApplicationAutomationSettings,
    )

    const automationSettings: ChatApplicationAutomationSettings | undefined =
        appId ? applicationsAutomationSettings[appId] : undefined

    const gorgiasChatIntegrations = useAppSelector(
        getIntegrationsByTypes([IntegrationType.GorgiasChat]),
    )

    const storeIntegrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ]),
    )

    const storeIntegration =
        currentStoreIntegration ??
        storeIntegrations.find(
            (storeIntegration) =>
                storeIntegration.id ===
                gorgiasChatIntegration?.meta.shop_integration_id,
        )

    const isStoreOfShopifyType =
        storeIntegration?.type === IntegrationType.Shopify

    const { shouldUseThemeAppExtensionInstallation } =
        useThemeAppExtensionInstallation(
            isStoreOfShopifyType ? storeIntegration : undefined,
        )

    const shopName = storeIntegration
        ? getShopNameFromStoreIntegration(storeIntegration)
        : undefined

    const {
        data: selfServiceConfiguration,
        isLoading: isLoadingSelfServiceConfiguration,
    } = useGetSelfServiceConfiguration(shopName, storeIntegration?.type)

    const isOrderManagementEnabled =
        currentIsOrderManagementEnabled ??
        !!automationSettings?.orderManagement?.enabled

    // Article recommendation sunset:
    // By default, article recommendation will be disabled for new Gorgias Chat integrations.
    const isArticleRecommendationEnabled = false

    const isFormDisabled =
        !storeIntegration ||
        !automationSettings ||
        isLoadingSelfServiceConfiguration

    const isFormSubmitting = isSubmitting || isSubmittingAutomation

    const showPreviewPlaceholder =
        !storeIntegration || isLoadingSelfServiceConfiguration

    const isPristine =
        currentStoreIntegration === undefined &&
        currentIsOrderManagementEnabled === undefined

    const { handleSelfServiceConfigurationUpdate } =
        useSelfServiceConfigurationUpdate({
            handleNotify: (notification) => {
                if (
                    notification.status === NotificationStatus.Error &&
                    notification.message
                ) {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: notification.message,
                        }),
                    )
                }
            },
        })

    const updateAutomationSettings = async () => {
        const res = await upsertChatApplicationAutomationSettings(appId!, {
            articleRecommendation: {
                enabled: isArticleRecommendationEnabled,
            },
            orderManagement: { enabled: isOrderManagementEnabled },
            workflows: { enabled: !!automationSettings?.workflows?.enabled },
        })

        void dispatch(chatApplicationAutomationSettingsUpdated(res))
    }

    const updateSSConfiguration = async () => {
        if (!storeIntegration || !selfServiceConfiguration) return

        await handleSelfServiceConfigurationUpdate(
            (draft) => {
                draft.trackOrderPolicy = {
                    enabled:
                        storeIntegration?.type === IntegrationType.Shopify
                            ? isOrderManagementEnabled
                            : selfServiceConfiguration.trackOrderPolicy.enabled,
                }
            },
            {},
            storeIntegration.id,
        )
    }

    const updateAutomation = async () => {
        setIsSubmittingAutomation(true)

        return updateSSConfiguration()
            .then(updateAutomationSettings)
            .then(() => {
                setIsSubmittingAutomation(false)
            })
            .catch(() => {
                setIsSubmittingAutomation(false)
            })
    }

    const onSave = (shouldGoToNextStep = false, isContinueLater = false) => {
        const form: SubmitForm = {
            type: IntegrationType.GorgiasChat,
            id: integration.get('id'),
            meta: (integration.get('meta') as Map<any, any>)
                .setIn(
                    ['wizard', 'step'],
                    shouldGoToNextStep
                        ? GorgiasChatCreationWizardSteps.Installation
                        : GorgiasChatCreationWizardSteps.Automate,
                )
                .set(
                    'shop_name',
                    storeIntegration
                        ? getShopNameFromStoreIntegration(storeIntegration)
                        : null,
                )
                .set(
                    'shop_type',
                    storeIntegration ? storeIntegration.type : null,
                )
                .set(
                    'shop_integration_id',
                    storeIntegration ? storeIntegration.id : null,
                )
                .toJS(),
        }

        const finishSubmitting = () => {
            setHasSubmitted(true)

            logWizardEvent(
                isContinueLater
                    ? SegmentEvent.ChatWidgetWizardSaveLaterClicked
                    : SegmentEvent.ChatWidgetWizardStepCompleted,
                {
                    isOrderManagementEnabled,
                },
            )

            shouldGoToNextStep && goToNextStep()
        }

        return dispatch(
            updateOrCreateIntegration(
                fromJS(form),
                undefined,
                true,
                () => {
                    if (storeIntegration) {
                        void updateAutomation().then(finishSubmitting)
                    } else {
                        finishSubmitting()
                    }
                },
                shouldGoToNextStep,
                'Changes saved',
            ),
        )
    }

    const selfServicePreviewContext = useMemo(() => {
        return {
            selfServiceConfiguration: selfServiceConfiguration && {
                ...selfServiceConfiguration,
                trackOrderPolicy: { enabled: isOrderManagementEnabled },
                reportIssuePolicy: {
                    ...selfServiceConfiguration.reportIssuePolicy,
                    enabled: false,
                },
                cancelOrderPolicy: {
                    ...selfServiceConfiguration.cancelOrderPolicy,
                    enabled: false,
                },
                returnOrderPolicy: {
                    ...selfServiceConfiguration.returnOrderPolicy,
                    enabled: false,
                },
            },
            isArticleRecommendationEnabled,
        }
    }, [
        selfServiceConfiguration,
        isOrderManagementEnabled,
        isArticleRecommendationEnabled,
    ])

    const isPreviewHomePage = true
    return (
        <>
            <UnsavedChangesPrompt
                onSave={() => onSave()}
                when={!isPristine && !hasSubmitted}
                shouldRedirectAfterSave
            />
            <GorgiasChatCreationWizardStep
                step={GorgiasChatCreationWizardSteps.Automate}
                showPreviewPlaceholder={showPreviewPlaceholder}
                preview={
                    <GorgiasChatCreationWizardPreview
                        integration={integration}
                        isOpen
                        showStatusToggle={false}
                        renderFooter={false}
                        isWidgetConversation={!isPreviewHomePage}
                        showGoBackButton
                    >
                        <SelfServicePreviewContext.Provider
                            value={selfServicePreviewContext}
                        >
                            {gorgiasChatIntegration && (
                                <SelfServiceChatIntegrationHomePage
                                    integration={gorgiasChatIntegration}
                                    disableAnimations
                                />
                            )}
                        </SelfServicePreviewContext.Provider>
                    </GorgiasChatCreationWizardPreview>
                }
                footer={
                    <>
                        <Button
                            fillStyle="ghost"
                            onClick={() =>
                                onSave(false, true).then(() => {
                                    history.push(
                                        '/app/settings/channels/gorgias_chat',
                                    )
                                })
                            }
                            isDisabled={isFormSubmitting}
                        >
                            Save &amp; Customize Later
                        </Button>
                        <div className={css.wizardButtons}>
                            <div className={css.wizardButtons}>
                                <Button
                                    intent="secondary"
                                    onClick={goToPreviousStep}
                                    isDisabled={isFormSubmitting}
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={() => onSave(true)}
                                    isLoading={isFormSubmitting}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </>
                }
            >
                <>
                    <div className={css.section}>
                        <Label>Connect a store</Label>
                        <div className={css.connectStoreDescription}>
                            Connect a store to use AI Agent features in chat and
                            to enable{' '}
                            {shouldUseThemeAppExtensionInstallation
                                ? 'quick'
                                : '1-click'}{' '}
                            install for Shopify.
                        </div>
                        <StoreNameDropdown
                            storeIntegrationId={
                                (storeIntegration && storeIntegration?.id) ??
                                null
                            }
                            gorgiasChatIntegrations={fromJS(
                                gorgiasChatIntegrations,
                            )}
                            storeIntegrations={fromJS(storeIntegrations)}
                            onChange={(storeIntegrationId: number) => {
                                const storeIntegration = storeIntegrations.find(
                                    (storeIntegration) =>
                                        storeIntegration?.id ===
                                        storeIntegrationId,
                                )!

                                setCurrentStoreIntegration(storeIntegration)
                            }}
                            isDisabled={
                                storeIntegration ? isFormDisabled : false
                            }
                        />
                    </div>
                    {(!storeIntegration ||
                        storeIntegration?.type === IntegrationType.Shopify) && (
                        <div className={css.section}>
                            <div className={css.sectionHeading}>
                                Order management
                            </div>
                            <ToggleField
                                onChange={setCurrentIsOrderManagementEnabled}
                                value={isOrderManagementEnabled}
                                isDisabled={isFormDisabled}
                                label="Allow customers to track orders from my chat"
                            />
                        </div>
                    )}
                </>
            </GorgiasChatCreationWizardStep>
        </>
    )
}

export default GorgiasChatCreationWizardStepAutomate
