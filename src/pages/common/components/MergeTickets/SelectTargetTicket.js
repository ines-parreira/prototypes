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
    sourceTicket: Map<*, *>,
    search: typeof searchTickets,
    updateTargetTicket: (number) => void,
    customerId: ?number,
}

type State = {
    query: string,
    navigation: Map<*, *>,
    tickets: List<Map<*, *>>,
    listIsLoading: boolean,
}

class SelectTargetTicket extends React.Component<Props, State> {
    state = {
        query: '',
        navigation: fromJS({}),
        tickets: fromJS([]),
        listIsLoading: false,
    }

    componentDidMount() {
        this.setState({listIsLoading: true}, () => this._search())
    }

    _search = (direction: ?string = null) => {
        const {query, navigation} = this.state

        this.props
            .search(
                query,
                this.props.sourceTicket.get('id'),
                query ? null : this.props.customerId,
                direction,
                navigation
            )
            .then((data) => {
                this.setState({
                    tickets: fromJS(data.data),
                    navigation: fromJS(data.meta),
                    listIsLoading: false,
                })
            })
            .catch(() => {
                this.setState({
                    tickets: fromJS([]),
                    navigation: fromJS({}),
                    listIsLoading: false,
                })
            })
    }

    _updateQuery = (query: string) => {
        this.setState(
            {
                query,
                listIsLoading: true,
            },
            () => this._search()
        )
    }

    _onPageChange = (direction: ?string = null) => {
        this.setState(
            {
                listIsLoading: true,
            },
            () => this._search(direction)
        )
    }

    render() {
        const {sourceTicket, updateTargetTicket} = this.props
        const {tickets, navigation} = this.state

        const baseView = viewsConfig.defaultMergeTicketsView(
            sourceTicket.get('id')
        )

        const config = viewsConfig.getConfigByName('ticket')
        const fields = config.get('fields').filter((field) => {
            return baseView.get('fields').includes(field.get('name'))
        })

        return (
            <div>
                <p>
                    Select the ticket you want to merge{' '}
                    <b>{sourceTicket.get('subject')}</b> with:
                </p>
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
                        fetchViewItems={this._onPageChange}
                        navigation={navigation}
                    />
                </div>
            </div>
        )
    }
}

export default connect(null, {
    search: searchTickets,
})(SelectTargetTicket)
