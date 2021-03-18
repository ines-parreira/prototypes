// @flow
import React from 'react'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {fromJS, List, Map} from 'immutable'
import {Button} from 'reactstrap'
import _noop from 'lodash/noop'

import * as infobarActions from '../../../../../state/infobar/actions.ts'
import * as infobarConstants from '../../../../../state/infobar/constants'
import * as customersActions from '../../../../../state/customers/actions.ts'
import * as ticketActions from '../../../../../state/ticket/actions.ts'
import withCancellableRequest from '../../../../common/utils/withCancellableRequest'
import {
    startEditionMode,
    stopEditionMode,
    submitWidgets,
} from '../../../../../state/widgets/actions.ts'
import history from '../../../../history.ts'

import type {reactRouterLocation} from '../../../../../types'
import * as segmentTracker from '../../../../../store/middlewares/segmentTracker'

import Loader from '../../Loader'
import Tooltip from '../../Tooltip'
import InfobarLayout from '../InfobarLayout'
import MergeCustomersContainer from '../../MergeCustomers/MergeCustomersContainer'
import Search from '../../Search'

import {areSourcesReady} from '../utils'
import css from '../Infobar.less'

import InfobarSearchResultsList from './InfobarSearchResultsList'
import InfobarCustomerInfo from './InfobarCustomerInfo'
import InfobarWidgetsEditionTools from './InfobarWidgetsEditionTools'
import InfobarCustomerActions from './InfobarCustomerActions'
import {ActionButtonContext} from './InfobarCustomerInfo/InfobarWidgets/widgets/ActionButton.tsx'

type Props = {
    actions: {
        widgets: {
            startEditionMode: typeof startEditionMode,
            stopEditionMode: typeof stopEditionMode,
            submitWidgets: typeof submitWidgets,
        },
        infobar: {
            fetchPreviewCustomer: typeof infobarActions.fetchPreviewCustomer,
        },
    },
    context: string,
    identifier: string,
    infobar: Object,
    isRouteEditingWidgets: boolean,
    sources: Map<*, *>,
    customer: Map<*, *>,
    widgets: Map<*, *>,
    fetchCustomerHistory: typeof customersActions.fetchCustomerHistory,
    searchCancellable: typeof infobarActions.search,
    searchSimilarCustomer: typeof infobarActions.similarCustomer,
    setCustomer: typeof ticketActions.setCustomer,

    // react-router
    location: reactRouterLocation,
}

type State = {
    isSearching: boolean,
    isFetchingCustomer: boolean,
    displaySearchResults: boolean,
    displaySelectedCustomer: boolean,
    showMergeCustomerModal: boolean,
    searchResults: List<*>,
    selectedCustomer: Map<*, *>,
    suggestedCustomer: Map<*, *>,
    searchErrorMessage: ?string,
}

const MERGE_ERROR_MESSAGE = `You can only edit orders of the customer associated with this ticket.
To edit this order, merge both customers or change the customer associated with this ticket.`

export class Infobar extends React.Component<Props, State> {
    static defaultProps = {
        customer: fromJS({}),
    }

    state = {
        searchErrorMessage: null,
        isSearching: false,
        isFetchingCustomer: false,
        displaySearchResults: false,
        displaySelectedCustomer: false,
        showMergeCustomerModal: false,
        searchResults: fromJS([]),
        selectedCustomer: fromJS({}),
        suggestedCustomer: fromJS({}),
    }

    // refs
    search = {
        _reset: _noop,
    }

    componentWillMount() {
        const {
            actions: {widgets: widgetsActions},
            context,
            isRouteEditingWidgets,
            widgets,
        } = this.props

        this._updateSimilarCustomer(this.props)
        if (
            isRouteEditingWidgets &&
            !widgets.getIn(['_internal', 'isEditing'])
        ) {
            widgetsActions.startEditionMode(context)
        } else if (
            !isRouteEditingWidgets &&
            widgets.getIn(['_internal', 'isEditing'])
        ) {
            widgetsActions.stopEditionMode()
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.identifier !== nextProps.identifier) {
            this._resetSearch()
        }

        const isEditingParam = nextProps.isRouteEditingWidgets
        const isEditing = nextProps.widgets.getIn(['_internal', 'isEditing'])

        if (isEditingParam && !isEditing) {
            nextProps.actions.widgets.startEditionMode(nextProps.context)
        } else if (!isEditingParam && isEditing) {
            nextProps.actions.widgets.stopEditionMode()
        }

        // if customer changed then try to find a suggestion of other customer to merge with it
        if (!this.props.customer.equals(nextProps.customer)) {
            this._updateSimilarCustomer(nextProps)
        }
    }

    _updateSimilarCustomer = (props: Props) => {
        this.setState({suggestedCustomer: fromJS({})})

        if (props.customer.isEmpty() || !props.customer.get('id')) {
            return
        }

        this.props
            .searchSimilarCustomer(props.customer.get('id'))
            .then((data) => {
                if (!data) {
                    return
                }
                const {customer: suggestion} = data
                const suggestionImmutable = fromJS(suggestion || {})

                if (suggestionImmutable.isEmpty()) {
                    return
                }

                this.setState({
                    suggestedCustomer: suggestionImmutable,
                })
            })
    }

    _mode = (state: State = this.state) => {
        // the following succession of conditions is in a particular order
        // which is important for the good display of each of those
        // /!\ do not mix it without testing it carefully

        if (state.isSearching) {
            return 'loading'
        }

        if (state.isFetchingCustomer) {
            return 'loading'
        }

        if (state.displaySelectedCustomer) {
            return 'selected'
        }

        if (state.displaySearchResults) {
            return 'results'
        }

        return 'default'
    }

    _isEditing = () => {
        return (
            this.props.widgets.getIn(['_internal', 'isEditing']) &&
            this.props.isRouteEditingWidgets
        )
    }

    _toggleEditionMode = (isEditing: boolean) => {
        const {identifier, context, location} = this.props

        if (!identifier) {
            return
        }

        if (isEditing) {
            history.push(
                `/app/${context}/${identifier}/edit-widgets${location.search}`
            )
        } else {
            history.push(`/app/${context}/${identifier}${location.search}`)
        }
    }

    _onSearchResultClick = async (customer: Map<*, *>) => {
        this.setState({isFetchingCustomer: true})
        const result = await this.props.actions.infobar.fetchPreviewCustomer(
            customer.get('id')
        )
        if (result.type === infobarConstants.FETCH_PREVIEW_CUSTOMER_SUCCESS) {
            this.setState({
                displaySelectedCustomer: true,
                isFetchingCustomer: false,
                selectedCustomer: fromJS(result.resp),
            })
        } else {
            this.setState({isFetchingCustomer: false})
        }
    }

    _onSearch = (query: string) => {
        if (query) {
            this.setState({isSearching: true})
            this.props.searchCancellable(query).then((res) => {
                if (!res) {
                    return
                }
                const {error, resp} = res
                let errorMessage

                if (error) {
                    errorMessage =
                        error?.response?.data?.error?.msg ||
                        'Failed to do the search. Please try again.'
                }

                this.setState({
                    searchErrorMessage: errorMessage,
                    displaySelectedCustomer: false,
                    displaySearchResults: true,
                    isSearching: false,
                    searchResults: error
                        ? fromJS([])
                        : fromJS(resp.data.slice(0, 8)),
                })
            })
        } else {
            this._resetSearch()
        }
    }

    _fetchCustomerHistory = () => {
        if (this.props.customer.isEmpty()) {
            return
        }

        const askedCustomerId = this.props.customer.get('id')

        // wait 1.5s before fetching customer history after merge (merge can take some time and is async)
        setTimeout(() => {
            this.props.fetchCustomerHistory(askedCustomerId, {
                successCondition: () => {
                    return (
                        this.props.customer.get('id').toString() ===
                        askedCustomerId.toString()
                    )
                },
            })
        }, 1500)
    }

    _resetSearch = () => {
        this.setState({
            displaySearchResults: false,
            searchResults: fromJS([]),
        })
    }

    _resetSelected = () => {
        this.setState({
            displaySelectedCustomer: false,
            selectedCustomer: fromJS({}),
        })
    }

    // reset search and display current customer
    _returnToCurrentCustomerProfile = () => {
        this._resetSearch()
        this._resetSelected()
        if (this.search) {
            this.search._reset()
        }
    }

    _setCustomer = () => {
        return this.props
            .setCustomer(this.state.selectedCustomer)
            .then(this._returnToCurrentCustomerProfile)
    }

    _renderCustomerInfo = (
        customer: Map<*, *>,
        displayTabs: boolean = true
    ) => {
        const isEditing = this._isEditing()

        const sources = this.props.sources
            .setIn(['ticket', 'customer'], customer)
            .set('customer', customer)

        return (
            <InfobarCustomerInfo
                actions={this.props.actions.widgets}
                isEditing={isEditing}
                sources={sources}
                customer={customer}
                widgets={this.props.widgets}
                displayTabs={displayTabs}
            />
        )
    }

    _renderContent = () => {
        const {sources, customer} = this.props

        const mode = this._mode()

        if (mode === 'loading') {
            return <Loader />
        }

        if (mode === 'selected') {
            return (
                <>
                    <div className="m-3">
                        <Button
                            type="button"
                            onClick={() => this._resetSelected()}
                        >
                            <i className="material-icons md-2 mr-2">
                                arrow_back
                            </i>
                            Back
                        </Button>
                        <InfobarCustomerActions
                            customer={customer}
                            sources={sources}
                            selectedCustomer={this.state.selectedCustomer}
                            toggleMergeCustomerModal={(
                                showMergeCustomerModal: boolean
                            ) => this.setState({showMergeCustomerModal})}
                            setCustomer={this._setCustomer}
                        />
                    </div>
                    <ActionButtonContext.Provider
                        value={{
                            actionError: MERGE_ERROR_MESSAGE,
                        }}
                    >
                        {this._renderCustomerInfo(this.state.selectedCustomer)}
                        <MergeCustomersContainer
                            isTicketContext={
                                !sources.get('ticket', fromJS({})).isEmpty()
                            }
                            display={this.state.showMergeCustomerModal}
                            destinationCustomer={customer}
                            sourceCustomer={this.state.selectedCustomer}
                            onSuccess={() => {
                                this._fetchCustomerHistory()
                                this._returnToCurrentCustomerProfile()
                            }}
                            onClose={() => {
                                this.setState({showMergeCustomerModal: false})
                            }}
                        />
                    </ActionButtonContext.Provider>
                </>
            )
        }

        if (mode === 'results') {
            const defaultCustomerId =
                sources.getIn(['ticket', 'customer', 'id']) ||
                sources.getIn(['customer', 'id'])

            return (
                <>
                    <div className="m-3">
                        <Button
                            type="button"
                            onClick={() => this._resetSearch()}
                        >
                            <i className="material-icons md-2 mr-2">
                                arrow_back
                            </i>
                            Back
                        </Button>
                    </div>
                    <InfobarSearchResultsList
                        errorMessage={this.state.searchErrorMessage}
                        searchResults={this.state.searchResults}
                        defaultCustomerId={defaultCustomerId}
                        onCustomerClick={this._onSearchResultClick}
                    />
                </>
            )
        }

        if (!this.props.identifier) {
            return null
        }

        const displaySuggestedCustomer =
            !this.state.suggestedCustomer.isEmpty() &&
            !this.props.widgets.getIn(['_internal', 'isEditing'])

        return (
            <>
                {this._renderCustomerInfo(customer)}
                {displaySuggestedCustomer && (
                    <div className="d-none d-md-block">
                        <div className={css.infobarSectionSeparator} />
                        <div className={classnames(css.suggestedCustomer)}>
                            <h4>Is this the same person?</h4>
                            <p>
                                'We have found someone similar to the customer
                                of this ticket. If it is the same person, merge
                                them together to get a unified view of this
                                customer.
                            </p>
                            <div style={{marginBottom: '30px'}}>
                                <Button
                                    className="mr-2"
                                    type="button"
                                    color="primary"
                                    onClick={() => {
                                        // TODO(customers-migration): ask confirmation to update this event
                                        segmentTracker.logEvent(
                                            segmentTracker.EVENTS
                                                .USER_MERGE_CLICK,
                                            {
                                                location:
                                                    'suggested user in infobar',
                                            }
                                        )
                                        this.setState({
                                            showMergeCustomerModal: true,
                                        })
                                    }}
                                >
                                    <i className="material-icons mr-1">
                                        call_merge
                                    </i>
                                    Merge
                                </Button>
                            </div>
                            <ActionButtonContext.Provider
                                value={{
                                    actionError: MERGE_ERROR_MESSAGE,
                                }}
                            >
                                {this._renderCustomerInfo(
                                    this.state.suggestedCustomer,
                                    false
                                )}
                                <MergeCustomersContainer
                                    isTicketContext={
                                        !sources
                                            .get('ticket', fromJS({}))
                                            .isEmpty()
                                    }
                                    display={this.state.showMergeCustomerModal}
                                    destinationCustomer={customer}
                                    sourceCustomer={
                                        this.state.suggestedCustomer
                                    }
                                    onSuccess={this._fetchCustomerHistory}
                                    onClose={() => {
                                        this.setState({
                                            showMergeCustomerModal: false,
                                        })
                                    }}
                                />
                            </ActionButtonContext.Provider>
                        </div>
                    </div>
                )}
            </>
        )
    }

    render() {
        const {widgets, sources} = this.props

        const isEditing = this._isEditing()
        const hasFetchedWidgets = widgets.getIn([
            '_internal',
            'hasFetchedWidgets',
        ])

        const context = widgets.get('currentContext', '')

        const canEditWidgets =
            hasFetchedWidgets &&
            areSourcesReady(sources, context) &&
            !this.state.displaySelectedCustomer

        return (
            <InfobarLayout
                className={classnames({
                    [css.editing]: isEditing,
                })}
            >
                <div className={css.infobarContent}>
                    <div
                        className={classnames(
                            css.infobarSearchWrapper,
                            'd-flex align-items-center justify-content-between'
                        )}
                    >
                        <Search
                            tabIndex="10"
                            placeholder="Search for customers by email, order number, etc."
                            bindKey
                            onChange={this._onSearch}
                            style={{maxWidth: 'none'}}
                            searchDebounceTime={200}
                            ref={(search) => {
                                this.search = search
                            }}
                        />

                        <Button
                            className={classnames(
                                css.toggleWidgets,
                                'd-none d-md-inline-block ml-2 btn-transparent'
                            )}
                            type="button"
                            id="toggle-widgets-edition-button"
                            color="secondary"
                            active={isEditing}
                            disabled={!canEditWidgets}
                            onClick={() => {
                                this._toggleEditionMode(!isEditing)
                            }}
                        >
                            <i className="material-icons md-2">settings</i>
                        </Button>
                        <Tooltip
                            placement="left"
                            target="toggle-widgets-edition-button"
                        >
                            {isEditing
                                ? 'Leave widgets edition'
                                : 'Edit widgets'}
                        </Tooltip>
                    </div>
                    <div className={css.content}>{this._renderContent()}</div>
                </div>
                {isEditing && (
                    <InfobarWidgetsEditionTools
                        actions={this.props.actions.widgets}
                        widgets={widgets}
                        context={context}
                    />
                )}
            </InfobarLayout>
        )
    }
}

export default withCancellableRequest(
    'searchCancellable',
    infobarActions.search
)(
    withRouter(
        connect(null, {
            fetchCustomerHistory: customersActions.fetchCustomerHistory,
            searchSimilarCustomer: infobarActions.similarCustomer,
            setCustomer: ticketActions.setCustomer,
        })(Infobar)
    )
)
