import React, {useState} from 'react'
import parsePhoneNumber from 'libphonenumber-js'

import {PhoneContactInfoDto} from 'models/helpCenter/types'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {useHelpCenterTranslation} from 'pages/settings/helpCenter/providers/HelpCenterTranslation'
import ContactCard from '../ContactCard'

import helpCenterContactViewCss from '../../HelpCenterContactView.less'
import {MAX_DESCRIPTION_LENGTH} from '../EmailContactInfoSection/EmailContactInfoSection'
import PhoneNumbersForm from './PhoneNumbersForm'
import css from './PhoneContactInfoSection.less'

const PhoneContactInfoSection: React.FC = () => {
    const [isDescriptionTooLong, setIsDescriptionTooLong] = useState(false)
    const {
        translation: {contactInfo},
        updateTranslation,
    } = useHelpCenterTranslation()

    const {description, enabled, phone_numbers} = contactInfo.phone

    const handleChange = (key: keyof PhoneContactInfoDto) => (value: any) => {
        updateTranslation({
            contactInfo: {
                ...contactInfo,
                phone: {
                    ...contactInfo.phone,
                    [key]: value,
                },
            },
        })
    }

    return (
        <section className={css.container}>
            <div className={helpCenterContactViewCss.leftColumn}>
                <ToggleInput
                    className={css.toggle}
                    isToggled={enabled}
                    onClick={handleChange('enabled')}
                >
                    Phone number card
                </ToggleInput>
                <DEPRECATED_InputField
                    type="textarea"
                    label="Description text"
                    value={description}
                    onChange={(value: string) => {
                        if (value.length > MAX_DESCRIPTION_LENGTH) {
                            setIsDescriptionTooLong(true)
                            handleChange('description')(
                                value.substring(0, MAX_DESCRIPTION_LENGTH)
                            )
                            return
                        }
                        setIsDescriptionTooLong(false)

                        handleChange('description')(value)
                    }}
                    help="This will appear in the phone number card"
                    disabled={!enabled}
                    error={
                        isDescriptionTooLong
                            ? `Description should be no longer than ${MAX_DESCRIPTION_LENGTH} characters`
                            : undefined
                    }
                />
                <PhoneNumbersForm
                    phoneNumbers={phone_numbers}
                    onChange={handleChange('phone_numbers')}
                    disabled={!enabled}
                />
            </div>
            <ContactCard
                icon="phone"
                title="Call"
                helpText="Phone number card preview"
                disabled={!enabled}
                className={css.card}
                clickable={false}
            >
                <div className={css.content}>
                    {description}
                    {phone_numbers.map((phoneNumber, index) => (
                        <div className={css.cardPhoneNumber} key={index}>
                            {phoneNumber.reference.length
                                ? `${phoneNumber.reference}:`
                                : ''}
                            &nbsp;
                            {parsePhoneNumber(
                                phoneNumber.phone_number
                            )?.formatInternational() ||
                                phoneNumber.phone_number}
                        </div>
                    ))}
                </div>
            </ContactCard>
        </section>
    )
}

export default PhoneContactInfoSection
