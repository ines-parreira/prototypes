import useAppSelector from 'hooks/useAppSelector'

import {getDateAndTimeFormatter} from 'state/currentUser/selectors'
import {DateAndTimeFormatting} from 'constants/datetime'

export default function useGetDateAndTimeFormat(
    formatType: DateAndTimeFormatting
) {
    return useAppSelector(getDateAndTimeFormatter)(formatType)
}
