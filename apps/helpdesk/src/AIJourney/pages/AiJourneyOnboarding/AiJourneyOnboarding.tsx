import type React from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'

import {
    CalendarDate,
    getLocalTimeZone,
    Time,
    toCalendarDateTime,
    toZoned,
} from '@internationalized/date'
import type { SubmitHandler } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'

import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    PanelHeader,
    Text,
} from '@gorgias/axiom'
import { JourneyStatusEnum } from '@gorgias/convert-client'

import { OnboardingStepper } from 'AIJourney/components'
import {
    CAMPAIGN_ONBOARDING_STEPS,
    JOURNEY_ONBOARDING_STEPS,
    JOURNEY_TYPES,
    STEPS_NAMES,
    UpdatableJourneyCampaignState,
} from 'AIJourney/constants'
import {
    useJourneyCreateHandler,
    useJourneyUpdateHandler,
} from 'AIJourney/hooks'
import type { SetupFormValues } from 'AIJourney/pages/Setup/Setup'
import { useJourneyContext } from 'AIJourney/providers'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

export type StepComponentProps = {
    journeyType?: JOURNEY_TYPES
}

type AiJourneyOnboardingProps = {
    journeyType: JOURNEY_TYPES
    step: STEPS_NAMES
    stepComponent: React.ComponentType<StepComponentProps>
}

export function buildScheduledDatetime(
    getValues: () => SetupFormValues,
): string | null {
    const { scheduleType, scheduledDate, scheduledTime } = getValues()
    if (scheduleType === 'later' && scheduledDate && scheduledTime) {
        const calDate = new CalendarDate(
            scheduledDate.year,
            scheduledDate.month,
            scheduledDate.day,
        )
        const time = new Time(
            scheduledTime.hour,
            scheduledTime.minute,
            scheduledTime.second,
            scheduledTime.millisecond,
        )
        const calDateTime = toCalendarDateTime(calDate, time)
        return toZoned(calDateTime, getLocalTimeZone())
            .toString()
            .replace(/\[.*\]$/, '')
    }
    return null
}

export const AiJourneyOnboarding = ({
    journeyType,
    step,
    stepComponent: StepComponent,
}: AiJourneyOnboardingProps) => {
    const history = useHistory()
    const isCampaign = journeyType === JOURNEY_TYPES.CAMPAIGN
    const onboardingSteps = isCampaign
        ? CAMPAIGN_ONBOARDING_STEPS
        : JOURNEY_ONBOARDING_STEPS

    const methods = useForm<SetupFormValues>({
        defaultValues: {
            max_follow_up_messages: 1,
            include_image: false,
            offer_discount: false,
            message_instructions: '',
            ...(journeyType === JOURNEY_TYPES.WIN_BACK && {
                cooldown_days: 30,
                inactive_days: 30,
            }),
            ...(isCampaign && {
                scheduleType: 'later' as const,
                scheduledDate: null,
                scheduledTime: null,
            }),
        },
    })
    const { handleSubmit, getValues, watch } = methods

    const { currentIntegration, journeyData, shopName } = useJourneyContext()
    const journeyId = journeyData?.id

    const { setIsCollapsibleColumnOpen } = useCollapsibleColumn()

    const titleMapping: Record<JOURNEY_TYPES, string | undefined> = {
        [JOURNEY_TYPES.WELCOME]: 'Welcome flow',
        [JOURNEY_TYPES.POST_PURCHASE]: 'Post-purchase flow',
        [JOURNEY_TYPES.CART_ABANDONMENT]: 'SMS cart abandoned flow',
        [JOURNEY_TYPES.SESSION_ABANDONMENT]: 'SMS browse abandoned flow',
        [JOURNEY_TYPES.WIN_BACK]: 'Customer win-back flow',
        [JOURNEY_TYPES.CAMPAIGN]: journeyData
            ? journeyData.campaign?.title
            : 'Create new campaign',
        [JOURNEY_TYPES.CUSTOM]: journeyData
            ? (journeyData.name ?? undefined)
            : 'Create custom flow',
    }

    const currentStepIndex = useMemo(
        () => onboardingSteps.findIndex((s) => s.name === step),
        [onboardingSteps, step],
    )

    const handleStepClick = (stepName: STEPS_NAMES) => {
        if (journeyData?.id) {
            history.push(
                `/app/ai-journey/${shopName}/${journeyType}/${stepName}/${journeyData.id}`,
            )
        }
    }

    const nextStep = useMemo(
        () => onboardingSteps[currentStepIndex + 1]?.name,
        [onboardingSteps, currentStepIndex],
    )

    const previousStep = useMemo(
        () => onboardingSteps[currentStepIndex - 1]?.name,
        [onboardingSteps, currentStepIndex],
    )

    const { handleCreate, isLoading: isLoadingHandleCreate } =
        useJourneyCreateHandler({
            integrationId: currentIntegration?.id,
            integrationName: currentIntegration?.name,
            journeyType,
        })

    const { handleUpdate, isLoading: isLoadingHandleUpdate } =
        useJourneyUpdateHandler({
            integrationId: currentIntegration?.id,
            journeyId: journeyData?.id,
            entityLabel: isCampaign ? 'campaign' : 'journey',
        })

    const campaignState = journeyData?.campaign?.state
    const isScheduledCampaign = campaignState === 'scheduled'
    const isReadOnlyCampaign =
        campaignState === 'canceled' ||
        campaignState === 'sent' ||
        campaignState === 'active' ||
        campaignState === 'paused'
    const isScheduleStep = step === STEPS_NAMES.SCHEDULE

    const [isSendNowConfirmOpen, setIsSendNowConfirmOpen] = useState(false)
    const pendingSubmitData = useRef<SetupFormValues | null>(null)

    const navigateToCampaignList = useCallback(
        () => history.push(`/app/ai-journey/${shopName}/campaigns`),
        [history, shopName],
    )

    const handleMiddleButtonClick = async () => {
        if (!isScheduleStep) return

        const scheduledDatetime = buildScheduledDatetime(getValues)
        if (isScheduledCampaign) {
            await handleUpdate({
                campaignState: UpdatableJourneyCampaignState.Draft,
                ...(scheduledDatetime && { scheduledDatetime }),
            })
        } else {
            await handleUpdate({
                scheduledDatetime: scheduledDatetime ?? null,
            })
        }
        navigateToCampaignList()
    }

    const executeSendNow = useCallback(async () => {
        await handleUpdate({
            campaignState: UpdatableJourneyCampaignState.Scheduled,
            scheduledDatetime: null,
        })
        navigateToCampaignList()
    }, [handleUpdate, navigateToCampaignList])

    const handleSendNowConfirm = async () => {
        setIsSendNowConfirmOpen(false)
        pendingSubmitData.current = null
        await executeSendNow()
    }

    const handleContinue: SubmitHandler<SetupFormValues> = async (data) => {
        if (isScheduleStep) {
            const scheduleType = getValues().scheduleType
            const scheduledDatetime = buildScheduledDatetime(getValues)

            if (scheduleType === 'later' && scheduledDatetime) {
                await handleUpdate({
                    campaignState: UpdatableJourneyCampaignState.Scheduled,
                    scheduledDatetime,
                })
            } else {
                pendingSubmitData.current = data
                setIsSendNowConfirmOpen(true)
                return
            }
            navigateToCampaignList()
            return
        }

        if (step === STEPS_NAMES.ACTIVATE) {
            if (isCampaign) {
                history.push(
                    `/app/ai-journey/${shopName}/${journeyType}/${nextStep}/${journeyData?.id}`,
                )
            } else {
                await handleUpdate({
                    journeyState: JourneyStatusEnum.Active,
                }).then(() => {
                    if (journeyType === JOURNEY_TYPES.CUSTOM && journeyId) {
                        history.push(
                            `/app/ai-journey/${shopName}/custom/webhook-setup/${journeyId}`,
                        )
                    } else {
                        history.push(`/app/ai-journey/${shopName}/flows`)
                    }
                })
            }
            return
        }

        if (step === STEPS_NAMES.PREVIEW) {
            setIsCollapsibleColumnOpen(false)
            await handleUpdate({
                journeyMessageInstructions: data.message_instructions,
            }).then(() =>
                history.push(
                    `/app/ai-journey/${shopName}/${journeyType}/${nextStep}/${journeyData?.id}`,
                ),
            )
            return
        }

        if (journeyData?.id) {
            await handleUpdate({
                phoneNumberIntegrationId: data.sms_sender_integration_id?.id,
                phoneNumber: data.sms_sender_integration_id?.label,
                followUpValue: data.max_follow_up_messages - 1,
                followUpWaitMinutes: data.follow_up_wait_minutes,
                includeImage: data.include_image,
                uploadedImageAttachment: data.uploaded_image_attachment,
                isDiscountEnabled: data.offer_discount,
                discountValue: data.max_discount_percent,
                discountCodeThresholdValue:
                    data.discount_code_message_threshold,
                targetOrderStatus: data.target_order_status,
                postPurchaseWaitMinutes: data.post_purchase_wait_minutes,
                waitTimeMinutes: data.wait_time_minutes,
                cooldownDays: data.cooldown_days,
                inactiveDays: data.inactive_days,
                includedAudienceListIds: data.included_audience_list_ids,
                excludedAudienceListIds: data.excluded_audience_list_ids,
                campaignTitle: data.campaignTitle,
                rcsEnabled: data.rcs_enabled,
                flowName: data.flowName,
            }).then(() =>
                history.push(
                    `/app/ai-journey/${shopName}/${journeyType}/${nextStep}/${journeyData.id}`,
                ),
            )
        } else {
            await handleCreate({
                phoneNumberIntegrationId: data.sms_sender_integration_id?.id,
                phoneNumber: data.sms_sender_integration_id?.label,
                followUpValue: data.max_follow_up_messages - 1,
                followUpWaitMinutes: data.follow_up_wait_minutes,
                includeImage: data.include_image,
                uploadedImageAttachment: data.uploaded_image_attachment,
                isDiscountEnabled: data.offer_discount,
                discountValue: data.max_discount_percent,
                discountCodeThresholdValue:
                    data.discount_code_message_threshold,
                targetOrderStatus: data.target_order_status,
                postPurchaseWaitMinutes: data.post_purchase_wait_minutes,
                waitTimeMinutes: data.wait_time_minutes,
                cooldownDays: data.cooldown_days,
                inactiveDays: data.inactive_days,
                includedAudienceListIds: data.included_audience_list_ids,
                excludedAudienceListIds: data.excluded_audience_list_ids,
                campaignTitle: data.campaignTitle,
                rcsEnabled: data.rcs_enabled,
                flowName: data.flowName,
            }).then((res) =>
                history.push(
                    `/app/ai-journey/${shopName}/${journeyType}/${nextStep}/${res.id}`,
                ),
            )
        }
    }

    const handleCancel = () => {
        if (step === STEPS_NAMES.PREVIEW) {
            setIsCollapsibleColumnOpen(false)
        }

        if (journeyId && previousStep)
            return history.push(
                `/app/ai-journey/${shopName}/${journeyType}/${previousStep}/${journeyId}`,
            )
        return history.push(
            `/app/ai-journey/${shopName}/${isCampaign ? 'campaigns' : 'flows'}`,
        )
    }

    const isMissingAudience =
        isScheduleStep &&
        (!journeyData?.included_audience_list_ids ||
            journeyData.included_audience_list_ids.length === 0)
    const isMissingMessageInstructions =
        isScheduleStep && !journeyData?.message_instructions

    const scheduleStepBlockers: string[] = []
    if (isMissingAudience) scheduleStepBlockers.push('Add an audience')
    if (isMissingMessageInstructions)
        scheduleStepBlockers.push('Add message guidance')

    const scheduleType = watch('scheduleType')
    const scheduledDate = watch('scheduledDate')
    const scheduledTime = watch('scheduledTime')

    const isScheduleMissingDateOrTime =
        isScheduleStep &&
        scheduleType === 'later' &&
        (!scheduledDate || !scheduledTime)

    const shouldDisableContinueButton =
        isLoadingHandleCreate ||
        isLoadingHandleUpdate ||
        isReadOnlyCampaign ||
        scheduleStepBlockers.length > 0 ||
        isScheduleMissingDateOrTime

    let primaryButtonLabel = 'Continue'
    let middleButtonLabel: string | null = null
    const secondaryButtonLabel = step === STEPS_NAMES.SETUP ? 'Cancel' : 'Back'

    if (isScheduleStep) {
        if (isScheduledCampaign) {
            middleButtonLabel = 'Revert to draft'
            primaryButtonLabel =
                scheduleType === 'later' ? 'Save changes' : 'Send'
        } else {
            middleButtonLabel = 'Save as draft'
            primaryButtonLabel = scheduleType === 'later' ? 'Schedule' : 'Send'
        }
    } else if (step === STEPS_NAMES.ACTIVATE) {
        primaryButtonLabel = isCampaign ? 'Continue' : 'Activate flow'
    }

    return (
        <FormProvider {...methods}>
            <Box flexDirection="column">
                <PanelHeader
                    title={titleMapping[journeyType] ?? ''}
                    padding="lg"
                />
                <Box
                    flexDirection="column"
                    padding="lg"
                    paddingTop={0}
                    gap="lg"
                    width="100%"
                >
                    <OnboardingStepper
                        step={step}
                        currentStepIndex={currentStepIndex}
                        onStepClick={handleStepClick}
                        steps={onboardingSteps}
                    />
                    <form onSubmit={handleSubmit(handleContinue)}>
                        <Box flexDirection="column" gap="lg">
                            <StepComponent journeyType={journeyType} />
                            <Box justifyContent="flex-end" gap="xs">
                                <Button
                                    variant="secondary"
                                    onClick={handleCancel}
                                >
                                    {secondaryButtonLabel}
                                </Button>
                                {middleButtonLabel && (
                                    <Button
                                        variant="secondary"
                                        onClick={handleMiddleButtonClick}
                                        isDisabled={
                                            isLoadingHandleUpdate ||
                                            isReadOnlyCampaign
                                        }
                                    >
                                        {middleButtonLabel}
                                    </Button>
                                )}
                                <Button
                                    isDisabled={shouldDisableContinueButton}
                                    type="submit"
                                >
                                    {primaryButtonLabel}
                                </Button>
                            </Box>
                        </Box>
                    </form>
                </Box>
            </Box>
            <Modal
                size="sm"
                isOpen={isSendNowConfirmOpen}
                isDismissable={false}
            >
                <OverlayHeader title="Send campaign now?" />
                <OverlayContent>
                    <Text>
                        This campaign will be sent to your audience immediately.
                        Are you sure you want to proceed?
                    </Text>
                </OverlayContent>
                <OverlayFooter>
                    <Box gap="xs">
                        <Button
                            variant="secondary"
                            onClick={() => setIsSendNowConfirmOpen(false)}
                        >
                            Go back
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSendNowConfirm}
                        >
                            Send now
                        </Button>
                    </Box>
                </OverlayFooter>
            </Modal>
        </FormProvider>
    )
}
