import React, {useMemo, useRef, useState} from 'react'
import {Map, fromJS} from 'immutable'
import classNames from 'classnames'
import {v4 as uuidv4} from 'uuid'

import history from 'pages/history'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import {SegmentEvent} from 'common/segment'

import {updateOrCreateIntegration} from 'state/integrations/actions'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {getChatsApplicationAutomationSettings} from 'state/entities/chatsApplicationAutomationSettings/selectors'
import {chatApplicationAutomationSettingsUpdated} from 'state/entities/chatsApplicationAutomationSettings/actions'
import {selfServiceConfigurationUpdated} from 'state/entities/selfServiceConfigurations/actions'

import {
    GorgiasChatCreationWizardSteps,
    GorgiasChatIntegration,
    IntegrationFromType,
    IntegrationType,
} from 'models/integration/types'
import {getShopNameFromStoreIntegration} from 'models/selfServiceConfiguration/utils'
import {ChatApplicationAutomationSettings} from 'models/chatApplicationAutomationSettings/types'
import {QuickResponsePolicy} from 'models/selfServiceConfiguration/types'
import {updateSelfServiceConfiguration} from 'models/selfServiceConfiguration/resources'
import {upsertChatApplicationAutomationSettings} from 'models/chatApplicationAutomationSettings/resources'

import ToggleInput from 'pages/common/forms/ToggleInput'
import Button from 'pages/common/components/button/Button'
import Label from 'pages/common/forms/Label/Label'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import SelfServiceChatIntegrationQuickResponsePage from 'pages/automate/common/components/preview/SelfServiceChatIntegrationQuickResponsePage'
import SelfServicePreviewContext from 'pages/automate/common/components/preview/SelfServicePreviewContext'
import SelfServiceChatIntegrationHomePage from 'pages/automate/common/components/preview/SelfServiceChatIntegrationHomePage'
import ArticleRecommendationHelpCenter from 'pages/automate/articleRecommendation/components/ArticleRecommendationHelpCenter'

import {StoreNameDropdown} from '../../../GorgiasChatIntegrationAppearance/StoreNameDropdown'

import useLogWizardEvent from '../../hooks/useLogWizardEvent'
import useHelpCenterOfShop from '../../../hooks/useHelpCenterOfShop'

import GorgiasChatCreationWizardStep from '../GorgiasChatCreationWizardStep'
import GorgiasChatCreationWizardPreview from '../GorgiasChatCreationWizardPreview'

import css from './GorgiasChatCreationWizardStepAutomate.less'
import useSelfServiceConfiguration from './hooks/useSelfServiceConfiguration'
import GorgiasChatCreationWizardQuickResponses from './components/GorgiasChatCreationWizardQuickResponses'
import GorgiasChatCreationWizardQuickResponseNotConfiguredModal, {
    GorgiasChatCreationWizardQuickResponseNotConfiguredModalHandle,
} from './components/GorgiasChatCreationWizardQuickResponseNotConfiguredModal'
import GorgiasChatCreationWizardQuickResponseNotEnabledModal, {
    GorgiasChatCreationWizardQuickResponseNotEnabledModalHandle,
} from './components/GorgiasChatCreationWizardQuickResponseNotEnabledModal'

type SubmitForm = {
    type: IntegrationType.GorgiasChat
    id: number
    meta: Record<string, any>
}

const draftQuickResponse: QuickResponsePolicy = {
    id: '',
    title: 'What is your shipping policy?',
    deactivated_datetime: new Date().toISOString(),
    response_message_content: {
        html: '',
        text: '',
        attachments: fromJS([]),
    },
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

    const {goToNextStep, goToPreviousStep} = useNavigateWizardSteps()

    const quickResponseNotConfiguredModalRef =
        useRef<GorgiasChatCreationWizardQuickResponseNotConfiguredModalHandle>(
            null
        )

    const quickResponseNotEnabledModalRef =
        useRef<GorgiasChatCreationWizardQuickResponseNotEnabledModalHandle>(
            null
        )

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

    const [
        currentIsArticleRecommendationEnabled,
        setCurrentIsArticleRecommendationEnabled,
    ] = useState<boolean>()

    const [currentIsQuickResponsesEnabled, setCurrentIsQuickResponsesEnabled] =
        useState<boolean>()

    const [quickResponseHasError, setQuickResponseHasError] = useState(false)

    const initialQuickResponses =
        gorgiasChatIntegration?.meta.wizard?.quick_response_ids || []

    const [quickResponses, setQuickResponses] = useState<QuickResponsePolicy[]>(
        []
    )
    const [expandedQuickResponseId, setExpandedQuickResponseId] = useState<
        string | null
    >(null)

    const appId = gorgiasChatIntegration
        ? gorgiasChatIntegration.meta.app_id
        : undefined

    const applicationsAutomationSettings = useAppSelector(
        getChatsApplicationAutomationSettings
    )

    const automationSettings: ChatApplicationAutomationSettings | undefined =
        appId ? applicationsAutomationSettings[appId] : undefined

    const gorgiasChatIntegrations = useAppSelector(
        getIntegrationsByTypes([IntegrationType.GorgiasChat])
    )

    const storeIntegrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ])
    )

    const storeIntegration =
        currentStoreIntegration ??
        storeIntegrations.find(
            (storeIntegration) =>
                storeIntegration.id ===
                gorgiasChatIntegration?.meta.shop_integration_id
        )

    const shopIntegrationId = storeIntegration?.id

    const {selfServiceConfiguration, isLoadingSelfServiceConfiguration} =
        useSelfServiceConfiguration(shopIntegrationId)

    useMemo(() => {
        if (!selfServiceConfiguration) {
            return
        }

        if (initialQuickResponses.length) {
            setQuickResponses(
                selfServiceConfiguration?.quick_response_policies.filter(
                    ({id}) => initialQuickResponses.includes(id)
                )
            )
        } else {
            const draftPolicy =
                selfServiceConfiguration?.quick_response_policies.find(
                    ({title}) => title === draftQuickResponse.title
                )

            if (draftPolicy) {
                setQuickResponses([draftPolicy])
            } else {
                setQuickResponses([{...draftQuickResponse, id: uuidv4()}])
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selfServiceConfiguration])

    const {isLoadingHelpCenters, helpCenters} = useHelpCenterOfShop(
        storeIntegration?.name,
        storeIntegration?.type
    )

    const activeHelpCenters = helpCenters.filter(
        ({deactivated_datetime, deleted_datetime}) =>
            !deactivated_datetime && !deleted_datetime
    )

    const hasActiveHelpCenter = !!activeHelpCenters.length

    const [helpCenterId, setHelpCenterId] = useState<number | undefined>()

    const hasActiveQuickResponsePoliciesInitially =
        selfServiceConfiguration &&
        selfServiceConfiguration.quick_response_policies.some(
            (quickResponse) =>
                !quickResponse.deactivated_datetime &&
                !initialQuickResponses.includes(quickResponse.id)
        )

    const isOrderManagementEnabled =
        currentIsOrderManagementEnabled ??
        !!automationSettings?.orderManagement?.enabled

    const isArticleRecommendationEnabled =
        currentIsArticleRecommendationEnabled ??
        !!automationSettings?.articleRecommendation?.enabled

    const isQuickResponsesEnabled =
        currentIsQuickResponsesEnabled ??
        !!automationSettings?.quickResponses?.enabled

    const isFormDisabled =
        !storeIntegration ||
        !automationSettings ||
        isLoadingSelfServiceConfiguration ||
        isLoadingHelpCenters

    const isFormSubmitting = isSubmitting || isSubmittingAutomation

    const showPreviewPlaceholder =
        !storeIntegration || isLoadingSelfServiceConfiguration

    const isPristine =
        currentStoreIntegration === undefined &&
        currentIsArticleRecommendationEnabled === undefined &&
        currentIsOrderManagementEnabled === undefined &&
        currentIsQuickResponsesEnabled === undefined

    const updateAutomationSettings = async () => {
        const res = await upsertChatApplicationAutomationSettings(appId!, {
            articleRecommendation: {
                enabled: isArticleRecommendationEnabled,
            },
            orderManagement: {enabled: isOrderManagementEnabled},
            quickResponses: {
                enabled: hasActiveQuickResponsePoliciesInitially
                    ? isQuickResponsesEnabled
                    : quickResponses.filter(
                          ({deactivated_datetime}) => !deactivated_datetime
                      ).length > 0,
            },
            workflows: {enabled: !!automationSettings?.workflows?.enabled},
        })

        void dispatch(chatApplicationAutomationSettingsUpdated(res))
    }

    const updateSSConfiguration = async () => {
        const quickResponseIds = quickResponses.map(({id}) => id)

        const removedQuickResponseIds = initialQuickResponses.filter(
            (id) => !quickResponseIds.includes(id)
        )

        const quickResponsePolicies = hasActiveQuickResponsePoliciesInitially
            ? selfServiceConfiguration!.quick_response_policies
            : [
                  ...quickResponses,
                  ...selfServiceConfiguration!.quick_response_policies.filter(
                      ({id}) =>
                          !quickResponseIds.includes(id) &&
                          !removedQuickResponseIds.includes(id)
                  ),
              ]

        const res = await updateSelfServiceConfiguration({
            ...selfServiceConfiguration!,
            article_recommendation_help_center_id:
                isArticleRecommendationEnabled
                    ? selfServiceConfiguration!
                          .article_recommendation_help_center_id ||
                      (activeHelpCenters.length > 1
                          ? helpCenterId
                          : activeHelpCenters[0].id)
                    : selfServiceConfiguration!
                          .article_recommendation_help_center_id,
            track_order_policy: {
                enabled:
                    storeIntegration?.type === IntegrationType.Shopify
                        ? isOrderManagementEnabled
                        : selfServiceConfiguration!.track_order_policy.enabled,
            },
            quick_response_policies: quickResponsePolicies,
        })

        void dispatch(selfServiceConfigurationUpdated(res))
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

    const onSave = (
        shouldGoToNextStep = false,
        isContinueLater = false,
        bypassQuickResponseErrors = false
    ) => {
        if (
            !hasActiveQuickResponsePoliciesInitially &&
            shouldGoToNextStep &&
            !bypassQuickResponseErrors
        ) {
            const hasQuickResponsesWithoutResponse = quickResponses.some(
                ({response_message_content: {text, html, attachments}}) =>
                    !text && !html && attachments.isEmpty()
            )

            if (hasQuickResponsesWithoutResponse) {
                quickResponseNotConfiguredModalRef.current?.open()
                return Promise.reject()
                //eslint-disable-next-line no-else-return
            } else {
                const hasQuickResponsesDisabled = quickResponses.some(
                    ({deactivated_datetime}) => deactivated_datetime
                )

                if (hasQuickResponsesDisabled) {
                    quickResponseNotEnabledModalRef.current?.open()
                    return Promise.reject()
                }
            }
        }

        const form: SubmitForm = {
            type: IntegrationType.GorgiasChat,
            id: integration.get('id'),
            meta: (integration.get('meta') as Map<any, any>)
                .setIn(
                    ['wizard', 'step'],
                    shouldGoToNextStep
                        ? GorgiasChatCreationWizardSteps.Installation
                        : GorgiasChatCreationWizardSteps.Automate
                )
                .setIn(
                    ['wizard', 'quick_response_ids'],
                    quickResponses.map(({id}) => id)
                )
                .set(
                    'shop_name',
                    storeIntegration
                        ? getShopNameFromStoreIntegration(storeIntegration)
                        : null
                )
                .set(
                    'shop_type',
                    storeIntegration ? storeIntegration.type : null
                )
                .set(
                    'shop_integration_id',
                    storeIntegration ? storeIntegration.id : null
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
                    isArticleRecommendationEnabled,
                    isQuickResponsesEnabled,
                }
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
                'Changes saved'
            )
        )
    }

    const expandedQuickResponse = quickResponses.find(
        (quickResponse) => quickResponse.id === expandedQuickResponseId
    )

    const selfServicePreviewContext = useMemo(() => {
        return {
            quickResponse: expandedQuickResponse,
            selfServiceConfiguration: selfServiceConfiguration && {
                ...selfServiceConfiguration,
                track_order_policy: {enabled: isOrderManagementEnabled},
                report_issue_policy: {
                    ...selfServiceConfiguration.report_issue_policy,
                    enabled: false,
                },
                cancel_order_policy: {
                    ...selfServiceConfiguration.cancel_order_policy,
                    enabled: false,
                },
                return_order_policy: {
                    ...selfServiceConfiguration.return_order_policy,
                    enabled: false,
                },
                quick_response_policies: hasActiveQuickResponsePoliciesInitially
                    ? isQuickResponsesEnabled
                        ? selfServiceConfiguration.quick_response_policies
                        : []
                    : quickResponses,
            },
            hoveredQuickResponseId: expandedQuickResponse?.id,
            isArticleRecommendationEnabled,
        }
    }, [
        quickResponses,
        selfServiceConfiguration,
        expandedQuickResponse,
        isOrderManagementEnabled,
        isArticleRecommendationEnabled,
        hasActiveQuickResponsePoliciesInitially,
        isQuickResponsesEnabled,
    ])

    const isPreviewHomePage = !expandedQuickResponse

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
                        renderPoweredBy={isPreviewHomePage}
                        renderFooter={false}
                        isWidgetConversation={!isPreviewHomePage}
                        showGoBackButton
                    >
                        <SelfServicePreviewContext.Provider
                            value={selfServicePreviewContext}
                        >
                            {gorgiasChatIntegration &&
                                (expandedQuickResponse ? (
                                    <SelfServiceChatIntegrationQuickResponsePage
                                        integration={gorgiasChatIntegration}
                                    />
                                ) : (
                                    <SelfServiceChatIntegrationHomePage
                                        integration={gorgiasChatIntegration}
                                        disableAnimations
                                    />
                                ))}
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
                                        '/app/settings/channels/gorgias_chat'
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
                                    isDisabled={quickResponseHasError}
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
                            Connect a store to use Automate features in chat and
                            to enable 1-click install for Shopify.
                        </div>
                        <StoreNameDropdown
                            storeIntegrationId={
                                (storeIntegration && storeIntegration?.id) ??
                                null
                            }
                            gorgiasChatIntegrations={fromJS(
                                gorgiasChatIntegrations
                            )}
                            storeIntegrations={fromJS(storeIntegrations)}
                            onChange={(storeIntegrationId: number) => {
                                const storeIntegration = storeIntegrations.find(
                                    (storeIntegration) =>
                                        storeIntegration?.id ===
                                        storeIntegrationId
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
                            <ToggleInput
                                onClick={setCurrentIsOrderManagementEnabled}
                                isToggled={isOrderManagementEnabled}
                                isDisabled={isFormDisabled}
                            >
                                Allow customers to track orders from my chat
                            </ToggleInput>
                        </div>
                    )}
                    {(hasActiveHelpCenter ||
                        isLoadingHelpCenters ||
                        !storeIntegration) && (
                        <div className={css.section}>
                            <div className={css.sectionHeading}>
                                Article Recommendation
                            </div>
                            <ToggleInput
                                onClick={
                                    setCurrentIsArticleRecommendationEnabled
                                }
                                isToggled={isArticleRecommendationEnabled}
                                isDisabled={isFormDisabled}
                            >
                                <span className={css.icon}>
                                    <i className="material-icons">
                                        auto_awesome
                                    </i>
                                </span>{' '}
                                Recommend articles from your Help Center with AI
                            </ToggleInput>
                            {isArticleRecommendationEnabled &&
                                !isLoadingSelfServiceConfiguration &&
                                !isLoadingHelpCenters &&
                                !selfServiceConfiguration?.article_recommendation_help_center_id &&
                                activeHelpCenters.length > 1 && (
                                    <div className={css.helpCenterSection}>
                                        <Label isRequired>
                                            Connect a Help Center
                                        </Label>
                                        <ArticleRecommendationHelpCenter
                                            setHelpCenterId={setHelpCenterId}
                                            helpCenter={activeHelpCenters.find(
                                                ({id}) => helpCenterId === id
                                            )}
                                            helpCenters={activeHelpCenters}
                                        />
                                    </div>
                                )}
                        </div>
                    )}
                    <div className={css.section}>
                        <div
                            className={classNames(
                                css.sectionHeading,
                                css.sectionHeadingWithDescription
                            )}
                        >
                            Quick Responses
                        </div>
                        <p className={css.sectionDescription}>
                            Display buttons in your Chat with common questions
                            that customers can click for an instant response.
                        </p>
                        {hasActiveQuickResponsePoliciesInitially ? (
                            <ToggleInput
                                onClick={setCurrentIsQuickResponsesEnabled}
                                isToggled={isQuickResponsesEnabled}
                                isDisabled={isFormDisabled}
                            >
                                Display Quick Responses in Chat
                            </ToggleInput>
                        ) : (
                            <GorgiasChatCreationWizardQuickResponses
                                storeIntegration={storeIntegration}
                                isUpdatePending={isFormSubmitting}
                                onChange={setQuickResponseHasError}
                                quickResponses={quickResponses}
                                setQuickResponses={setQuickResponses}
                                expandedQuickResponseId={
                                    expandedQuickResponseId
                                }
                                setExpandedQuickResponseId={
                                    setExpandedQuickResponseId
                                }
                                isDisabled={isFormDisabled}
                            />
                        )}
                    </div>
                </>
            </GorgiasChatCreationWizardStep>
            <GorgiasChatCreationWizardQuickResponseNotConfiguredModal
                ref={quickResponseNotConfiguredModalRef}
                onSave={() => onSave(true, false, true)}
            />
            <GorgiasChatCreationWizardQuickResponseNotEnabledModal
                ref={quickResponseNotEnabledModalRef}
                onSave={() => onSave(true, false, true)}
            />
        </>
    )
}

export default GorgiasChatCreationWizardStepAutomate
