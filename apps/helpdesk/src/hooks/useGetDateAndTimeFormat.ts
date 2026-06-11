import type { DateAndTimeFormatting } from '@repo/utils'

import { useAppSelector } from 'hooks/useAppSelector'
import { getDateAndTimeFormatter } from 'state/currentUser/selectors'

export function useGetDateAndTimeFormat(formatType: DateAndTimeFormatting) {
    return useAppSelector(getDateAndTimeFormatter)(formatType)
}
