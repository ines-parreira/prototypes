import { useEffect, useRef, useState } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { useId } from '@repo/hooks'
import type { SubmitHandler } from 'react-hook-form'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useHistory, useLocation } from 'react-router-dom'

import {
    Box,
    Button,
    Heading,
    Icon,
    Menu,
    MenuItem,
    PanelHeader,
    toast,
} from '@gorgias/axiom'
import { JourneyStatusEnum } from '@gorgias/convert-client'

import { JOURNEY_TYPES } from 'AIJourney/constants'
import {
    useJourneyCreateHandler,
    useJourneyUpdateHandler,
    useSetupFormInit,
} from 'AIJourney/hooks'
import type { SetupFormValues } from 'AIJourney/pages/Setup/Setup'
import { useJourneyContext } from 'AIJourney/providers'
import type { UnsavedChangesPromptTrigger } from 'pages/common/components/UnsavedChangesPrompt'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import { MessageGuidanceCard } from 'AIJourney/components'

import { pickDefaultMessageInstructions } from 'AIJourney/utils/pickDefaultMessageInstructions'

import { JourneyEditorSidePanel } from './JourneyEditorSidePanel'
import { PreviewPanel } from './PreviewPanel'
import { ScheduleCampaignPanel } from './ScheduleCampaignPanel'
import { SendTestSMSModal } from './SendTestSMSModal'

import css from './JourneyEditorLayout.module.less'

const FLOW_TITLE_MAP: Partial<Record<JOURNEY_TYPES, string>> = {
    [JOURNEY_TYPES.WELCOME]: 'Welcome flow',
    [JOURNEY_TYPES.POST_PURCHASE]: 'Post-purchase flow',
    [JOURNEY_TYPES.CART_ABANDONMENT]: 'SMS cart abandoned flow',
    [JOURNEY_TYPES.SESSION_ABANDONMENT]: 'SMS browse abandoned flow',
    [JOURNEY_TYPES.WIN_BACK]: 'Customer win-back flow',
    [JOURNEY_TYPES.CUSTOM]: 'Custom flow',
}

type Props = {
    step: string
}

export const JourneyEditorLayout = ({ step }: Props) => {
    const history = useHistory()
    const { currentIntegration, journeyData, journeyType, shopName } =
        useJourneyContext()
    const { isCollapsibleColumnOpen, setIsCollapsibleColumnOpen } =
        useCollapsibleColumn()
    const [isSchedulePanelOpen, setIsSchedulePanelOpen] = useState(false)
    const [isTestModalOpen, setIsTestModalOpen] = useState(false)
    const titleErrorId = `journey-title-error-${useId()}`
    const isCampaign = journeyType === JOURNEY_TYPES.CAMPAIGN
    const isCustomFlow = journeyType === JOURNEY_TYPES.CUSTOM
    const isEditableTitle = isCampaign || isCustomFlow

    const isPreviewStep = step === 'preview'

    const { value: isStructuredEditorEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiJourneyStructuredMessageGuidanceEnabled,
        false,
    )
    const location = useLocation<
        | {
              initialMessageInstructions?: string
              initialCampaignTitle?: string
          }
        | undefined
    >()
    const initialMessageInstructionsFromState =
        location.state?.initialMessageInstructions
    const initialCampaignTitleFromState = location.state?.initialCampaignTitle

    const defaultMessageInstructions = pickDefaultMessageInstructions({
        journeyMessageInstructions: journeyData?.message_instructions,
        isStructuredEditorEnabled,
        initialMessageInstructionsFromState,
        journeyType,
    })

    const methods = useForm<SetupFormValues>({
        defaultValues: {
            max_follow_up_messages: 0,
            include_image: false,
            include_custom_image: false,
            offer_discount: false,
            message_instructions: defaultMessageInstructions,
            execution_mode_override: null,
            narrow_audience_enabled:
                (journeyData?.included_audience_list_ids?.length ?? 0) > 0 ||
                (journeyData?.excluded_audience_list_ids?.length ?? 0) > 0,
            ...(isCampaign && {
                campaignTitle:
                    journeyData?.campaign?.title ??
                    initialCampaignTitleFromState,
                scheduleType: 'later' as const,
                scheduledDate: null,
                scheduledTime: null,
            }),
            ...(isCustomFlow && {
                flowName: journeyData?.name ?? undefined,
            }),
            ...(!isCampaign &&
                !isCustomFlow && {
                    journeyName: journeyData?.name ?? undefined,
                    timing_offset:
                        (
                            journeyData as unknown as {
                                timing_offset?: number
                            }
                        )?.timing_offset ?? 0,
                }),
            ...(!isCampaign &&
                journeyType === JOURNEY_TYPES.WIN_BACK && {
                    cooldown_days: 30,
                    inactive_days: 30,
                }),
        },
    })
    const { handleSubmit, control, formState } = methods

    const { isFormReady } = useSetupFormInit({
        reset: methods.reset,
        setValue: methods.setValue,
    })

    const unsavedChangesPromptRef = useRef<UnsavedChangesPromptTrigger>(null)

    const runActionWithUnsavedChangesPrompt = (action: () => void) => {
        if (!formState.isDirty) {
            action()
            return
        }
        unsavedChangesPromptRef.current?.onLeaveContext({
            onSave: action,
            onDiscard: action,
        })
    }

    const { handleCreate, isLoading: isLoadingCreate } =
        useJourneyCreateHandler({
            integrationId: currentIntegration?.id,
            integrationName: currentIntegration?.name,
            journeyType: journeyType ?? JOURNEY_TYPES.CAMPAIGN,
        })

    const { handleUpdate, isLoading: isLoadingUpdate } =
        useJourneyUpdateHandler({
            integrationId: currentIntegration?.id,
            journeyId: journeyData?.id,
            entityLabel: isCampaign ? 'campaign' : 'journey',
        })

    const isLoading = isLoadingCreate || isLoadingUpdate

    const isFlowActive =
        !isCampaign && journeyData?.state === JourneyStatusEnum.Active

    useEffect(() => {
        if (isPreviewStep) {
            setIsCollapsibleColumnOpen(true)
        }
        return () => setIsCollapsibleColumnOpen(false)
    }, [isPreviewStep, setIsCollapsibleColumnOpen])

    const handleToggleFlowState = async () => {
        await handleUpdate({
            journeyState: isFlowActive
                ? JourneyStatusEnum.Paused
                : JourneyStatusEnum.Active,
        })
    }

    const handleSave: SubmitHandler<SetupFormValues> = async (data) => {
        const shouldClearAudience = !isCampaign && !data.narrow_audience_enabled
        const shouldClearCustomImage = isCampaign && !data.include_custom_image

        const commonFields = {
            phoneNumberIntegrationId: data.sms_sender_integration_id?.id,
            phoneNumber: data.sms_sender_integration_id?.label,
            followUpValue: data.max_follow_up_messages,
            followUpWaitMinutes: data.follow_up_wait_minutes,
            includeImage: data.include_image,
            uploadedImageAttachment: shouldClearCustomImage
                ? []
                : data.uploaded_image_attachment,
            isDiscountEnabled: data.offer_discount,
            discountValue: data.max_discount_percent,
            discountCodeThresholdValue: data.discount_code_message_threshold,
            targetOrderStatus: data.target_order_status,
            includedAudienceListIds: shouldClearAudience
                ? []
                : data.included_audience_list_ids,
            excludedAudienceListIds: shouldClearAudience
                ? []
                : data.excluded_audience_list_ids,
            rcsEnabled: data.rcs_enabled,
            journeyMessageInstructions: data.message_instructions,
            journeyVariants: data.variants ?? [],
            ...(window.USER_IMPERSONATED && {
                executionModeOverride: data.execution_mode_override,
            }),
        }

        try {
            if (isCampaign) {
                const params = {
                    ...commonFields,
                    campaignTitle: data.campaignTitle,
                }
                if (journeyData?.id) {
                    await handleUpdate(params)
                } else {
                    await handleCreate(params).then((res) => {
                        history.replace(
                            `/app/ai-journey/${shopName}/campaign/setup/${res.id}`,
                        )
                    })
                }
            } else {
                const params = {
                    ...commonFields,
                    postPurchaseWaitMinutes: data.post_purchase_wait_minutes,
                    waitTimeMinutes: data.wait_time_minutes,
                    cooldownDays: data.cooldown_days,
                    inactiveDays: data.inactive_days,
                    flowName: data.flowName,
                    journeyName: data.journeyName,
                    timingOffset: data.timing_offset,
                }
                if (journeyData?.id) {
                    await handleUpdate(params)
                } else {
                    await handleCreate(params).then((res) => {
                        history.replace(
                            `/app/ai-journey/${shopName}/${journeyType}/setup/${res.id}`,
                        )
                    })
                }
            }
        } catch {
            return
        }

        methods.reset(data)
        toast.success('Changes saved successfully')
    }

    const staticTitle = isCampaign
        ? (journeyData?.campaign?.title ?? 'Create new campaign')
        : (journeyData?.name ?? FLOW_TITLE_MAP[journeyType] ?? 'Edit flow')

    const titlePlaceholder = isCampaign
        ? 'Create new campaign'
        : (FLOW_TITLE_MAP[journeyType] ?? 'Edit flow')

    const backPath = isCampaign
        ? `/app/ai-journey/${shopName}/campaigns`
        : `/app/ai-journey/${shopName}/flows`

    const backAriaLabel = isCampaign ? 'Back to campaigns' : 'Back to flows'

    const handlePromptSave = async () => {
        await handleSubmit(handleSave, () =>
            toast.error(
                'Please make sure all fields are filled out correctly before saving',
            ),
        )()
    }

    return (
        <FormProvider {...methods}>
            <UnsavedChangesPrompt
                ref={unsavedChangesPromptRef}
                when={formState.isDirty && !formState.isSubmitting}
                onSave={handlePromptSave}
                onDiscard={() => methods.reset()}
                shouldRedirectAfterSave
            />
            <form className={css.form} onSubmit={handleSubmit(handleSave)}>
                <Box flex={1} flexDirection="column" className={css.mainColumn}>
                    <PanelHeader
                        isSticky={false}
                        py="md"
                        px="lg"
                        title={
                            isEditableTitle ? (
                                <Controller
                                    name={
                                        isCampaign
                                            ? 'campaignTitle'
                                            : 'flowName'
                                    }
                                    control={control}
                                    rules={{ required: 'Field is required' }}
                                    render={({ field, fieldState }) => (
                                        <div className={css.titleField}>
                                            {!field.value && (
                                                <div
                                                    aria-hidden="true"
                                                    className={
                                                        css.titlePlaceholder
                                                    }
                                                >
                                                    <span>
                                                        {titlePlaceholder}
                                                    </span>
                                                    <span
                                                        className={
                                                            css.titleRequiredMark
                                                        }
                                                    >
                                                        *
                                                    </span>
                                                </div>
                                            )}
                                            <input
                                                type="text"
                                                aria-label={
                                                    isCampaign
                                                        ? 'Campaign title'
                                                        : 'Flow name'
                                                }
                                                aria-invalid={
                                                    !!fieldState.error
                                                }
                                                aria-describedby={
                                                    fieldState.error
                                                        ? titleErrorId
                                                        : undefined
                                                }
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
                                                className={css.titleInput}
                                            />
                                            {fieldState.error && (
                                                <p
                                                    id={titleErrorId}
                                                    role="alert"
                                                    className={css.errorMessage}
                                                >
                                                    {fieldState.error.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                            ) : (
                                <Heading size="xl">{staticTitle}</Heading>
                            )
                        }
                        leadingSlot={
                            <Button
                                variant="secondary"
                                aria-label={backAriaLabel}
                                onClick={() => history.push(backPath)}
                                icon="arrow-left"
                            />
                        }
                        trailingSlot={
                            <>
                                {isCampaign ? (
                                    <Button
                                        variant="secondary"
                                        onClick={() =>
                                            runActionWithUnsavedChangesPrompt(
                                                () =>
                                                    setIsSchedulePanelOpen(
                                                        true,
                                                    ),
                                            )
                                        }
                                        isDisabled={
                                            isLoading || !journeyData?.id
                                        }
                                    >
                                        Schedule
                                    </Button>
                                ) : (
                                    <Button
                                        variant="secondary"
                                        onClick={() =>
                                            runActionWithUnsavedChangesPrompt(
                                                () =>
                                                    void handleToggleFlowState(),
                                            )
                                        }
                                        isDisabled={
                                            isLoading || !journeyData?.id
                                        }
                                    >
                                        {isFlowActive ? 'Pause' : 'Enable'}
                                    </Button>
                                )}
                                <Menu
                                    trigger={({ isOpen }) => (
                                        <Button
                                            variant="secondary"
                                            isDisabled={!journeyData?.id}
                                            trailingSlot={
                                                <Icon
                                                    name={
                                                        isOpen
                                                            ? 'arrow-chevron-up'
                                                            : 'arrow-chevron-down'
                                                    }
                                                    size="sm"
                                                />
                                            }
                                        >
                                            Test
                                        </Button>
                                    )}
                                    aria-label="Test options"
                                >
                                    <MenuItem
                                        id="send-test-sms"
                                        label="Send test SMS"
                                        onAction={() =>
                                            runActionWithUnsavedChangesPrompt(
                                                () => setIsTestModalOpen(true),
                                            )
                                        }
                                    />
                                    <MenuItem
                                        id="preview-here"
                                        label="Preview here"
                                        onAction={() =>
                                            runActionWithUnsavedChangesPrompt(
                                                () =>
                                                    setIsCollapsibleColumnOpen(
                                                        true,
                                                    ),
                                            )
                                        }
                                    />
                                </Menu>
                                <Button
                                    onClick={handleSubmit(handleSave)}
                                    isDisabled={isLoading}
                                    isLoading={formState.isSubmitting}
                                >
                                    Save changes
                                </Button>
                            </>
                        }
                    />

                    <Box
                        flex={1}
                        flexDirection="column"
                        className={css.mainContent}
                    >
                        <Box
                            flexDirection="column"
                            gap="lg"
                            className={css.mainContentInner}
                        >
                            <MessageGuidanceCard
                                fullWidth
                                isV3Architecture
                                isFormReady={isFormReady}
                            />
                        </Box>
                    </Box>
                </Box>
                <JourneyEditorSidePanel isFormReady={isFormReady} />
                {isCollapsibleColumnOpen && (
                    <PreviewPanel
                        onClose={() => setIsCollapsibleColumnOpen(false)}
                    />
                )}
            </form>
            <SendTestSMSModal
                isOpen={isTestModalOpen}
                onClose={() => setIsTestModalOpen(false)}
            />
            {isCampaign && (
                <ScheduleCampaignPanel
                    isOpen={isSchedulePanelOpen}
                    onClose={() => setIsSchedulePanelOpen(false)}
                />
            )}
        </FormProvider>
    )
}
