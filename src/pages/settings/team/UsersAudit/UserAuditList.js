//@flow
import React from 'react'
import {connect} from 'react-redux'
import {Alert, Button, Container, Table} from 'reactstrap'
import _pick from 'lodash/pick'
import moment from 'moment/moment'
import {Link} from 'react-router'


import Loader from '../../../common/components/Loader/Loader'
import PageHeader from '../../../common/components/PageHeader'
import DatePicker from '../../../common/forms/DatePicker'
import SearchableSelectField from '../../../stats/common/SearchableSelectField'
import Pagination from '../../../common/components/Pagination'
import SecondaryNavbar from '../../../common/components/SecondaryNavbar/SecondaryNavbar'
import {fetchUsersAudit} from '../../../../state/usersAudit/actions'
import {
    getUserAuditEvents,
    getUserAuditEventTypeOptions,
    getUserAuditObjectTypeOptions,
    getUserAuditPagination,
    getUserAuditUserIdOptions,
} from '../../../../state/usersAudit/selectors'
import UserAuditRow from './UserAuditRow'
import {DATETIME_LABEL_FORMAT} from './constants'
import {formatDatetime} from '../../../../utils'
import {getMoment} from '../../../../utils/date'

type Props = {
    timezone: string,
    events: Object,
    eventsListMeta: Object,
    fetchUsersAudit: typeof fetchUsersAudit,
    userIdOptions: Array<Object>,
    eventTypeOptions: Array<Object>,
    objectTypeOptions: Array<Object>,
}

type State = {
    // toggles
    isFetching: boolean,
    isDatePickerOpen: boolean,

    // filters
    end_datetime: string,
    start_datetime: string,
    user_ids?: Array<number>,
    event_types?: Array<string>,
    object_types?: Array<string>,
}

// filters we'll use to fetch from the API
const filterStateProps = ['end_datetime', 'start_datetime', 'user_ids', 'event_types', 'object_types']

const _startOfToday = () => getMoment().startOf('day')
const _endOfToday = () => getMoment().endOf('day')
const _someDaysAgoStartOfDay = (days) => _startOfToday().subtract(days - 1, 'days')

export class UserAuditList extends React.Component<Props, State> {
    state = {
        isFetching: false,
        isDatePickerOpen: false,
        start_datetime: _startOfToday().format(),
        end_datetime: _endOfToday().format(),
    }

    componentDidMount() {
        this._fetchUsersAudit()
    }

    _fetchUsersAudit = (page: number = 1) => {
        this.setState({isFetching: true})
        this.props.fetchUsersAudit({page, ..._pick(this.state, filterStateProps)}).then(() => {
            this.setState({isFetching: false})
        })
    }

    _onApplyDatePicker = (event: Object, picker: Object) => {
        this.setState({
            start_datetime: picker.startDate.format(),
            end_datetime: picker.endDate.format(),
        }, this._fetchUsersAudit)
    }

    _onFilterChange = (filterName: string, values: Array<string>) => {
        this.setState({[filterName]: values}, this._fetchUsersAudit)
    }

    _makeInputControl = (filterName: string) => {
        const filterValue = this.state[filterName]
        return {
            value: filterValue ? filterValue : [],
            onChange: (values: Array<string>) => {
                this._onFilterChange(filterName, values)
            },
        }
    }

    render() {
        const {events, eventsListMeta, userIdOptions, eventTypeOptions, objectTypeOptions} = this.props
        const {isFetching, isDatePickerOpen, start_datetime, end_datetime} = this.state

        if (isFetching) {
            return <Loader/>
        }

        return (
            <div className="full-width">
                <PageHeader title="Audit logs">
                    <div className="d-flex flex-wrap float-right">
                        <SearchableSelectField
                            plural="team members"
                            singular="team member"
                            items={userIdOptions}
                            input={this._makeInputControl('user_ids')}
                        />

                        <SearchableSelectField
                            plural="objects"
                            singular="object"
                            items={objectTypeOptions}
                            input={this._makeInputControl('object_types')}
                        />
                        <SearchableSelectField
                            plural="events"
                            singular="event"
                            items={eventTypeOptions}
                            input={this._makeInputControl('event_types')}
                        />
                        <DatePicker
                            isOpen={isDatePickerOpen}
                            onApply={this._onApplyDatePicker}
                            applyClass="btn-success mr-2"
                            buttonClasses={['btn']}
                            cancelClass="btn-secondary"
                            opens="left"
                            timePicker
                            singleDatePicker={false}
                            startDate={moment(start_datetime)}
                            endDate={moment(end_datetime)}
                            minDate={_someDaysAgoStartOfDay(7)}
                            ranges={{
                                'Today': [_startOfToday(), _endOfToday()],
                                'Last 3 days': [_someDaysAgoStartOfDay(3), _endOfToday()],
                                'Last 7 days': [_someDaysAgoStartOfDay(7), _endOfToday()],
                            }}
                        >
                            <Button
                                type="button"
                                className="selected-date-range-btn"
                                disabled={false}
                            >
                                <i className="fa fa-fw fa-calendar mr-2"/>
                                <span>
                                    {formatDatetime(start_datetime, null, DATETIME_LABEL_FORMAT)}
                                    {' - '}
                                    {formatDatetime(end_datetime, null, DATETIME_LABEL_FORMAT)}
                                </span>
                                <i className="fa fa-fw fa-caret-down"/>
                            </Button>
                        </DatePicker>
                    </div>
                </PageHeader>
                <SecondaryNavbar>
                    <Link to="/app/settings/team">Team</Link>
                    <Link to="/app/settings/audit/">Audit logs</Link>
                </SecondaryNavbar>

                <Container fluid className="page-container">
                    <div className="manage-requests-description">
                        <p>
                            User audit logs display recent actions performed by team members in
                            Gorgias.
                        </p>
                        <Alert color="info">
                            This section is still under development, more details will be added to the list in the
                            future. We'd love to hear your feedback!
                        </Alert>
                    </div>
                    {events.isEmpty() ? (
                        <div>There is no event recorded matching these filters.</div>
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
                                {events.map((eventItem) => (
                                    <UserAuditRow
                                        key={eventItem.get('id')}
                                        eventItem={eventItem}
                                    />
                                )).toList()}
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

export default connect((state) => ({
    events: getUserAuditEvents(state),
    eventsListMeta: getUserAuditPagination(state),
    userIdOptions: getUserAuditUserIdOptions(state),
    objectTypeOptions: getUserAuditObjectTypeOptions(state),
    eventTypeOptions: getUserAuditEventTypeOptions(state),
}), ({
    fetchUsersAudit: fetchUsersAudit,
}))(UserAuditList)
