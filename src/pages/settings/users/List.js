// @flow
import React from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {Link} from 'react-router-dom'
import {Button, Container} from 'reactstrap'

import type {List, Map} from 'immutable'

import Loader from '../../common/components/Loader'
import Pagination from '../../common/components/Pagination'

import * as actions from '../../../state/agents/actions.ts'
import * as selectors from '../../../state/agents/selectors.ts'
import PageHeader from '../../common/components/PageHeader.tsx'

import Row from './Row'

import css from './List.less'

type Props = {
    agents: List<*>,
    pagination: Map<*, *>,
    accountOwnerId: number,
    fetchAgents: (T: number) => Promise<*>,
    deleteAgent: (T: string) => Promise<*>,
}

type State = {
    isFetching: boolean,
}

@connect(
    (state) => {
        return {
            agents: selectors.getPaginatedAgents(state),
            pagination: selectors.getPagination(state),
            accountOwnerId: state.currentAccount.get('user_id'),
        }
    },
    {
        fetchAgents: actions.fetchPagination,
        deleteAgent: actions.deleteAgent,
    }
)
export default class UserList extends React.Component<Props, State> {
    state = {
        isFetching: false,
    }

    componentDidMount() {
        this._fetchPage(1)
    }

    _fetchPage = (page: number = 1) => {
        this.setState({isFetching: true})
        return this.props.fetchAgents(page).then(() => {
            this.setState({isFetching: false})
        })
    }

    render() {
        const {agents, pagination, deleteAgent, fetchAgents} = this.props

        if (this.state.isFetching) {
            return <Loader />
        }

        const currentPage = pagination.get('page') || 1

        return (
            <div className={classnames('full-width', css.component)}>
                <PageHeader title="Users">
                    <Button
                        tag={Link}
                        color="success"
                        to="/app/settings/users/add/"
                    >
                        Add user
                    </Button>
                </PageHeader>

                <Container fluid className="page-container">
                    <p>
                        Manage users for your Gorgias account. Users (Ex:
                        Agents, Admins, etc..) can view tickets and respond to
                        them.
                    </p>
                    <p>
                        You can <strong>add as many users as you want</strong>,
                        at no additional cost.
                    </p>
                    <div className={css.list}>
                        {agents.map((agent, index) => {
                            const agentId = agent.get('id')
                            return (
                                <Row
                                    key={agentId}
                                    agent={agent}
                                    isAccountOwner={
                                        agentId === this.props.accountOwnerId
                                    }
                                    deleteAgent={deleteAgent}
                                    fetchAgents={fetchAgents}
                                    currentPage={currentPage}
                                    last={index === agents.size - 1}
                                />
                            )
                        })}
                    </div>

                    <Pagination
                        pageCount={pagination.get('nb_pages') || 1}
                        currentPage={currentPage}
                        onChange={this._fetchPage}
                        className={classnames(
                            css.pagination,
                            'pagination-transparent'
                        )}
                    />
                </Container>
            </div>
        )
    }
}
