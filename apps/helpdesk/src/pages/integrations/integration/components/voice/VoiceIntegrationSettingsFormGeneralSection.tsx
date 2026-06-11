import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { FormField } from '@repo/forms'
import { useFormContext } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { LegacyLabel as Label } from '@gorgias/axiom'
import type {
    PhoneIntegration,
    UpdateAllPhoneIntegrationSettings,
} from '@gorgias/helpdesk-queries'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import EmojiTextInput from 'pages/common/forms/EmojiTextInput/EmojiTextInput'
import PhoneNumberSelectField from 'pages/phoneNumbers/PhoneNumberSelectField'
import BusinessHoursSelectField from 'pages/settings/businessHours/BusinessHoursSelectField'
import {
    getNewPhoneNumbers,
    getPhoneNumber,
} from 'state/entities/phoneNumbers/selectors'

import css from './VoiceIntegrationSettingsFormGeneralSection.less'

type Props = {
    integration: PhoneIntegration
}

function VoiceIntegrationSettingsFormGeneralSection({
    integration,
}: Props): JSX.Element {
    const isCBHEnabled = useFlag(FeatureFlagKey.CustomBusinessHours)

    const methods = useFormContext<
        UpdateAllPhoneIntegrationSettings | PhoneIntegration
    >()
    const { setValue, watch } = methods

    const emoji = watch('meta.emoji')
    const initialPhoneNumberId = integration.meta.phone_number_id ?? 0
    const initialPhoneNumber = useAppSelector(
        getPhoneNumber(initialPhoneNumberId),
    )
    const phoneNumbers = useAppSelector(getNewPhoneNumbers)

    return (
        <>
            <div>
                <Label className={css.label} isRequired>
                    Integration name
                </Label>
                <FormField name="name" isRequired>
                    {(field) => (
                        <EmojiTextInput
                            {...field}
                            id="name"
                            emoji={emoji ?? null}
                            placeholder="Ex: Company Support Line"
                            onEmojiChange={(emoji: string | null) =>
                                setValue('meta.emoji', emoji, {
                                    shouldDirty: true,
                                })
                            }
                        />
                    )}
                </FormField>
            </div>
            <div>
                <div className={css.phoneNumberHeader}>
                    <Label className={css.label}>Phone number</Label>
                    <Link
                        to={`/app/settings/phone-numbers/${integration.meta.phone_number_id}`}
                    >
                        Manage Phone Number
                    </Link>
                </div>

                <div className={css.appRow}>
                    <FormField name={'meta.phone_number_id'} isRequired>
                        {(field) => (
                            <PhoneNumberSelectField
                                {...field}
                                integrationType={IntegrationType.Phone}
                                value={
                                    field.value
                                        ? phoneNumbers[field.value]
                                        : null
                                }
                                onChange={(phoneNumber) =>
                                    field.onChange(phoneNumber?.id)
                                }
                                initialValue={initialPhoneNumber}
                            />
                        )}
                    </FormField>
                </div>
            </div>
            {isCBHEnabled && (
                <FormField name="business_hours_id" isRequired>
                    {(field) => <BusinessHoursSelectField {...field} />}
                </FormField>
            )}
        </>
    )
}

export default VoiceIntegrationSettingsFormGeneralSection
