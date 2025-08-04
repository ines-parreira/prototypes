import React, { useEffect, useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { EmailIntegration } from '@gorgias/helpdesk-types'
import { Badge, Button } from '@gorgias/merchant-ui-kit'

import { EMAIL_INTEGRATION_TYPES } from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import { AiAgentOnboardingWizardStep } from 'models/aiAgent/types'
import { HelpCenter } from 'models/helpCenter/types'
import { useStoreConfigurationForm } from 'pages/aiAgent/hooks/useStoreConfigurationForm'
import { Drawer } from 'pages/common/components/Drawer'
import RadioButton from 'pages/common/components/RadioButton'
import { SelectInputBoxContextState } from 'pages/common/forms/input/SelectInputBox'
import { isBaseEmailIntegration } from 'pages/integrations/integration/components/email/helpers'
import css from 'pages/standalone/components/HandoverConfigurationDrawer.less'
import { HandoverEmailFields } from 'pages/standalone/components/HandoverEmailFields'
import HandoverWebhookFields from 'pages/standalone/components/HandoverWebhookFields'
import { HandoverMethods } from 'pages/standalone/constants'
import { useStandaloneIntegrationUpsert } from 'pages/standalone/hooks/useStandaloneIntegrationUpsert'
import { HandoverFormValues, handoverSchema } from 'pages/standalone/schemas'
import { HelpdeskIntegrationOptions } from 'pages/standalone/types'
import { getWebhookRequiredFields } from 'pages/standalone/utils'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

interface HandoverConfigurationModalProps {
    isOpen: boolean
    onClose: () => void
    shopName: string
    shopType: string
    faqHelpcenters: HelpCenter[]
}

export const HandoverConfigurationDrawer: React.FC<
    HandoverConfigurationModalProps
> = ({ isOpen, onClose, shopName, shopType, faqHelpcenters }) => {
    const emailIntegrations = useAppSelector(
        getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES),
    )

    const { setFormValues, handleOnSave, formValues } =
        useStoreConfigurationForm(shopName, shopType, faqHelpcenters)

    const validBaseEmailIntegration = useMemo(() => {
        return emailIntegrations.find((integration) => {
            const integrationMeta = (integration as EmailIntegration).meta
            const verificationStatus =
                integrationMeta.outbound_verification_status?.domain

            return (
                isBaseEmailIntegration(integration) &&
                (integrationMeta.verified || verificationStatus === 'success')
            )
        })
    }, [emailIntegrations])

    const formMethods = useForm<HandoverFormValues>({
        values: {
            handoverMethod: formValues.handoverMethod || HandoverMethods.EMAIL,
            email: formValues.handoverEmail ?? '',
            emailIntegration:
                formValues.handoverEmailIntegrationId ?? undefined,
            baseEmailIntegration: validBaseEmailIntegration?.id ?? undefined,
            webhookIntegration:
                formValues.handoverHttpIntegrationId ?? undefined,
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

    const onUpdateSuccess = () => {
        onClose()
    }

    const updateStoreConfigurationAndSave = (integrationId: number | null) => {
        const updatedValues = {
            handoverMethod: handoverMethod,
            handoverEmail: email || null,
            handoverEmailIntegrationId: !!validBaseEmailIntegration
                ? validBaseEmailIntegration.id
                : (emailIntegration ?? null),
            handoverHttpIntegrationId: integrationId,
        }

        setFormValues((prevValues) => ({
            ...prevValues,
            ...updatedValues,
        }))

        handleOnSave({
            shopName,
            onSuccess: onUpdateSuccess,
            stepName: AiAgentOnboardingWizardStep.Personalize,
            payload: updatedValues,
        })
    }

    const onIntegrationCreateSuccess: (integrationId: number) => void = (
        integrationId,
    ) => {
        setValue('webhookIntegration', integrationId)
        updateStoreConfigurationAndSave(integrationId)
    }

    const { upsert, currentIntegrationType } = useStandaloneIntegrationUpsert(
        webhookIntegration ?? null,
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

    const onWebhookClick = (
        value: HelpdeskIntegrationOptions,
        context: SelectInputBoxContextState | null,
    ) => {
        setValue('webhookThirdParty', value)
        setValue('webhookRequiredFields', getWebhookRequiredFields(value))
        context?.onBlur()
    }

    const onSubmit = () => {
        if (handoverMethod === HandoverMethods.WEBHOOK) {
            upsert(webhookThirdParty || '')
            return
        }
        updateStoreConfigurationAndSave(formValues.handoverHttpIntegrationId)
    }

    return (
        <Drawer
            fullscreen={false}
            open={isOpen}
            onBackdropClick={onClose}
            isLoading={false}
        >
            <Drawer.Header>Handover method</Drawer.Header>
            <Drawer.Content>
                <div className={css.radioButtonContainer}>
                    <RadioButton
                        value={HandoverMethods.EMAIL}
                        caption={
                            'Conversations that need human intervention will be sent to this email address'
                        }
                        label="Email"
                        isSelected={handoverMethod === HandoverMethods.EMAIL}
                        onClick={() =>
                            setValue('handoverMethod', HandoverMethods.EMAIL)
                        }
                    />
                    {handoverMethod === HandoverMethods.EMAIL && (
                        <HandoverEmailFields
                            setValue={setValue}
                            selectableEmailIntegrations={
                                selectableEmailIntegrations
                            }
                            emailIntegration={emailIntegration}
                            email={email ?? ''}
                            errors={errors}
                            hideIntegrations={!!validBaseEmailIntegration}
                        />
                    )}
                    <RadioButton
                        value={HandoverMethods.GORGIAS}
                        caption="Conversations that need human intervention will be sent to handover tickets within Gorgias."
                        label="Gorgias"
                        isSelected={handoverMethod === HandoverMethods.GORGIAS}
                        onClick={() =>
                            setValue('handoverMethod', HandoverMethods.GORGIAS)
                        }
                    />
                    <RadioButton
                        value={HandoverMethods.WEBHOOK}
                        caption="Conversations that need human intervention will use this webhook to send handover conversations to the tool of your choice."
                        label={
                            <span className={css.labelWithBadge}>
                                <span>Webhook</span>
                                <Badge type="blue">Recommended</Badge>
                            </span>
                        }
                        isSelected={handoverMethod === HandoverMethods.WEBHOOK}
                        onClick={() =>
                            setValue('handoverMethod', HandoverMethods.WEBHOOK)
                        }
                    />
                    {handoverMethod === HandoverMethods.WEBHOOK && (
                        <HandoverWebhookFields
                            onClick={onWebhookClick}
                            webhookThirdParty={
                                webhookThirdParty as HelpdeskIntegrationOptions
                            }
                            errors={errors}
                            setValue={setValue}
                            selectedIntegration={
                                formValues.handoverHttpIntegrationId ??
                                undefined
                            }
                            webhookRequiredFields={webhookRequiredFields}
                            configuredThirdParty={currentIntegrationType}
                        />
                    )}
                </div>
            </Drawer.Content>
            <Drawer.Footer className={css.footer}>
                <Button type="submit" onClick={handleSubmit(onSubmit)}>
                    Save Changes
                </Button>
                <Button intent="secondary" onClick={onClose}>
                    Cancel
                </Button>
            </Drawer.Footer>
        </Drawer>
    )
}
