import type React from 'react'
import { useMemo } from 'react'

import type { SubmitHandler } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'

import { Box, Button, PageHeader } from '@gorgias/axiom'
import { JourneyStatusEnum } from '@gorgias/convert-client'

import { OnboardingStepper } from 'AIJourney/components'
import {
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

export const AiJourneyOnboarding = ({
    journeyType,
    step,
    stepComponent: StepComponent,
}: AiJourneyOnboardingProps) => {
    const history = useHistory()
    const methods = useForm<SetupFormValues>({
        defaultValues: {
            sms_sender_integration_id: undefined,
            max_follow_up_messages: 1,
            include_image: false,
            offer_discount: false,
            message_instructions: '',
            ...(journeyType === JOURNEY_TYPES.WIN_BACK && {
                cooldown_days: 30,
                inactive_days: 30,
            }),
        },
    })
    const { handleSubmit } = methods

    const { currentIntegration, journeyData, shopName } = useJourneyContext()
    const journeyId = journeyData?.id

    const { setIsCollapsibleColumnOpen } = useCollapsibleColumn()

    const titleMapping = {
        [JOURNEY_TYPES.WELCOME]: 'Welcome flow',
        [JOURNEY_TYPES.POST_PURCHASE]: 'Post-purchase flow',
        [JOURNEY_TYPES.CART_ABANDONMENT]: 'SMS cart abandoned flow',
        [JOURNEY_TYPES.SESSION_ABANDONMENT]: 'SMS browse abandoned flow',
        [JOURNEY_TYPES.WIN_BACK]: 'Customer win-back flow',
        [JOURNEY_TYPES.CAMPAIGN]: journeyData
            ? journeyData.campaign?.title
            : 'Create new campaign',
    }

    const currentStepIndex = useMemo(
        () => JOURNEY_ONBOARDING_STEPS.findIndex((s) => s.name === step),
        [step],
    )

    const nextStep = useMemo(
        () => JOURNEY_ONBOARDING_STEPS[currentStepIndex + 1]?.name,
        [currentStepIndex],
    )

    const previousStep = useMemo(
        () => JOURNEY_ONBOARDING_STEPS[currentStepIndex - 1]?.name,
        [currentStepIndex],
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
        })

    const handleContinue: SubmitHandler<SetupFormValues> = async (data) => {
        if (step === STEPS_NAMES.ACTIVATE) {
            const updateParams = isCampaign
                ? { campaignState: UpdatableJourneyCampaignState.Draft }
                : { journeyState: JourneyStatusEnum.Active }
            await handleUpdate(updateParams).then(() =>
                history.push(
                    `/app/ai-journey/${shopName}/${isCampaign ? 'campaigns' : 'flows'}`,
                ),
            )
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
                phoneNumberIntegrationId: data.sms_sender_integration_id.id,
                phoneNumber: data.sms_sender_integration_id.label,
                followUpValue: data.max_follow_up_messages - 1,
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
                inactiveDays: data.wait_time_minutes,
                includedAudienceListIds: data.included_audience_list_ids,
                excludedAudienceListIds: data.excluded_audience_list_ids,
                campaignTitle: data.campaignTitle,
            }).then(() =>
                history.push(
                    `/app/ai-journey/${shopName}/${journeyType}/${nextStep}/${journeyData.id}`,
                ),
            )
        } else {
            await handleCreate({
                phoneNumberIntegrationId: data.sms_sender_integration_id.id,
                phoneNumber: data.sms_sender_integration_id.label,
                followUpValue: data.max_follow_up_messages - 1,
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
                inactiveDays: data.wait_time_minutes,
                includedAudienceListIds: data.included_audience_list_ids,
                excludedAudienceListIds: data.excluded_audience_list_ids,
                campaignTitle: data.campaignTitle,
            }).then((res) =>
                history.push(
                    `/app/ai-journey/${shopName}/${journeyType}/${nextStep}/${res.id}`,
                ),
            )
        }
    }

    const handleCancel = () => {
        const isCampaign = journeyType === JOURNEY_TYPES.CAMPAIGN

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

    const isCampaign = journeyType === JOURNEY_TYPES.CAMPAIGN

    const shouldDisableContinueButton =
        isLoadingHandleCreate || isLoadingHandleUpdate

    const primaryButtonLabel =
        step === STEPS_NAMES.ACTIVATE
            ? `Activate ${isCampaign ? 'campaign' : 'flow'}`
            : 'Continue'

    const secondaryButtonLabel = step === STEPS_NAMES.SETUP ? 'Cancel' : 'Back'

    return (
        <FormProvider {...methods}>
            <Box flexDirection="column">
                <PageHeader title={titleMapping[journeyType]} padding="lg" />
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
        </FormProvider>
    )
}
