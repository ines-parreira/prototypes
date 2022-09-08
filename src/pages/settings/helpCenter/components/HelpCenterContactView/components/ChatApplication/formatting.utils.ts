import moment from 'moment'
import {localeTimeFormatConfigs} from '../../../../../../../config/locales'
import {LanguageTimeFormat} from '../../../../../../../constants/languages'
import {HelpCenterState} from '../../../../../../../state/ui/helpCenter'

export const getTimezoneAbbreviation = (timezone: string) => {
    return moment().tz(timezone).format('z')
}

export const convertDaysToName = (daysString: string) => {
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

export const formatBusinessHoursByLocale = (
    time: string,
    helpCenterLanguage: HelpCenterState['currentLanguage']
) => {
    const momentTime = moment(time, 'HH:mm')

    if (!helpCenterLanguage) {
        return momentTime.format('hh:mm A')
    }
    const timeFormatValue = localeTimeFormatConfigs[helpCenterLanguage]

    if (timeFormatValue === LanguageTimeFormat.twentyFourHours) {
        return momentTime.format('HH:mm')
    }

    return momentTime.format('hh:mm A')
}
