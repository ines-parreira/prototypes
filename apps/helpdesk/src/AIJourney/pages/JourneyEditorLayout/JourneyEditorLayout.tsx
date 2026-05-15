import { useEffect, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { SubmitHandler } from 'react-hook-form'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'

import {
    Box,
    Button,
    Heading,
    Icon,
    Menu,
    MenuItem,
    Text,
} from '@gorgias/axiom'
import { JourneyStatusEnum } from '@gorgias/convert-client'

import { JOURNEY_TYPES } from 'AIJourney/constants'
import {
    useJourneyCreateHandler,
    useJourneyUpdateHandler,
} from 'AIJourney/hooks'
import type { SetupFormValues } from 'AIJourney/pages/Setup/Setup'
import { useJourneyContext } from 'AIJourney/providers'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import { KlaviyoSetupCard } from 'AIJourney/components'

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

const TITLE_INPUT_STYLE: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: 0,
    fontWeight: 600,
    fontSize: 20,
    lineHeight: '32px',
    color: 'var(--content-neutral-default)',
    width: '100%',
    fontFamily: 'inherit',
}

const TITLE_PLACEHOLDER_STYLE: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xxs)',
    pointerEvents: 'none',
    color: 'var(--content-neutral-tertiary)',
    fontWeight: 600,
    fontSize: 20,
    lineHeight: '32px',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
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
    const storeSettingsEnabled = useFlag(
        FeatureFlagKey.AiJourneyStoreSettingsEnabled,
    )
    const isCampaign = journeyType === JOURNEY_TYPES.CAMPAIGN
    const isCustomFlow = journeyType === JOURNEY_TYPES.CUSTOM
    const isEditableTitle = isCampaign || isCustomFlow

    const isPreviewStep = step === 'preview'

    const methods = useForm<SetupFormValues>({
        defaultValues: {
            max_follow_up_messages: 1,
            include_image: false,
            offer_discount: false,
            message_instructions: '',
            execution_mode_override: null,
            ...(isCampaign && {
                campaignTitle: journeyData?.campaign?.title,
                scheduleType: 'later' as const,
                scheduledDate: null,
                scheduledTime: null,
            }),
            ...(isCustomFlow && {
                flowName: journeyData?.name ?? undefined,
            }),
            ...(!isCampaign &&
                journeyType === JOURNEY_TYPES.WIN_BACK && {
                    cooldown_days: 30,
                    inactive_days: 30,
                }),
        },
    })
    const { handleSubmit, control } = methods

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
        const smsSenderFields = !storeSettingsEnabled
            ? {
                  phoneNumberIntegrationId: data.sms_sender_integration_id?.id,
                  phoneNumber: data.sms_sender_integration_id?.label,
              }
            : {}

        const commonFields = {
            ...smsSenderFields,
            followUpValue: data.max_follow_up_messages - 1,
            followUpWaitMinutes: data.follow_up_wait_minutes,
            includeImage: data.include_image,
            uploadedImageAttachment: data.uploaded_image_attachment,
            isDiscountEnabled: data.offer_discount,
            discountValue: data.max_discount_percent,
            discountCodeThresholdValue: data.discount_code_message_threshold,
            targetOrderStatus: data.target_order_status,
            includedAudienceListIds: data.included_audience_list_ids,
            excludedAudienceListIds: data.excluded_audience_list_ids,
            rcsEnabled: data.rcs_enabled,
            journeyMessageInstructions: data.message_instructions,
            ...(window.USER_IMPERSONATED && {
                executionModeOverride: data.execution_mode_override,
            }),
        }

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
            await handleUpdate({
                ...commonFields,
                postPurchaseWaitMinutes: data.post_purchase_wait_minutes,
                waitTimeMinutes: data.wait_time_minutes,
                cooldownDays: data.cooldown_days,
                inactiveDays: data.inactive_days,
                flowName: data.flowName,
            })
        }
    }

    const webhookUrl = journeyData?.webhook_url ?? undefined
    const hasWebhookUrl = isCustomFlow && !!webhookUrl

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

    const instructionsHelperText = isCampaign
        ? "Describe campaign context, objective, and boundaries in clear, specific phrases. Type '/' to insert variables."
        : "Describe flow context, objective, and boundaries in clear, specific phrases. Type '/' to insert variables."

    return (
        <FormProvider {...methods}>
            <form
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flex: 1,
                    minHeight: 0,
                    overflow: 'hidden',
                }}
                onSubmit={handleSubmit(handleSave)}
            >
                <Box flex={1} flexDirection="column" style={{ minHeight: 0 }}>
                    {/* Header */}
                    <Box
                        alignItems="center"
                        justifyContent="space-between"
                        gap="sm"
                        style={{
                            padding: 'var(--spacing-md) var(--spacing-lg)',
                            flexShrink: 0,
                        }}
                    >
                        <Box
                            alignItems="center"
                            gap="sm"
                            flex={1}
                            style={{ minWidth: 0 }}
                        >
                            <Button
                                variant="secondary"
                                aria-label={backAriaLabel}
                                onClick={() => history.push(backPath)}
                                icon="arrow-left"
                            />

                            {isEditableTitle ? (
                                <Controller
                                    name={
                                        isCampaign
                                            ? 'campaignTitle'
                                            : 'flowName'
                                    }
                                    control={control}
                                    render={({ field }) => (
                                        <div
                                            style={{
                                                position: 'relative',
                                                flex: 1,
                                                minWidth: 0,
                                            }}
                                        >
                                            {!field.value && (
                                                <div
                                                    aria-hidden="true"
                                                    style={
                                                        TITLE_PLACEHOLDER_STYLE
                                                    }
                                                >
                                                    <span>
                                                        {titlePlaceholder}
                                                    </span>
                                                    <span
                                                        style={{
                                                            color: 'var(--content-negative-default)',
                                                        }}
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
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
                                                style={TITLE_INPUT_STYLE}
                                            />
                                        </div>
                                    )}
                                />
                            ) : (
                                <Heading size="xl">{staticTitle}</Heading>
                            )}
                        </Box>
                        <Box gap="xs" alignItems="center">
                            {isCampaign ? (
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsSchedulePanelOpen(true)}
                                    isDisabled={isLoading || !journeyData?.id}
                                >
                                    Schedule
                                </Button>
                            ) : (
                                <Button
                                    variant="secondary"
                                    onClick={() => void handleToggleFlowState()}
                                    isDisabled={isLoading || !journeyData?.id}
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
                                    onAction={() => setIsTestModalOpen(true)}
                                />
                                <MenuItem
                                    id="preview-here"
                                    label="Preview here"
                                    onAction={() =>
                                        setIsCollapsibleColumnOpen(true)
                                    }
                                />
                            </Menu>
                            <Button
                                onClick={handleSubmit(handleSave)}
                                isDisabled={isLoading}
                            >
                                Save changes
                            </Button>
                        </Box>
                    </Box>

                    {/* Main content */}
                    <Box
                        flex={1}
                        flexDirection="column"
                        style={{
                            overflowY: 'auto',
                            padding: 'var(--spacing-lg)',
                        }}
                    >
                        <Box
                            flexDirection="column"
                            style={{
                                width: 648,
                                maxWidth: '100%',
                                margin: '0 auto',
                            }}
                        >
                            {/* Instructions label + helper */}
                            <Box
                                flexDirection="column"
                                gap="xxxxs"
                                style={{ marginBottom: 'var(--spacing-md)' }}
                            >
                                <Text size="md" variant="medium">
                                    Instructions{' '}
                                    <span
                                        className={css.required}
                                        aria-hidden="true"
                                    >
                                        *
                                    </span>
                                </Text>
                                <Text
                                    size="sm"
                                    color="var(--content-neutral-secondary)"
                                >
                                    {instructionsHelperText}
                                </Text>
                            </Box>
                            {hasWebhookUrl && (
                                <Box
                                    style={{
                                        marginBottom: 'var(--spacing-lg)',
                                    }}
                                >
                                    <KlaviyoSetupCard webhookUrl={webhookUrl} />
                                </Box>
                            )}
                            {/* TODO: replace with GuidanceEditor (AIJOU-2016) */}
                            <Controller
                                name="message_instructions"
                                control={control}
                                render={({ field }) => (
                                    <textarea
                                        className={css.instructionsPlaceholder}
                                        style={{
                                            flex: 1,
                                            width: '100%',
                                            minHeight: 200,
                                            resize: 'none',
                                            border: '1px solid var(--border-neutral-default)',
                                            borderRadius:
                                                'var(--border-radius-md)',
                                            outline: 'none',
                                            background: 'transparent',
                                            fontFamily: 'inherit',
                                            fontSize: 'inherit',
                                            color: 'var(--content-neutral-default)',
                                            padding: 'var(--spacing-md)',
                                        }}
                                        placeholder="Type your instructions here…"
                                        aria-label="Message instructions"
                                        value={field.value ?? ''}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </Box>
                    </Box>
                </Box>
                <JourneyEditorSidePanel />
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
