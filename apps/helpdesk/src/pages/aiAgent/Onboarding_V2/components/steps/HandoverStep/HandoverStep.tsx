import type { FC } from 'react'
import type React from 'react'
import { useEffect, useMemo, useRef } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { Tag } from '@gorgias/axiom'
import type { EmailIntegration } from '@gorgias/helpdesk-types'

import { EMAIL_INTEGRATION_TYPES } from 'constants/integration'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { Card } from 'pages/aiAgent/Onboarding_V2/components/Card'
import { StepHeader } from 'pages/aiAgent/Onboarding_V2/components/StepHeader/StepHeader'
import GorgiasIcon from 'pages/aiAgent/Onboarding_V2/components/steps/KnowledgeStep/icons/GorgiasIcon'
import type { StepProps } from 'pages/aiAgent/Onboarding_V2/components/steps/types'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding_V2/hooks/useCheckOnboardingCompleted'
import { useCheckStoreAlreadyConfigured } from 'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreAlreadyConfigured'
import { useCheckStoreIntegration } from 'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreIntegration'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'
import { useOnboardingIntegrationRedirection } from 'pages/aiAgent/Onboarding_V2/hooks/useOnboardingIntegrationRedirection'
import { useSteps } from 'pages/aiAgent/Onboarding_V2/hooks/useSteps'
import { useTrackFieldValue } from 'pages/aiAgent/Onboarding_V2/hooks/useTrackFieldValue'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding_V2/hooks/useUpdateOnboarding'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding_V2/layout/ConvAiOnboardingLayout'
import RadioButton from 'pages/common/components/RadioButton'
import { isBaseEmailIntegration } from 'pages/integrations/integration/components/email/helpers'
import { HandoverEmailFields } from 'pages/standalone/components/HandoverEmailFields'
import HandoverWebhookFields from 'pages/standalone/components/HandoverWebhookFields'
import { useStandaloneIntegrationUpsert } from 'pages/standalone/hooks/useStandaloneIntegrationUpsert'
import type { HandoverFormValues } from 'pages/standalone/schemas'
import { handoverSchema } from 'pages/standalone/schemas'
import { HelpdeskIntegrationOptions } from 'pages/standalone/types'
import { getWebhookRequiredFields } from 'pages/standalone/utils'
import { getIntegrationsByTypes } from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from './HandoverStep.less'

const HandoverCard: FC<{
    label: string
    caption: string
    value: string
    onChange: (value: string) => void
    isSelected?: boolean
    badgeColor?: 'blue'
    badgeContent?: string
    children?: React.ReactNode
}> = ({
    label,
    caption,
    value,
    isSelected,
    onChange,
    badgeColor,
    badgeContent,
    children,
}) => {
    const toggleRef = useRef<HTMLInputElement>(null)
    return (
        <Card className={css.card} onClick={() => toggleRef.current!.click()}>
            <div className={css.cardTitleRow}>
                <RadioButton
                    ref={toggleRef}
                    label={label}
                    caption={caption}
                    value={value}
                    isSelected={isSelected}
                    onChange={onChange}
                ></RadioButton>
                {badgeColor && badgeContent && (
                    <Tag color={badgeColor}>{badgeContent}</Tag>
                )}
            </div>
            {children}
        </Card>
    )
}

export const HandoverStep: FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
    isStoreSelected,
}) => {
    const { shopName, step: stepName } = useParams<{
        shopName: string
        step: string
    }>()

    const { validSteps } = useSteps({ shopName, isStoreSelected })

    useCheckStoreIntegration()
    useCheckOnboardingCompleted()
    useCheckStoreAlreadyConfigured()

    const onBackClick = () => {
        const previousStep = validSteps[currentStep - 2]?.step

        goToStep(previousStep)
    }

    const { data, isLoading: isLoadingOnboardingData } =
        useGetOnboardingData(shopName)

    const emailIntegrations = useAppSelector(
        getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES),
    )

    const { redirectToIntegration, integrationId: emailIntegrationId } =
        useOnboardingIntegrationRedirection()

    const dispatch = useAppDispatch()

    const selectableEmailIntegrations = useMemo(() => {
        return emailIntegrations
            .filter((integration) => !isBaseEmailIntegration(integration))
            .map((integration) => {
                return {
                    email: integration.meta.address,
                    id: integration.id,
                    isDefault: false,
                    isDisabled: false,
                }
            })
    }, [emailIntegrations])

    const validBaseEmailIntegration = useMemo(() => {
        return emailIntegrations.find(
            (integration) =>
                isBaseEmailIntegration(integration) &&
                (integration as EmailIntegration).meta.verified,
        )
    }, [emailIntegrations])

    const formMethods = useForm<HandoverFormValues>({
        values: {
            handoverMethod: data?.handoverMethod ?? 'email',
            email: (emailIntegrationId || data?.handoverEmail) ?? '',
            emailIntegration: data?.handoverEmailIntegrationId ?? undefined,
            baseEmailIntegration: validBaseEmailIntegration?.id ?? undefined,
            webhookIntegration: data?.handoverHttpIntegrationId ?? undefined,
            webhookThirdParty: HelpdeskIntegrationOptions.ZENDESK,
            webhookRequiredFields: getWebhookRequiredFields(
                HelpdeskIntegrationOptions.ZENDESK,
            ),
        },
        mode: 'onChange',
        resolver: zodResolver(handoverSchema),
    })

    const {
        watch,
        setValue,
        formState: { errors },
        handleSubmit,
    } = formMethods

    const handoverMethod = watch('handoverMethod')
    const email = watch('email')
    const emailIntegration = watch('emailIntegration')
    const webhookThirdParty = watch('webhookThirdParty')
    const webhookRequiredFields = watch('webhookRequiredFields')
    const webhookIntegration = watch('webhookIntegration')

    useTrackFieldValue({
        currentStep,
        stepName,
        shopName,
        fieldName: 'handoverMethod',
        fieldType: 'select',
        fieldValue: handoverMethod,
    })

    useTrackFieldValue({
        currentStep,
        stepName,
        shopName,
        fieldName: 'email',
        fieldType: 'input',
        fieldValue: email,
        debounceMs: 1000,
    })

    useTrackFieldValue({
        currentStep,
        stepName,
        shopName,
        fieldName: 'webhookThirdParty',
        fieldType: 'select',
        fieldValue: webhookThirdParty,
    })

    const {
        mutate: doUpdateOnboardingMutation,
        isLoading: isUpdatingOnboarding,
    } = useUpdateOnboarding()

    const updateOnboardingAndSave = (integrationId: number | null) => {
        const updatedValues = {
            handoverMethod: handoverMethod,
            handoverEmail: email || null,
            handoverEmailIntegrationId: !!validBaseEmailIntegration
                ? validBaseEmailIntegration.id
                : (emailIntegration ?? null),
            handoverHttpIntegrationId: integrationId,
        }

        if (data && 'id' in data) {
            doUpdateOnboardingMutation(
                { id: data!.id, data: { ...data, ...updatedValues } },
                {
                    onSuccess: () => {
                        const nextStep = validSteps[currentStep]?.step
                        goToStep(nextStep)
                    },
                },
            )
        } else {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Onboarding data not found.',
                }),
            )
        }
    }

    const onIntegrationCreateSuccess: (integrationId: number) => void = (
        integrationId,
    ) => {
        setValue('webhookIntegration', integrationId)
        updateOnboardingAndSave(integrationId)
    }

    const { upsert, currentIntegrationType } = useStandaloneIntegrationUpsert(
        Number(webhookIntegration ?? null),
        webhookRequiredFields || {},
        onIntegrationCreateSuccess,
    )

    useEffect(() => {
        setValue('webhookThirdParty', currentIntegrationType)
        setValue(
            'webhookRequiredFields',
            getWebhookRequiredFields(currentIntegrationType),
        )
    }, [currentIntegrationType, setValue])

    const onNextClick = () => {
        if (handoverMethod === 'webhook') {
            upsert(webhookThirdParty!)
        } else {
            updateOnboardingAndSave(webhookIntegration ?? null)
        }
    }

    return (
        <OnboardingBody>
            <OnboardingContentContainer
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextClick={handleSubmit(onNextClick)}
                onBackClick={onBackClick}
                isLoading={isLoadingOnboardingData || isUpdatingOnboarding}
            >
                <StepHeader title="Next, how do you want to manage handovers?" />
                <div className={css.handoverCardsContainer}>
                    <HandoverCard
                        label="Email"
                        caption="Conversations that need human intervention will be sent to this email address."
                        value="email"
                        isSelected={handoverMethod === 'email'}
                        onChange={(value) => setValue('handoverMethod', value)}
                    >
                        {handoverMethod === 'email' && (
                            <HandoverEmailFields
                                email={email ?? ''}
                                emailIntegration={Number(
                                    emailIntegration ?? null,
                                )}
                                errors={errors}
                                setValue={setValue}
                                selectableEmailIntegrations={
                                    selectableEmailIntegrations
                                }
                                onEmailIntegrationCtaClick={
                                    redirectToIntegration
                                }
                                hideIntegrations={!!validBaseEmailIntegration}
                            />
                        )}
                    </HandoverCard>

                    <HandoverCard
                        label="Gorgias"
                        caption="Conversations that need human intervention will be sent to handover tickets within Gorgias."
                        value="gorgias"
                        isSelected={handoverMethod === 'gorgias'}
                        onChange={(value) => setValue('handoverMethod', value)}
                    />
                    <HandoverCard
                        label="Webhook"
                        caption="Conversations that need human intervention will use this webhook to send handover conversations to the tool of your choice."
                        value="webhook"
                        isSelected={handoverMethod === 'webhook'}
                        onChange={(value) => setValue('handoverMethod', value)}
                        badgeColor="blue"
                        badgeContent="Recommended"
                    >
                        {handoverMethod === 'webhook' && (
                            <HandoverWebhookFields
                                errors={errors}
                                setValue={setValue}
                                onClick={(value, context) => {
                                    setValue('webhookThirdParty', value)
                                    setValue(
                                        'webhookRequiredFields',
                                        getWebhookRequiredFields(
                                            value as HelpdeskIntegrationOptions,
                                        ),
                                    )
                                    context?.onBlur()
                                }}
                                webhookThirdParty={
                                    webhookThirdParty as HelpdeskIntegrationOptions
                                }
                                webhookRequiredFields={webhookRequiredFields}
                                selectedIntegration={webhookIntegration}
                            />
                        )}
                    </HandoverCard>
                </div>
            </OnboardingContentContainer>
            <OnboardingPreviewContainer
                isLoading={true}
                icon={<GorgiasIcon size="40%" />}
            ></OnboardingPreviewContainer>
        </OnboardingBody>
    )
}
