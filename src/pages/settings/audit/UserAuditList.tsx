import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Container, Table} from 'reactstrap'
import _isEmpty from 'lodash/isEmpty'
import moment from 'moment-timezone'
import {AxiosError} from 'axios'
import {List, Map} from 'immutable'

import {fetchEvents} from '../../../models/event/resources'
import {getMoment} from '../../../utils/date'
import {RootState} from '../../../state/types'
import {NotificationStatus} from '../../../state/notifications/types'
import {notify} from '../../../state/notifications/actions'
import {getAgents} from '../../../state/agents/selectors'
import {auditLogEventsFetched} from '../../../state/entities/auditLogEvents/actions'
import {
    EventType,
    EventsDatetimeOperator,
    FetchEventsOptions,
} from '../../../models/event/types'

import Loader from '../../common/components/Loader/Loader'
import PageHeader from '../../common/components/PageHeader'
import PeriodPicker from '../../stats/common/PeriodPicker'
import SelectFilter from '../../stats/common/SelectFilter'
import Navigation from '../../common/components/Navigation/Navigation'
import {humanizeString} from '../../../utils'

import css from '../settings.less'

import {CursorMeta} from '../../../models/api/types'
import {DATETIME_LABEL_FORMAT, EventNavDirection} from './constants'
import UserAuditRow from './UserAuditRow'

type Props = ConnectedProps<typeof connector>

type State = {
    isFetching: boolean
    end_datetime: string
    start_datetime: string
    types: Array<EventType>
    user_ids: Array<number>
    meta: CursorMeta | null
}

const _startOfToday = () => getMoment().startOf('day')
const _endOfToday = () => getMoment().endOf('day')
const _someDaysAgoStartOfDay = (days: number) =>
    _startOfToday().subtract(days - 1, 'days')

const eventTypeOptions = Object.values(EventType).map((auditEvent) => ({
    label: humanizeString(auditEvent),
    value: auditEvent,
}))

export class UserAuditListContainer extends Component<Props, State> {
    state: State = {
        isFetching: false,
        start_datetime: _startOfToday().format(),
        end_datetime: _endOfToday().format(),
        user_ids: [],
        types: [],
        meta: null,
    }

    componentDidMount() {
        void this.fetchUsersAudit()
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (
            prevState.types !== this.state.types ||
            prevState.user_ids !== this.state.user_ids
        ) {
            void this.fetchUsersAudit()
        }
    }

    getFetchOptions = (): FetchEventsOptions => {
        const {start_datetime, end_datetime, user_ids, types} = this.state
        return {
            createdDatetime: {
                [EventsDatetimeOperator.GTE]: start_datetime,
                [EventsDatetimeOperator.LTE]: end_datetime,
            },
            userIds: user_ids,
            types,
        }
    }

    fetchUsersAudit = async (direction?: EventNavDirection) => {
        const {auditLogEventsFetched, notify} = this.props
        const {meta} = this.state
        this.setState({isFetching: true})

        const params = this.getFetchOptions()

        if (direction === EventNavDirection.PrevCursor && meta?.prev_cursor) {
            params.cursor = meta.prev_cursor
        } else if (
            direction === EventNavDirection.NextCursor &&
            meta?.next_cursor
        ) {
            params.cursor = meta.next_cursor
        }
        try {
            const res = await fetchEvents(params)
            this.setState({isFetching: false, meta: res.data.meta})
            auditLogEventsFetched(res.data.data)
        } catch (error) {
            const responseError = error as AxiosError<{error?: {msg: string}}>
            void notify({
                message:
                    responseError.response?.data.error?.msg ||
                    'Failed to fetch events.',
                status: NotificationStatus.Error,
            })
        } finally {
            this.setState({isFetching: false})
        }
    }

    _onApplyDatePicker = ({
        startDatetime,
        endDatetime,
    }: {
        startDatetime: string
        endDatetime: string
    }) => {
        this.setState(
            {
                start_datetime: startDatetime,
                end_datetime: endDatetime,
            },
            () => void this.fetchUsersAudit()
        )
    }

    handleChange = (filterName: string) => {
        return (values: Array<string>) => {
            this.setState({[filterName]: values} as any)
        }
    }

    render() {
        const {userIdOptions, auditLogEvents} = this.props
        const {
            isFetching,
            start_datetime,
            end_datetime,
            user_ids,
            types,
            meta,
        } = this.state

        if (isFetching) {
            return <Loader />
        }

        return (
            <div className="full-width">
                <PageHeader title="Audit logs">
                    <div className="d-flex flex-wrap float-right">
                        <SelectFilter
                            singular="team member"
                            onChange={this.handleChange('user_ids') as any}
                            isMultiple={false}
                            value={user_ids}
                        >
                            {userIdOptions.map((option) => (
                                <SelectFilter.Item
                                    key={option!.get('id')}
                                    label={option!.get('name')}
                                    value={option!.get('id')}
                                />
                            ))}
                        </SelectFilter>

                        <SelectFilter
                            plural="events"
                            singular="event"
                            onChange={this.handleChange('types') as any}
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
                            startDatetime={moment(start_datetime)}
                            endDatetime={moment(end_datetime)}
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
                            onChange={this._onApplyDatePicker}
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
                            users in Gorgias.
                        </p>
                    </div>
                    {_isEmpty(auditLogEvents) ? (
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
                                    this.fetchUsersAudit(
                                        EventNavDirection.NextCursor
                                    )
                                }
                                fetchPrevItems={() =>
                                    this.fetchUsersAudit(
                                        EventNavDirection.PrevCursor
                                    )
                                }
                            />
                        </div>
                    )}
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        userIdOptions: getAgents(state) as List<Map<any, any>>,
        auditLogEvents: Object.values(state.entities.auditLogEvents),
    }),
    {
        auditLogEventsFetched,
        notify,
    }
)

export default connector(UserAuditListContainer)
