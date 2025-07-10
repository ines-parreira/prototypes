import { BusinessHoursList } from '@gorgias/helpdesk-types'

import { IntegrationType } from 'models/integration/constants'
import { SelectableOption } from 'pages/common/forms/SelectField/types'
import { AccountSettingBusinessHours } from 'state/currentAccount/types'

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

export const DAYS_OPTIONS = [
    {
        label: 'Everyday',
        value: '1,2,3,4,5,6,7',
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

export const MAX_BUSINESS_HOURS = 20

export const DEFAULT_BUSINESS_HOURS_SCHEDULE = {
    days: DAYS_OPTIONS[0].value,
    from_time: '00:00',
    to_time: '23:59',
}

export const mockedBusinessHours: BusinessHoursList = {
    id: 1,
    name: 'US - Product support',
    business_hours_config: {
        business_hours: [
            {
                days: '1,2,3,4,5',
                from_time: '10:00',
                to_time: '18:00',
            },
            {
                days: '6,7',
                from_time: '11:00',
                to_time: '19:00',
            },
        ],
        timezone: 'US/Central',
    },
    created_datetime: '2021-01-01T00:00:00Z',
    integration_count: 1,
    updated_datetime: '2021-01-01T00:00:00Z',
    first_integration: {
        integration_id: 1,
        integration_name: 'Customer service',
        integration_type: IntegrationType.Phone,
        store: {
            store_id: 1,
            store_name: 'US - Sales',
            store_type: IntegrationType.Shopify,
        },
    },
}
