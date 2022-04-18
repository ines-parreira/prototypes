import React, {useState} from 'react'

import {EmailContactInfoDto} from 'models/helpCenter/types'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {useHelpCenterTranslation} from 'pages/settings/helpCenter/providers/HelpCenterTranslation'
import InputField from 'pages/common/forms/input/InputField'
import TextArea from 'pages/common/forms/TextArea'

import settingsCss from 'pages/settings/settings.less'

import ContactCard from '../ContactCard'
import helpCenterContactViewCss from '../../HelpCenterContactView.less'

import css from './EmailContactInfoSection.less'

export const MAX_DESCRIPTION_LENGTH = 300

const EmailContactInfoSection: React.FC = () => {
    const [isDescriptionTooLong, setIsDescriptionTooLong] = useState(false)
    const {
        translation: {contactInfo},
        updateTranslation,
    } = useHelpCenterTranslation()

    const {description, email, enabled} = contactInfo.email

    const handleChange = (key: keyof EmailContactInfoDto) => (value: any) => {
        updateTranslation({
            contactInfo: {
                ...contactInfo,
                email: {
                    ...contactInfo.email,
                    [key]: value,
                },
            },
        })
    }

    return (
        <section className={css.container}>
            <div className={helpCenterContactViewCss.leftColumn}>
                <ToggleInput
                    className={css.toggleInput}
                    isToggled={enabled}
                    onClick={handleChange('enabled')}
                    aria-label="Enable email contact card"
                >
                    Email card
                </ToggleInput>
                <TextArea
                    label="Description text"
                    className={settingsCss.mb16}
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
                    caption="This will appear in the email card"
                    isDisabled={!enabled}
                    error={
                        isDescriptionTooLong
                            ? `Description should be no longer than ${MAX_DESCRIPTION_LENGTH} characters`
                            : undefined
                    }
                >
                    {description}
                </TextArea>
                <InputField
                    type="email"
                    label="Email"
                    className={settingsCss.mb16}
                    value={email}
                    onChange={handleChange('email')}
                    caption="This will appear in the email card"
                    isDisabled={!enabled}
                />
            </div>
            <ContactCard
                icon="email"
                title="Email"
                helpText="Email card preview"
                disabled={!enabled}
                className={css.card}
            >
                <div>{description}</div>
                <div>{email}</div>
            </ContactCard>
        </section>
    )
}

export default EmailContactInfoSection
