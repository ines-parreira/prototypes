import type { SelectableOption } from 'pages/common/forms/SelectField/types'
import type { AccountSettingBusinessHours } from 'state/currentAccount/types'

export const BUSINESS_HOURS_BASE_URL = '/app/settings/business-hours'

export const DEFAULT_BUSINESS_HOUR: AccountSettingBusinessHours['data']['business_hours'][number] =
    Object.freeze({
        days: '1,2,3,4,5',
        from_time: '09:00',
        to_time: '17:00',
    })

export const DEPRECATED_DAYS_OPTIONS: SelectableOption[] = [
    {
        label: <i>Everyday</i>,
        text: 'Everyday',
        value: '1,2,3,4,5,6,7',
    },
    {
        label: <i>Weekdays</i>,
        text: 'Weekdays',
        value: '1,2,3,4,5',
    },
    { label: <i>Weekend</i>, text: 'Weekend', value: '6,7' },
    { label: 'Monday', value: '1' },
    { label: 'Tuesday', value: '2' },
    { label: 'Wednesday', value: '3' },
    { label: 'Thursday', value: '4' },
    { label: 'Friday', value: '5' },
    { label: 'Saturday', value: '6' },
    { label: 'Sunday', value: '7' },
]

export const EVERYDAY_OPTION_VALUE = '1,2,3,4,5,6,7'
export const ALWAYS_ON_OPTION_LABEL = '24/7 (always on)'
export const EVERYDAY_OPTION_LABEL = 'Everyday'

export const DAYS_OPTIONS_WITHOUT_ALWAYS_ON = [
    {
        label: EVERYDAY_OPTION_LABEL,
        value: EVERYDAY_OPTION_VALUE,
    },
    {
        label: 'Mon-Fri',
        value: '1,2,3,4,5',
    },
    { label: 'Weekend', value: '6,7' },
    { label: 'Monday', value: '1' },
    { label: 'Tuesday', value: '2' },
    { label: 'Wednesday', value: '3' },
    { label: 'Thursday', value: '4' },
    { label: 'Friday', value: '5' },
    { label: 'Saturday', value: '6' },
    { label: 'Sunday', value: '7' },
]

export const DAYS_OPTIONS = [
    {
        label: ALWAYS_ON_OPTION_LABEL,
        value: EVERYDAY_OPTION_VALUE,
    },
    ...DAYS_OPTIONS_WITHOUT_ALWAYS_ON,
]

export const MAX_BUSINESS_HOURS = 20

export const DEFAULT_BUSINESS_HOURS_SCHEDULE = {
    days: DAYS_OPTIONS_WITHOUT_ALWAYS_ON[0].value,
    from_time: '00:00',
    to_time: '23:59',
}
