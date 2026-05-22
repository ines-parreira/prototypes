import type { CountryCode } from 'libphonenumber-js'
import { Controller, useFormContext } from 'react-hook-form'

import { FlagIcon, ListItem, SelectField } from '@gorgias/axiom'

import { useAiJourneyPhoneList } from 'AIJourney/hooks'
import { getCountryFromPhoneNumber } from 'pages/phoneNumbers/utils'

type Props = {
    monitoredSmsIntegrations: number[]
}

type PhoneOption = {
    id: number
    label: string
    caption: string
    phoneNumber: string
    countryCode: CountryCode | undefined
}

export const SmsSenderSelect = ({ monitoredSmsIntegrations }: Props) => {
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
            name="sms_sender"
            control={control}
            render={({ field }) => {
                const currentOption: PhoneOption | null =
                    phoneOptions.find(
                        (phoneOption) =>
                            phoneOption.id ===
                            field.value?.sms_sender_integration_id,
                    ) ?? null

                return (
                    <SelectField
                        label="Send SMS from"
                        caption="Shoppers will see this as the sender."
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
                            field.onChange({
                                sms_sender_integration_id: option.id,
                                sms_sender_number: option.phoneNumber,
                            })
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
