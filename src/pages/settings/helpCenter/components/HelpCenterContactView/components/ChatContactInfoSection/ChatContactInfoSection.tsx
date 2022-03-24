import React, {useState} from 'react'
import moment from 'moment'
import {Link} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {ChatContactInfoDto} from 'models/helpCenter/types'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {useHelpCenterTranslation} from 'pages/settings/helpCenter/providers/HelpCenterTranslation'
import {getBusinessHoursSettings} from 'state/currentAccount/selectors'
import helpCenterContactViewCss from '../../HelpCenterContactView.less'
import ContactCard from '../ContactCard'
import {MAX_DESCRIPTION_LENGTH} from '../EmailContactInfoSection/EmailContactInfoSection'

import ChatCardAvatars from './ChatCardAvatars'
import css from './ChatContactInfoSection.less'

const getTimezoneAbbreviation = (timezone: string) => {
    return moment().tz(timezone).format('z')
}

const convertDaysToName = (daysString: string) => {
    const days = daysString.split(',')

    if (days.length === 1) {
        return moment().day(Number(days[0])).format('dddd')
    }

    const from = moment().day(Number(days[0])).format('dddd')
    const to = moment()
        .day(Number(days[days.length - 1]))
        .format('dddd')

    return `${from} - ${to}`
}

const ChatContactInfoSection: React.FC = () => {
    const [isDescriptionTooLong, setIsDescriptionTooLong] = useState(false)
    const {
        translation: {chatApplicationId, contactInfo},
        updateTranslation,
    } = useHelpCenterTranslation()
    const businessHours = useAppSelector(getBusinessHoursSettings)

    const {description, enabled} = contactInfo.chat

    if (!chatApplicationId) {
        return null
    }

    const handleChange = (key: keyof ChatContactInfoDto) => (value: any) => {
        updateTranslation({
            contactInfo: {
                ...contactInfo,
                chat: {
                    ...contactInfo.chat,
                    [key]: value,
                },
            },
        })
    }
    const renderBusinessHours = () => {
        if (!businessHours) return null

        const {business_hours, timezone} = businessHours.data
        const timezoneAbbreviation = getTimezoneAbbreviation(timezone)

        return business_hours.map(({days, from_time, to_time}) => (
            <span key={days}>
                <b>{convertDaysToName(days)}</b>&nbsp;
                {moment(from_time, 'HH:mm').format('LT')} -&nbsp;
                {moment(to_time, 'HH:mm').format('LT')}&nbsp;
                {timezoneAbbreviation}
            </span>
        ))
    }

    return (
        <section className={css.container}>
            <div className={helpCenterContactViewCss.leftColumn}>
                <ToggleInput
                    className={css.toggleInput}
                    isToggled={enabled}
                    onClick={handleChange('enabled')}
                    aria-label="Enable chat contact card"
                >
                    Chat card
                </ToggleInput>
                <p>
                    This card will be shown in the helpcenter home page and
                    display the same availability defined in your&nbsp;
                    <Link to="/app/settings/business-hours">
                        Business Hours configuration
                    </Link>
                    .
                </p>
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
                    help="This will appear in the chat card"
                    disabled={!enabled}
                    error={
                        isDescriptionTooLong
                            ? `Description should be no longer than ${MAX_DESCRIPTION_LENGTH} characters`
                            : undefined
                    }
                />
            </div>
            <ContactCard
                icon="forum"
                title="Chat"
                helpText="Chat card preview"
                disabled={!enabled}
                className={css.card}
            >
                <div className={css.content}>
                    <ChatCardAvatars />
                    {description}
                    {renderBusinessHours()}
                </div>
            </ContactCard>
        </section>
    )
}

export default ChatContactInfoSection
