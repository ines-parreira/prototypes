import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {
    Button,
    Table,
} from 'reactstrap'

import Loader from '../../common/components/Loader'
import Pagination from '../../common/components/Pagination'

import Row from './Row'

import * as actions from '../../../state/agents/actions'
import * as selectors from '../../../state/agents/selectors'

@connect((state) => {
    return {
        agents: selectors.getPaginatedAgents(state),
        pagination: selectors.getPagination(state),
    }
}, {
    fetchAgents: actions.fetchPagination,
})
export default class List extends React.Component {
    static propTypes = {
        agents: ImmutablePropTypes.list.isRequired,
        fetchAgents: PropTypes.func.isRequired,
        pagination: ImmutablePropTypes.map.isRequired,
    }

    state = {
        isFetching: false,
    }

    componentDidMount() {
        this._fetchPage(1)
    }

    _fetchPage = (page = 1) => {
        this.setState({isFetching: true})
        return this.props.fetchAgents(page)
            .then(() => {
                this.setState({isFetching: false})
            })
    }

    render() {
        const {agents, pagination} = this.props

        if (this.state.isFetching) {
            return <Loader />
        }

        return (
            <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h1>
                        Team members
                    </h1>
                    <Button
                        tag={Link}
                        color="success"
                        to="/app/settings/team/add/"
                    >
                        Add team member
                    </Button>
                </div>

                <p>
                    Manage team members for your Gorgias account. Team members can view tickets and respond to them.
                </p>
                <p>
                    You can <strong>add as many team members as you want</strong>, at no additional cost.
                </p>
                <Table hover>
                    <tbody>
                        {
                            agents.map((agent) => {
                                return (
                                    <Row
                                        key={agent.get('id')}
                                        agent={agent}
                                    />
                                )
                            })
                        }
                    </tbody>
                </Table>

                <Pagination
                    pageCount={pagination.get('nb_pages') || 1}
                    currentPage={pagination.get('page') || 1}
                    onChange={this._fetchPage}
                />
            </div>
        )
    }
}
