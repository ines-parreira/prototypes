//@flow
import React from 'react'
import {connect} from 'react-redux'
import {Alert, Container, Table} from 'reactstrap'
import _pick from 'lodash/pick'
import moment from 'moment-timezone'

import Loader from '../../common/components/Loader/Loader.tsx'
import PageHeader from '../../common/components/PageHeader.tsx'
import PeriodPicker from '../../stats/common/PeriodPicker.tsx'
import SelectFilter from '../../stats/common/SelectFilter.tsx'
import Pagination from '../../common/components/Pagination.tsx'
import {fetchUsersAudit} from '../../../state/usersAudit/actions.ts'
import {
    getUserAuditEvents,
    getUserAuditEventTypeOptions,
    getUserAuditObjectTypeOptions,
    getUserAuditPagination,
    getUserAuditUserIdOptions,
} from '../../../state/usersAudit/selectors.ts'
import {getMoment} from '../../../utils/date.ts'

import UserAuditRow from './UserAuditRow'
import {DATETIME_LABEL_FORMAT} from './constants'

type Props = {
    events: Object,
    eventsListMeta: Object,
    fetchUsersAudit: typeof fetchUsersAudit,
    userIdOptions: Array<Object>,
    eventTypeOptions: Array<Object>,
    objectTypeOptions: Array<Object>,
}

type State = {
    isFetching: boolean,
    end_datetime: string,
    start_datetime: string,
    event_types: Array<string>,
    object_types: Array<string>,
    user_ids: Array<number>,
}

// filters we'll use to fetch from the API
const filterStateProps = [
    'end_datetime',
    'start_datetime',
    'user_ids',
    'event_types',
    'object_types',
]

const _startOfToday = () => getMoment().startOf('day')
const _endOfToday = () => getMoment().endOf('day')
const _someDaysAgoStartOfDay = (days) =>
    _startOfToday().subtract(days - 1, 'days')

export class UserAuditList extends React.Component<Props, State> {
    state = {
        isFetching: false,
        start_datetime: _startOfToday().format(),
        end_datetime: _endOfToday().format(),
        user_ids: [],
        object_types: [],
        event_types: [],
    }

    componentDidMount() {
        this._fetchUsersAudit()
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (
            prevState.object_types !== this.state.object_types ||
            prevState.event_types !== this.state.event_types ||
            prevState.user_ids !== this.state.user_ids
        ) {
            this._fetchUsersAudit()
        }
    }

    _fetchUsersAudit = (page: number = 1) => {
        this.setState({isFetching: true})
        this.props
            .fetchUsersAudit({page, ..._pick(this.state, filterStateProps)})
            .then(() => {
                this.setState({isFetching: false})
            })
    }

    _onApplyDatePicker = ({
        startDatetime,
        endDatetime,
    }: {
        startDatetime: string,
        endDatetime: string,
    }) => {
        this.setState(
            {
                start_datetime: startDatetime,
                end_datetime: endDatetime,
            },
            this._fetchUsersAudit
        )
    }

    handleChange = (filterName: string) => {
        return (values: Array<string>) => {
            this.setState({[filterName]: values})
        }
    }

    render() {
        const {
            events,
            eventsListMeta,
            userIdOptions,
            eventTypeOptions,
            objectTypeOptions,
        } = this.props
        const {
            isFetching,
            start_datetime,
            end_datetime,
            user_ids,
            object_types,
            event_types,
        } = this.state

        if (isFetching) {
            return <Loader />
        }

        return (
            <div className="full-width">
                <PageHeader title="Audit logs">
                    <div className="d-flex flex-wrap float-right">
                        <SelectFilter
                            plural="team members"
                            singular="team member"
                            onChange={this.handleChange('user_ids')}
                            value={user_ids}
                        >
                            {userIdOptions.map((option) => (
                                <SelectFilter.Item
                                    key={option.value}
                                    label={option.label}
                                    value={option.value}
                                />
                            ))}
                        </SelectFilter>
                        <SelectFilter
                            plural="objects"
                            singular="object"
                            onChange={this.handleChange('object_types')}
                            value={object_types}
                        >
                            {objectTypeOptions.map((option) => (
                                <SelectFilter.Item
                                    key={option.value}
                                    label={option.label}
                                    value={option.value}
                                />
                            ))}
                        </SelectFilter>
                        <SelectFilter
                            plural="events"
                            singular="event"
                            onChange={this.handleChange('event_types')}
                            value={event_types}
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
                            maxDaysSpan={7}
                            onChange={this._onApplyDatePicker}
                            formatMaxSpan={(maxSpan) =>
                                moment.duration({
                                    days: maxSpan,
                                    seconds: -1, // counting days start at 0 because for our needs 1 day selected is 23H59m59s
                                })
                            }
                        />
                    </div>
                </PageHeader>

                <Container fluid className="page-container">
                    <div className="manage-requests-description">
                        <p>
                            User audit logs display recent actions performed by
                            users in Gorgias.
                        </p>
                        <Alert color="info">
                            This section is still under development, more
                            details will be added to the list in the future.
                            We'd love to hear your feedback!
                        </Alert>
                    </div>
                    {events.isEmpty() ? (
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
                                    {events
                                        .map((eventItem) => (
                                            <UserAuditRow
                                                key={eventItem.get('id')}
                                                eventItem={eventItem}
                                            />
                                        ))
                                        .toList()}
                                </tbody>
                            </Table>
                            <Pagination
                                className="pagination-transparent"
                                pageCount={eventsListMeta.get('nb_pages') || 1}
                                currentPage={eventsListMeta.get('page') || 1}
                                onChange={this._fetchUsersAudit}
                            />
                        </div>
                    )}
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state) => ({
        events: getUserAuditEvents(state),
        eventsListMeta: getUserAuditPagination(state),
        userIdOptions: getUserAuditUserIdOptions(state),
        objectTypeOptions: getUserAuditObjectTypeOptions(state),
        eventTypeOptions: getUserAuditEventTypeOptions(state),
    }),
    {
        fetchUsersAudit,
    }
)

export default connector(UserAuditList)
