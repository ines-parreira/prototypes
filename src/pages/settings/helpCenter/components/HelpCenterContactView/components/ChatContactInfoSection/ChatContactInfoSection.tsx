import React from 'react'
import moment from 'moment'
import {useSelector} from 'react-redux'
import {Link} from 'react-router-dom'

import {ChatContactInfoDto} from '../../../../../../../models/helpCenter/types'
import {getBusinessHoursSettings} from '../../../../../../../state/currentAccount/selectors'
import InputField from '../../../../../../common/forms/InputField'
import ToggleField from '../../../../../../common/forms/ToggleField'
import {useHelpCenterTranslation} from '../../../../providers/HelpCenterTranslation'
import ContactCard from '../ContactCard'

import ChatCardAvatars from './ChatCardAvatars'
import css from './ChatContactInfoSection.less'

const getTimezoneAbbreviation = (timezone: string) => {
    return moment().tz(timezone).format('z')
}

const convertDaysToName = (days: string) => {
    if (days === '1,2,3,4,5,6,7') {
        const monday = moment().day(1)
        const sunday = moment().day(7)

        return `${monday.format('dddd')} - ${sunday.format('dddd')}`
    }

    if (days === '1,2,3,4,5') {
        const monday = moment().day(1)
        const friday = moment().day(5)

        return `${monday.format('dddd')} - ${friday.format('dddd')}`
    }

    if (days === '6,7') {
        const saturday = moment().day(6)
        const sunday = moment().day(7)

        return `${saturday.format('dddd')} - ${sunday.format('dddd')}`
    }

    return moment().day(Number(days)).format('dddd')
}

const ChatContactInfoSection: React.FC = () => {
    const {
        translation: {chatApplicationId, contactInfo},
        updateTranslation,
    } = useHelpCenterTranslation()
    const businessHours = useSelector(getBusinessHoursSettings)

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
            <ToggleField
                label="Chat card"
                value={enabled}
                onChange={handleChange('enabled')}
            />
            <p>
                This card will be shown in the helpcenter home page and display
                the same availability defined in your&nbsp;
                <Link to="/app/settings/business-hours">
                    Business Hours configuration
                </Link>
                .
            </p>
            <InputField
                type="textarea"
                label="Description text"
                value={description}
                onChange={handleChange('description')}
                help="This will appear in the chat card"
                disabled={!enabled}
            />
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
