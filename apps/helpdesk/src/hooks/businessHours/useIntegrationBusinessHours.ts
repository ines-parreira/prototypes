import {
    useGetBusinessHoursDetails,
    useListAccountSettings,
} from '@gorgias/helpdesk-queries'
import { BusinessHoursConfig } from '@gorgias/helpdesk-types'

export const useIntegrationBusinessHours = (
    businessHoursId?: number | null,
) => {
    const { data: businessHours } = useGetBusinessHoursDetails(
        businessHoursId ?? 0,
        {
            query: {
                enabled: !!businessHoursId,
                refetchOnWindowFocus: false,
            },
        },
    )

    const { data: defaultBusinessHours } = useListAccountSettings(
        {
            type: 'business-hours',
        },
        {
            query: {
                enabled: !businessHoursId,
                refetchOnWindowFocus: false,
            },
        },
    )
    const defaultBusinessHoursConfig = defaultBusinessHours?.data.data?.[0]
        .data as BusinessHoursConfig | undefined

    return {
        businessHours: businessHoursId
            ? businessHours?.data?.business_hours_config
            : defaultBusinessHoursConfig,
        name: businessHoursId ? businessHours?.data?.name : 'Default',
    }
}
