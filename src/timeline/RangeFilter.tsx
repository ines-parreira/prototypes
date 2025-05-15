import moment from 'moment'

import { DateAndTimeFormatting } from 'constants/datetime'
import useAppSelector from 'hooks/useAppSelector'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import DatePicker from 'pages/common/forms/DatePicker'
import FilterName from 'pages/common/forms/FilterInput/FilterName'
import FilterValue from 'pages/common/forms/FilterInput/FilterValue'
import { getTimezone } from 'state/currentUser/selectors'

import { END_OF_TODAY_DATE, MIN_RANGE_DATE } from './constants'
import { getRangeLabel } from './helpers/rangeFilter'
import { Range } from './types'

import css from './RangeFilter.less'

type Props = {
    range: Range
    setRangeFilter: (range: Range) => void
}

// beware as moment mutates dates in place
const getStartOfTodayMoment = () => moment().startOf('day')
const getEndOfTodayMoment = () => moment(END_OF_TODAY_DATE)

export const ranges: Record<string, [Date, Date]> = {
    'All time': [MIN_RANGE_DATE, END_OF_TODAY_DATE],
    Today: [getStartOfTodayMoment().toDate(), END_OF_TODAY_DATE],
    Yesterday: [
        getStartOfTodayMoment().subtract(1, 'days').toDate(),
        getEndOfTodayMoment().subtract(1, 'days').toDate(),
    ],
    'Past 7 days': [
        getStartOfTodayMoment().subtract(7, 'days').toDate(),
        END_OF_TODAY_DATE,
    ],
    'Past 30 days': [
        getStartOfTodayMoment().subtract(30, 'days').toDate(),
        END_OF_TODAY_DATE,
    ],
    'This year': [moment().startOf('year').toDate(), END_OF_TODAY_DATE],
    'Last 365 days': [
        getStartOfTodayMoment().subtract(365, 'days').toDate(),
        END_OF_TODAY_DATE,
    ],
}

export function RangeFilter({ range, setRangeFilter }: Props) {
    const timezone = useAppSelector(getTimezone)
    const rangeLabel = getRangeLabel(
        range,
        useGetDateAndTimeFormat(DateAndTimeFormatting.ShortDateWithYear),
    )

    const onSubmit = (rangeStart: moment.Moment, rangeEnd: moment.Moment) => {
        const startDate = rangeStart.startOf('day').toDate()
        const endDate = rangeEnd.endOf('day').toDate()
        if (
            startDate.valueOf() === MIN_RANGE_DATE.valueOf() &&
            endDate.valueOf() === END_OF_TODAY_DATE.valueOf()
        ) {
            return setRangeFilter({ start: null, end: null })
        }
        setRangeFilter({
            start: startDate.valueOf(),
            end: endDate.valueOf(),
        })
    }

    return (
        <div className={css.rangeFilter}>
            <FilterName name="date" />
            <DatePicker
                initialSettings={{
                    startDate: range.start
                        ? new Date(range.start)
                        : MIN_RANGE_DATE,
                    endDate: range.end
                        ? new Date(range.end)
                        : END_OF_TODAY_DATE,
                    minDate: MIN_RANGE_DATE,
                    maxDate: END_OF_TODAY_DATE,
                    opens: 'right',
                    ranges: ranges,
                    linkedCalendars: false,
                    timePicker: false,
                    singleDatePicker: false,
                    showDropdowns: true,
                }}
                userTimezone={timezone}
                onSubmit={onSubmit}
                onClear={() => {
                    setRangeFilter({ start: null, end: null })
                }}
                rangeDatesInFooter
                showRangesLabel
            >
                <FilterValue
                    optionsLabels={[rangeLabel]}
                    onClick={() => {}}
                    placeholder="All time"
                />
            </DatePicker>
        </div>
    )
}
