import type React from 'react'
import { useState } from 'react'

import { SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { Card } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { upsertChatApplicationAutomationSettings } from 'models/chatApplicationAutomationSettings/resources'
import type { ChatApplicationAutomationSettings } from 'models/chatApplicationAutomationSettings/types'
import type { GorgiasChatIntegration } from 'models/integration/types'
import {
    GorgiasChatCreationWizardSteps,
    IntegrationType,
} from 'models/integration/types'
import { useGetSelfServiceConfiguration } from 'models/selfServiceConfiguration/queries'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { useSelfServiceConfigurationUpdate } from 'pages/automate/common/hooks/useSelfServiceConfigurationUpdate'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import { FeatureToggle } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/FeatureToggle'
import { GorgiasChatCreationWizardStep } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatCreationWizardStep'
import { chatApplicationAutomationSettingsUpdated } from 'state/entities/chatsApplicationAutomationSettings/actions'
import { getChatsApplicationAutomationSettings } from 'state/entities/chatsApplicationAutomationSettings/selectors'
import { updateOrCreateIntegration } from 'state/integrations/actions'
import { getIntegrationsByTypes } from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import useLogWizardEvent from '../../hooks/useLogWizardEvent'
import { GorgiasChatCreationWizardFooter } from '../GorgiasChatCreationWizardFooter'
import SaveChangesPrompt from '../SaveChangesPrompt'

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

    const storeIntegrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ]),
    )

    const storeIntegration = storeIntegrations.find(
        (storeIntegration) =>
            storeIntegration.id ===
            gorgiasChatIntegration?.meta.shop_integration_id,
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

    const isPristine = currentIsOrderManagementEnabled === undefined

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

    return (
        <>
            <SaveChangesPrompt
                onSave={() => onSave()}
                when={!isPristine && !hasSubmitted}
                shouldRedirectAfterSave
            />
            <GorgiasChatCreationWizardStep
                footer={
                    <GorgiasChatCreationWizardFooter
                        backButton={{
                            label: 'Back',
                            onClick: goToPreviousStep,
                            isDisabled: isFormSubmitting,
                        }}
                        primaryButton={{
                            label: 'Continue',
                            onClick: () => onSave(true),
                            isLoading: isFormSubmitting,
                        }}
                        exitButton={{
                            label: 'Save and Exit',
                            onClick: () =>
                                onSave(false, true).then(() => {
                                    history.push(
                                        '/app/settings/channels/gorgias_chat',
                                    )
                                }),
                            isDisabled: isFormSubmitting,
                        }}
                    />
                }
            >
                {(!storeIntegration ||
                    storeIntegration?.type === IntegrationType.Shopify) && (
                    <Card>
                        <FeatureToggle
                            label="Order management"
                            caption="Let customers sign in to track, return, cancel or report issues with orders."
                            tag={{
                                text: 'Automate up to 30% of tickets',
                                color: 'purple',
                                icon: 'zap',
                            }}
                            value={isOrderManagementEnabled}
                            onChange={setCurrentIsOrderManagementEnabled}
                            isDisabled={isFormDisabled}
                        />
                    </Card>
                )}
            </GorgiasChatCreationWizardStep>
        </>
    )
}

export default GorgiasChatCreationWizardStepAutomate
