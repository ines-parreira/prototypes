import { useEffect, useMemo, useState } from 'react'

import { useAsyncFn, useDebouncedEffect, usePrevious } from '@repo/hooks'
import type { AxiosError, CancelToken } from 'axios'
import { isCancel } from 'axios'
import _isEmpty from 'lodash/isEmpty'
import _isEqual from 'lodash/isEqual'
import moment from 'moment-timezone'
import { Table } from 'reactstrap'

import type { CursorPaginationMeta } from '@gorgias/helpdesk-queries'

import PeriodPicker from 'domains/reporting/pages/common/PeriodPicker'
import SelectFilter from 'domains/reporting/pages/common/SelectFilter'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useCancellableRequest from 'hooks/useCancellableRequest'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { CursorDirection } from 'models/api/types'
import { fetchEvents } from 'models/event/resources'
import type { FetchEventsOptions } from 'models/event/types'
import { EventsDatetimeOperator, EventType } from 'models/event/types'
import Loader from 'pages/common/components/Loader/Loader'
import Navigation from 'pages/common/components/Navigation/Navigation'
import PageHeader from 'pages/common/components/PageHeader'
import { getHumanAgents } from 'state/agents/selectors'
import { auditLogEventsFetched } from 'state/entities/auditLogEvents/actions'
import { getAuditLogEvents } from 'state/entities/auditLogEvents/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { humanizeString } from 'utils'
import { getMoment } from 'utils/date'

import { DATETIME_LABEL_FORMAT } from './constants'
import UserAuditRow from './UserAuditRow'

import settings from '../settings.less'
import css from './style.less'

const _startOfToday = () => getMoment().startOf('day')
const _endOfToday = () => getMoment().endOf('day')
const _someDaysAgoStartOfDay = (days: number) =>
    _startOfToday().subtract(days - 1, 'days')

const eventTypeOptions = Object.values(EventType).map((auditEvent) => ({
    label: humanizeString(auditEvent),
    value: auditEvent,
}))

const UserAuditList = () => {
    const dispatch = useAppDispatch()
    const agents = useAppSelector(getHumanAgents)
    const auditLogEvents = useAppSelector(getAuditLogEvents)
    const datetimeLabelFormat = useGetDateAndTimeFormat(DATETIME_LABEL_FORMAT)

    const [meta, setMeta] = useState<CursorPaginationMeta | null>(null)
    const [startDatetime, setStartDatetime] = useState<string>(
        _startOfToday().format(),
    )
    const [endDatetime, setEndDatetime] = useState<string>(
        _endOfToday().format(),
    )
    const [userIds, setUserIds] = useState<Array<number>>([])
    const [types, setTypes] = useState<Array<EventType>>([])

    const fetchOptions: FetchEventsOptions = useMemo(() => {
        return {
            createdDatetime: {
                [EventsDatetimeOperator.GTE]: startDatetime,
                [EventsDatetimeOperator.LTE]: endDatetime,
            },
            userIds: userIds,
            types,
            limit: 30,
        }
    }, [startDatetime, endDatetime, userIds, types])

    const previousFetchOptions = usePrevious(fetchOptions)

    const createFetchUsersAudit =
        (cancelToken: CancelToken) => async (direction?: CursorDirection) => {
            const params = fetchOptions

            if (direction === CursorDirection.PrevCursor && meta?.prev_cursor) {
                params.cursor = meta.prev_cursor
            } else if (
                direction === CursorDirection.NextCursor &&
                meta?.next_cursor
            ) {
                params.cursor = meta.next_cursor
            }

            try {
                const res = await fetchEvents(params, { cancelToken })
                setMeta(res.data.meta)
                dispatch(auditLogEventsFetched(res.data.data))
            } catch (error) {
                if (isCancel(error)) {
                    return
                }
                const responseError = error as AxiosError<{
                    error?: { msg: string }
                }>
                await dispatch(
                    notify({
                        message:
                            responseError.response?.data.error?.msg ||
                            'Failed to fetch events.',
                        status: NotificationStatus.Error,
                    }),
                )
            }
        }

    const [cancellableFetchUsersAudit] = useCancellableRequest(
        createFetchUsersAudit,
    )

    const [{ loading: isLoading }, fetchUsersAudit] = useAsyncFn(
        cancellableFetchUsersAudit,
        [fetchOptions, meta],
    )

    const onApplyDatePicker = ({
        startDatetime,
        endDatetime,
    }: {
        startDatetime: string
        endDatetime: string
    }) => {
        setStartDatetime(startDatetime)
        setEndDatetime(endDatetime)
    }

    useEffect(() => {
        void fetchUsersAudit()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useDebouncedEffect(
        () => {
            if (!_isEqual(previousFetchOptions, fetchOptions)) {
                void fetchUsersAudit()
            }
        },
        [fetchOptions],
        1000,
    )

    return (
        <div className="full-width">
            <PageHeader title="Audit logs">
                <div className="d-flex flex-wrap float-right">
                    <SelectFilter
                        singular="team member"
                        onChange={setUserIds as any}
                        isMultiple={false}
                        value={userIds}
                    >
                        {agents.toArray().map((agent: Map<any, any>) => (
                            <SelectFilter.Item
                                key={agent.get('id')}
                                label={agent.get('name') || agent.get('email')}
                                value={agent.get('id')}
                            />
                        ))}
                    </SelectFilter>
                    <SelectFilter
                        plural="events"
                        singular="event"
                        onChange={setTypes as any}
                        value={types}
                    >
                        {eventTypeOptions.map((option) => (
                            <SelectFilter.Item
                                key={option.value}
                                label={option.label}
                                value={option.value}
                            />
                        ))}
                    </SelectFilter>
                    <PeriodPicker
                        startDatetime={moment(startDatetime)}
                        endDatetime={moment(endDatetime)}
                        initialSettings={{
                            linkedCalendars: false,
                            maxDate: _endOfToday(),
                            maxSpan: 7,
                            ranges: {
                                Today: [_startOfToday(), _endOfToday()],
                                'Last 3 days': [
                                    _someDaysAgoStartOfDay(3),
                                    _endOfToday(),
                                ],
                                'Last 7 days': [
                                    _someDaysAgoStartOfDay(7),
                                    _endOfToday(),
                                ],
                            },
                            timePicker: true,
                        }}
                        labelDateFormat={datetimeLabelFormat}
                        onChange={onApplyDatePicker}
                        formatMaxSpan={(maxSpan) =>
                            moment.duration({
                                days: maxSpan as number,
                                seconds: -1, // counting days start at 0 because for our needs 1 day selected is 23H59m59s
                            })
                        }
                    />
                </div>
            </PageHeader>
            <div className={settings.pageContainer}>
                <div className="manage-requests-description">
                    <p>
                        User audit logs display recent actions performed by
                        users in Gorgias.
                    </p>
                </div>
                {isLoading ? (
                    <Loader />
                ) : _isEmpty(auditLogEvents) ? (
                    <div>
                        There is no event recorded matching these filters.
                    </div>
                ) : (
                    <>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Team member</th>
                                    <th>Event</th>
                                    <th>Object</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogEvents.map((auditLogEvent) => {
                                    return (
                                        <UserAuditRow
                                            key={auditLogEvent.id}
                                            eventItem={auditLogEvent}
                                        />
                                    )
                                })}
                            </tbody>
                        </Table>
                        <Navigation
                            className={css.navigation}
                            hasNextItems={!!meta?.next_cursor}
                            hasPrevItems={!!meta?.prev_cursor}
                            fetchNextItems={() =>
                                fetchUsersAudit(CursorDirection.NextCursor)
                            }
                            fetchPrevItems={() =>
                                fetchUsersAudit(CursorDirection.PrevCursor)
                            }
                        />
                    </>
                )}
            </div>
        </div>
    )
}

export default UserAuditList
