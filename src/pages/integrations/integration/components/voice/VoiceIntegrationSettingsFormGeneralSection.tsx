import { useFormContext } from 'react-hook-form'
import { Link } from 'react-router-dom'

import {
    PhoneIntegration,
    UpdateAllPhoneIntegrationSettings,
} from '@gorgias/helpdesk-queries'
import { Label } from '@gorgias/merchant-ui-kit'

import { FormField } from 'core/forms'
import useAppSelector from 'hooks/useAppSelector'
import EmojiTextInput from 'pages/common/forms/EmojiTextInput/EmojiTextInput'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import { getNewPhoneNumber } from 'state/entities/phoneNumbers/selectors'

import css from './VoiceIntegrationSettingsFormGeneralSection.less'

type Props = {
    integration: PhoneIntegration
}

function VoiceIntegrationSettingsFormGeneralSection({
    integration,
}: Props): JSX.Element {
    const methods = useFormContext<
        UpdateAllPhoneIntegrationSettings | PhoneIntegration
    >()
    const { setValue, watch } = methods

    const emoji = watch('meta.emoji')
    const phoneNumberId = integration.meta.phone_number_id ?? 0
    const phoneNumber = useAppSelector(getNewPhoneNumber(phoneNumberId))

    return (
        <>
            <div>
                <Label className={css.label} isRequired>
                    Integration name
                </Label>
                <FormField
                    name="name"
                    id="name"
                    field={EmojiTextInput}
                    emoji={emoji ?? null}
                    placeholder="Ex: Company Support Line"
                    isRequired
                    onEmojiChange={(emoji: string | null) =>
                        setValue('meta.emoji', emoji, {
                            shouldDirty: true,
                        })
                    }
                />
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
                    {phoneNumber && (
                        <PhoneNumberInput
                            value={phoneNumber.phone_number_friendly}
                            disabled={true}
                        />
                    )}
                </div>
            </div>
        </>
    )
}

export default VoiceIntegrationSettingsFormGeneralSection
