import React from 'react'
import {SelectableOption} from 'pages/common/forms/SelectField/types'
import {AccountSettingBusinessHours} from 'state/currentAccount/types'

export const DEFAULT_BUSINESS_HOUR: AccountSettingBusinessHours['data']['business_hours'][number] =
    Object.freeze({
        days: '1,2,3,4,5',
        from_time: '09:00',
        to_time: '17:00',
    })

export const DAYS_OPTIONS: Readonly<SelectableOption[]> = Object.freeze([
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
    {label: <i>Weekend</i>, text: 'Weekend', value: '6,7'},
    {label: 'Monday', value: '1'},
    {label: 'Tuesday', value: '2'},
    {label: 'Wednesday', value: '3'},
    {label: 'Thursday', value: '4'},
    {label: 'Friday', value: '5'},
    {label: 'Saturday', value: '6'},
    {label: 'Sunday', value: '7'},
])

export const MAX_BUSINESS_HOURS = 20
