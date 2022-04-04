import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {Link} from 'react-router-dom'
import {Container} from 'reactstrap'
import {Map} from 'immutable'

import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import Pagination from 'pages/common/components/Pagination'
import {fetchPagination} from 'state/agents/actions'
import {getPaginatedAgents, getPagination} from 'state/agents/selectors'
import PageHeader from 'pages/common/components/PageHeader'
import {RootState} from 'state/types'
import settingsCss from '../settings.less'

import Row from './Row'
import css from './List.less'
import cssRow from './Row.less'

type Props = ConnectedProps<typeof connector>

type State = {
    isFetching: boolean
}

export class UserListContainer extends Component<Props, State> {
    state = {
        isFetching: false,
    }

    componentDidMount() {
        void this._fetchPage(1)
    }

    _fetchPage = (page = 1) => {
        this.setState({isFetching: true})
        return this.props.fetchAgents(page).then(() => {
            this.setState({isFetching: false})
        })
    }

    render() {
        const {agents, pagination} = this.props

        if (this.state.isFetching) {
            return <Loader />
        }

        const currentPage = pagination.get('page') || 1

        return (
            <div className={classnames('full-width', css.component)}>
                <PageHeader title="Users">
                    <Link to="/app/settings/users/add/">
                        <Button>Add user</Button>
                    </Link>
                </PageHeader>

                <Container fluid className={settingsCss.pageContainer}>
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
                        <span
                            className={classnames(
                                css.tableHeader,
                                cssRow.component
                            )}
                        >
                            <span
                                className={cssRow.avatar}
                                style={{width: '36px'}}
                            >
                                User
                            </span>
                            <span className={cssRow.meta} />
                            <span className={cssRow.role}>Role</span>
                            <span className={cssRow.twoFa}>2FA enabled</span>
                            <span className={cssRow.delete} />
                        </span>

                        {agents.map((agent: Map<any, any>, index) => {
                            const agentId = agent.get('id')
                            return (
                                <Row
                                    key={agentId}
                                    agent={agent}
                                    isAccountOwner={
                                        agentId === this.props.accountOwnerId
                                    }
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

const connector = connect(
    (state: RootState) => ({
        agents: getPaginatedAgents(state),
        pagination: getPagination(state),
        accountOwnerId: state.currentAccount.get('user_id'),
    }),
    {
        fetchAgents: fetchPagination,
    }
)

export default connector(UserListContainer)
