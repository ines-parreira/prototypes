import type { CountryCode } from 'libphonenumber-js'
import { Controller, useFormContext } from 'react-hook-form'

import { FlagIcon, ListItem, SelectField } from '@gorgias/axiom'

import { useAiJourneyPhoneList } from 'AIJourney/hooks'
import { getCountryFromPhoneNumber } from 'pages/phoneNumbers/utils'

type PhoneOption = {
    id: number
    label: string
    caption: string
    phoneNumber: string
    countryCode: CountryCode | undefined
}

type GetSelectedIntegrationId = (
    fieldValue: unknown,
) => number | null | undefined

type MapOptionToFieldValue = (option: PhoneOption) => unknown

type Props = {
    monitoredSmsIntegrations: number[]
    name?: string
    label?: string
    caption?: string
    isRequired?: boolean
    getSelectedIntegrationId?: GetSelectedIntegrationId
    mapOptionToFieldValue?: MapOptionToFieldValue
}

const defaultGetSelectedIntegrationId: GetSelectedIntegrationId = (
    fieldValue,
) =>
    (fieldValue as { sms_sender_integration_id?: number | null } | null)
        ?.sms_sender_integration_id

const defaultMapOptionToFieldValue: MapOptionToFieldValue = (option) => ({
    sms_sender_integration_id: option.id,
    sms_sender_number: option.phoneNumber,
})

export const SmsSenderSelect = ({
    monitoredSmsIntegrations,
    name = 'sms_sender',
    label = 'Send SMS from',
    caption = 'Shoppers will see this as the sender.',
    isRequired = false,
    getSelectedIntegrationId = defaultGetSelectedIntegrationId,
    mapOptionToFieldValue = defaultMapOptionToFieldValue,
}: Props) => {
    const { control } = useFormContext()
    const { marketingCapabilityPhoneNumbers } = useAiJourneyPhoneList(
        monitoredSmsIntegrations,
    )

    const phoneOptions: PhoneOption[] = marketingCapabilityPhoneNumbers.map(
        (phone) => {
            const smsIntegration = phone.integrations.find(
                (phoneIntegration) => phoneIntegration.type === 'sms',
            )
            return {
                id: smsIntegration!.id,
                label: phone.name,
                caption: phone.phone_number_friendly,
                phoneNumber: phone.phone_number,
                countryCode: getCountryFromPhoneNumber(phone.phone_number),
            }
        },
    )

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => {
                const selectedIntegrationId = getSelectedIntegrationId(
                    field.value,
                )
                const currentOption: PhoneOption | null =
                    phoneOptions.find(
                        (phoneOption) =>
                            phoneOption.id === selectedIntegrationId,
                    ) ?? null

                return (
                    <SelectField
                        isRequired={isRequired}
                        label={label}
                        caption={caption}
                        placeholder="Select phone number"
                        items={phoneOptions}
                        // Pass null (not undefined) so the underlying field stays
                        // controlled before phoneOptions resolve a match.
                        value={currentOption as PhoneOption | undefined}
                        leadingSlot={
                            currentOption?.countryCode ? (
                                <FlagIcon code={currentOption.countryCode} />
                            ) : undefined
                        }
                        onChange={(option: PhoneOption) => {
                            field.onChange(mapOptionToFieldValue(option))
                        }}
                    >
                        {(option: PhoneOption) => (
                            <ListItem
                                key={`phone-number-option-${option.id}`}
                                id={option.id}
                                label={option.label}
                                caption={option.caption}
                                leadingSlot={
                                    option.countryCode ? (
                                        <FlagIcon code={option.countryCode} />
                                    ) : undefined
                                }
                            />
                        )}
                    </SelectField>
                )
            }}
        />
    )
}
