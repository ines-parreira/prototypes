import React, {useEffect, useMemo, useState} from 'react'
import {Container, Table} from 'reactstrap'
import _isEmpty from 'lodash/isEmpty'
import moment from 'moment-timezone'
import axios, {AxiosError, CancelToken} from 'axios'
import {useAsyncFn, useDebounce, usePrevious} from 'react-use'
import _isEqual from 'lodash/isEqual'

import {auditLogEventsFetched} from 'state/entities/auditLogEvents/actions'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import {getAgents} from 'state/agents/selectors'
import {RootState} from 'state/types'
import {
    EventType,
    EventsDatetimeOperator,
    FetchEventsOptions,
} from 'models/event/types'
import {CursorMeta} from 'models/api/types'
import {fetchEvents} from 'models/event/resources'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import PeriodPicker from 'pages/stats/common/PeriodPicker'
import SelectFilter from 'pages/stats/common/SelectFilter'
import Navigation from 'pages/common/components/Navigation/Navigation'
import useCancellableRequest from 'hooks/useCancellableRequest'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getMoment} from 'utils/date'
import {humanizeString} from 'utils'

import css from '../settings.less'

import {DATETIME_LABEL_FORMAT, EventNavDirection} from './constants'
import UserAuditRow from './UserAuditRow'

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
    const agents = useAppSelector(getAgents)
    const auditLogEvents = useAppSelector((state: RootState) =>
        Object.values(state.entities.auditLogEvents)
    )

    const [meta, setMeta] = useState<CursorMeta | null>(null)
    const [startDatetime, setStartDatetime] = useState<string>(
        _startOfToday().format()
    )
    const [endDatetime, setEndDatetime] = useState<string>(
        _endOfToday().format()
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
        (cancelToken: CancelToken) => async (direction?: EventNavDirection) => {
            const params = fetchOptions

            if (
                direction === EventNavDirection.PrevCursor &&
                meta?.prev_cursor
            ) {
                params.cursor = meta.prev_cursor
            } else if (
                direction === EventNavDirection.NextCursor &&
                meta?.next_cursor
            ) {
                params.cursor = meta.next_cursor
            }

            try {
                const res = await fetchEvents(params, {cancelToken})
                setMeta(res.data.meta)
                dispatch(auditLogEventsFetched(res.data.data))
            } catch (error) {
                if (axios.isCancel(error)) {
                    return
                }
                const responseError = error as AxiosError<{
                    error?: {msg: string}
                }>
                await dispatch(
                    notify({
                        message:
                            responseError.response?.data.error?.msg ||
                            'Failed to fetch events.',
                        status: NotificationStatus.Error,
                    })
                )
            }
        }

    const [cancellableFetchUsersAudit] = useCancellableRequest(
        createFetchUsersAudit
    )

    const [{loading: isLoading}, fetchUsersAudit] = useAsyncFn(
        cancellableFetchUsersAudit,
        [fetchOptions, meta]
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

    useDebounce(
        () => {
            if (!_isEqual(previousFetchOptions, fetchOptions)) {
                void fetchUsersAudit()
            }
        },
        1000,
        [fetchOptions]
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
                        {agents.map((agent: Map<any, any>) => (
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
                        labelDateFormat={DATETIME_LABEL_FORMAT}
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
            <Container fluid className={css.pageContainer}>
                <div className="manage-requests-description">
                    <p>
                        User audit logs display recent actions performed by
                        users in Gorgias
                    </p>
                </div>
                {isLoading ? (
                    <Loader />
                ) : _isEmpty(auditLogEvents) ? (
                    <div>
                        There is no event recorded matching these filters.
                    </div>
                ) : (
                    <div>
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
                            hasNextItems={!!meta?.next_cursor}
                            hasPrevItems={!!meta?.prev_cursor}
                            fetchNextItems={() =>
                                fetchUsersAudit(EventNavDirection.NextCursor)
                            }
                            fetchPrevItems={() =>
                                fetchUsersAudit(EventNavDirection.PrevCursor)
                            }
                        />
                    </div>
                )}
            </Container>
        </div>
    )
}

export default UserAuditList
