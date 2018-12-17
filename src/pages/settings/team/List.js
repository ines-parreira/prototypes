// @flow
import React from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {Link} from 'react-router'
import {
    Button,
    Container,
} from 'reactstrap'

import Loader from '../../common/components/Loader'
import Pagination from '../../common/components/Pagination'

import Row from './Row'

import * as actions from '../../../state/agents/actions'
import * as selectors from '../../../state/agents/selectors'
import PageHeader from '../../common/components/PageHeader'
import SecondaryNavbar from '../../common/components/SecondaryNavbar/SecondaryNavbar'

import css from './List.less'

import type {List, Map} from 'immutable'

type Props = {
    agents: List<*>,
    pagination: Map<*,*>,
    fetchAgents: (T: number) => Promise<*>,
    deleteAgent: (T: string) => Promise<*>,
}

type State = {
    isFetching: boolean,
}

@connect((state) => {
    return {
        agents: selectors.getPaginatedAgents(state),
        pagination: selectors.getPagination(state),
    }
}, {
    fetchAgents: actions.fetchPagination,
    deleteAgent: actions.deleteAgent,
})
export default class TeamList extends React.Component<Props, State> {
    state = {
        isFetching: false,
    }

    componentDidMount() {
        this._fetchPage(1)
    }

    _fetchPage = (page: number = 1) => {
        this.setState({isFetching: true})
        return this.props.fetchAgents(page)
            .then(() => {
                this.setState({isFetching: false})
            })
    }

    render() {
        const {agents, pagination, deleteAgent, fetchAgents} = this.props

        if (this.state.isFetching) {
            return <Loader/>
        }

        const currentPage = pagination.get('page') || 1

        return (
            <div className={classnames('full-width', css.component)}>
                <PageHeader title="Team members">
                    <Button
                        tag={Link}
                        color="success"
                        to="/app/settings/team/add/"
                    >
                        Add team member
                    </Button>
                </PageHeader>

                <SecondaryNavbar>
                    <Link to="/app/settings/team">Team</Link>
                    <Link to="/app/settings/audit/">Audit logs</Link>
                </SecondaryNavbar>

                <Container
                    fluid
                    className="page-container"
                >
                    <p>
                        Manage team members for your Gorgias account. Team members can view tickets and respond to them.
                    </p>
                    <p>
                        You can <strong>add as many team members as you want</strong>, at no additional cost.
                    </p>
                    <div className={css.list}>
                        {
                            agents.map((agent, index) => {
                                return (
                                    <Row
                                        key={agent.get('id')}
                                        agent={agent}
                                        deleteAgent={deleteAgent}
                                        fetchAgents={fetchAgents}
                                        currentPage={currentPage}
                                        last={index === agents.size - 1}
                                    />
                                )
                            })
                        }
                    </div>

                    <Pagination
                        pageCount={pagination.get('nb_pages') || 1}
                        currentPage={currentPage}
                        onChange={this._fetchPage}
                        className={classnames(css.pagination, 'pagination-transparent')}
                    />
                </Container>
            </div>
        )
    }
}
