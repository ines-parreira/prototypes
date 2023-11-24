import {useMemo} from 'react'

import {
    ETA_DATE,
    IN_TRANSIT_DATE,
    INFO_RECEIVED_DATE,
    ORDER_PLACED_DATE,
} from '../constants'

const useOrderDates = (locale: string) => {
    return useMemo(
        () => ({
            etaDate: ETA_DATE.clone().locale(locale),
            orderPlacedDate: ORDER_PLACED_DATE.clone().locale(locale),
            infoReceivedDate: INFO_RECEIVED_DATE.clone().locale(locale),
            inTransitDate: IN_TRANSIT_DATE.clone().locale(locale),
        }),
        [locale]
    )
}

export default useOrderDates
