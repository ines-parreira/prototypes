import React from 'react'

import {EmailContactInfoDto} from 'models/helpCenter/types'
import InputField from 'pages/common/forms/InputField'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {useHelpCenterTranslation} from 'pages/settings/helpCenter/providers/HelpCenterTranslation'
import ContactCard from '../ContactCard'

import css from './EmailContactInfoSection.less'

const EmailContactInfoSection: React.FC = () => {
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
            <ToggleInput
                className={css.toggleInput}
                isToggled={enabled}
                onClick={handleChange('enabled')}
                aria-label="Enable email contact card"
            />
            <InputField
                type="textarea"
                label="Description text"
                value={description}
                onChange={handleChange('description')}
                help="This will appear in the email card"
                disabled={!enabled}
            />
            <InputField
                type="email"
                label="Email"
                value={email}
                onChange={handleChange('email')}
                help="This will appear in the email card"
                disabled={!enabled}
            />
            <ContactCard
                icon="email"
                title="Email"
                helpText="Email card preview"
                disabled={!enabled}
                className={css.card}
            >
                {description}
            </ContactCard>
        </section>
    )
}

export default EmailContactInfoSection
