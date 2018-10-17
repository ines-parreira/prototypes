// @flow
import React from 'react'
import {connect} from 'react-redux'
import {fromJS, Map, List} from 'immutable'

import Search from '../Search'
import Table from '../ViewTable/Table'
import {searchTickets} from '../../../../state/mergeTickets/actions'
import * as viewsConfig from '../../../../config/views'

import css from './SelectTargetTicket.less'

type Props = {
    sourceTicket: Map<*,*>,
    search: typeof searchTickets,
    updateTargetTicket: (number) => void,
    customerId: ?number
}

type State = {
    query: string,
    pagination: Map<*,*>,
    tickets: List<Map<*,*>>,
    listIsLoading: boolean
}

class SelectTargetTicket extends React.Component<Props, State> {
    state = {
        query: '',
        pagination: fromJS({nb_pages: 1, page: 1}),
        tickets: fromJS([]),
        listIsLoading: false,
    }

    componentDidMount() {
        this.setState({listIsLoading: true}, () => this._search())
    }

    _search = () => {
        this.props.search(
            this.state.query,
            this.props.sourceTicket.get('id'),
            this.state.pagination.get('page'),
            this.state.query ? null : this.props.customerId
        ).then((data) => {
            this.setState({
                tickets: fromJS(data.data),
                pagination: fromJS(data.meta),
                listIsLoading: false
            })
        }).catch(() => {
            this.setState({
                tickets: fromJS([]),
                pagination: fromJS({nb_pages: 1, page: 1}),
                listIsLoading: false
            })
        })
    }

    _updateQuery = (query: string) => {
        this.setState({
            query,
            listIsLoading: true
        }, () => this._search())
    }

    _changePage = (page: number) => {
        if (this.state.pagination.get('page') !== page) {
            this.setState({
                pagination: this.state.pagination.set('page', page),
                listIsLoading: true
            }, () => this._search())
        }
    }

    render() {
        const {sourceTicket, updateTargetTicket} = this.props
        const {tickets} = this.state

        const baseView = viewsConfig.defaultMergeTicketsView(sourceTicket.get('id'))

        const config = viewsConfig.getConfigByName('ticket')
        const fields = config.get('fields').filter((field) => {
            return baseView.get('fields').includes(field.get('name'))
        })

        return (
            <div>
                <p>Select the ticket you want to merge <b>{sourceTicket.get('subject')}</b> with:</p>
                <Search
                    onChange={this._updateQuery}
                    searchDebounceTime={300}
                    className={css.search}
                />
                <div className={css['table-wrapper']}>
                    <Table
                        view={baseView.set('dirty', true)}
                        config={config}
                        isLoading={() => this.state.listIsLoading}
                        type="ticket"
                        items={tickets}
                        fields={fields}
                        selectable={false}
                        isSearch
                        onItemClick={updateTargetTicket}
                        onPageChange={this._changePage}
                        pagination={this.state.pagination}
                    />
                </div>
            </div>
        )
    }
}

export default connect(null, {
    search: searchTickets
})(SelectTargetTicket)
