import React from 'react'
import parsePhoneNumber from 'libphonenumber-js'

import {PhoneContactInfoDto} from '../../../../../../../models/helpCenter/types'
import InputField from '../../../../../../common/forms/InputField'
import ToggleField from '../../../../../../common/forms/ToggleField'
import {useHelpCenterTranslation} from '../../../../providers/HelpCenterTranslation'
import ContactCard from '../ContactCard'

import PhoneNumbersForm from './PhoneNumbersForm'
import css from './PhoneContactInfoSection.less'

const PhoneContactInfoSection: React.FC = () => {
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
            <ToggleField
                label="Phone number card"
                value={enabled}
                onChange={handleChange('enabled')}
            />
            <InputField
                type="textarea"
                label="Description text"
                value={description}
                onChange={handleChange('description')}
                help="This will appear in the phone number card"
                disabled={!enabled}
            />
            <PhoneNumbersForm
                phoneNumbers={phone_numbers}
                onChange={handleChange('phone_numbers')}
                disabled={!enabled}
            />
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
