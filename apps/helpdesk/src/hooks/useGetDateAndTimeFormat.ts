import type { DateAndTimeFormatting } from 'constants/datetime'
import useAppSelector from 'hooks/useAppSelector'
import { getDateAndTimeFormatter } from 'state/currentUser/selectors'

export default function useGetDateAndTimeFormat(
    formatType: DateAndTimeFormatting,
) {
    return useAppSelector(getDateAndTimeFormatter)(formatType)
}
