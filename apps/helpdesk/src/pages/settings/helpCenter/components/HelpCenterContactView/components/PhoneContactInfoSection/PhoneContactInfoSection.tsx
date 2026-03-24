import type React from 'react'
import { useState } from 'react'

import classnames from 'classnames'
import parsePhoneNumber from 'libphonenumber-js'

import type { PhoneContactInfoDto } from 'models/helpCenter/types'
import TextArea from 'pages/common/forms/TextArea'
import ToggleInput from 'pages/common/forms/ToggleInput'
import { useHelpCenterTranslation } from 'pages/settings/helpCenter/providers/HelpCenterTranslation/HelpCenterTranslation'
import settingsCss from 'pages/settings/settings.less'

import { MAX_DESCRIPTION_LENGTH } from '../../constants'
import ContactCard from '../ContactCard'
import PhoneNumbersForm from './PhoneNumbersForm'

import helpCenterContactViewCss from '../../HelpCenterContactView.less'
import css from './PhoneContactInfoSection.less'

const PhoneContactInfoSection: React.FC = () => {
    const [isDescriptionTooLong, setIsDescriptionTooLong] = useState(false)
    const {
        translation: { contactInfo },
        updateTranslation,
    } = useHelpCenterTranslation()

    const { description, enabled, phone_numbers } = contactInfo.phone

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
        <section className={classnames(css.container, settingsCss.mb40)}>
            <div className={helpCenterContactViewCss.leftColumn}>
                <section className={settingsCss.mb40}>
                    <div className={css.heading}>
                        <div>
                            <h3>Phone</h3>
                            <p>
                                Provide phone numbers customers can call to get
                                phone support.
                            </p>
                        </div>
                    </div>
                </section>
                <ToggleInput
                    className={css.toggle}
                    isToggled={enabled}
                    onClick={handleChange('enabled')}
                >
                    Phone contact card
                </ToggleInput>
                <TextArea
                    label="Card description"
                    rows={1}
                    value={description}
                    onChange={(value: string) => {
                        if (value.length > MAX_DESCRIPTION_LENGTH) {
                            setIsDescriptionTooLong(true)
                            handleChange('description')(
                                value.substring(0, MAX_DESCRIPTION_LENGTH),
                            )
                            return
                        }
                        setIsDescriptionTooLong(false)

                        handleChange('description')(value)
                    }}
                    caption="This will appear in the phone number card"
                    isDisabled={!enabled}
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
                                phoneNumber.phone_number,
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
