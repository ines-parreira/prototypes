import React, {Component} from 'react'
import {fromJS} from 'immutable'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import DocumentTitle from 'react-document-title'

import {RootState} from 'state/types'
import {compactInteger} from 'utils'
import {isCreationUrl, isSearchUrl} from 'pages/common/utils/url'
import {getCustomers} from 'state/customers/selectors'

import * as viewsActions from 'state/views/actions'
import * as viewsSelectors from 'state/views/selectors'

import ViewTable from 'pages/common/components/ViewTable/ViewTable'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import CustomerForm from '../common/components/CustomerForm'

import CustomerListActions from './components/CustomerListActions'

type OwnProps = RouteComponentProps<{viewId: string}>

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    isSearch: boolean
    isUpdate: boolean
    isCustomerFormOpen: boolean
}

class CustomerListContainer extends Component<Props, State> {
    state: State = {
        isSearch: false,
        isUpdate: true,
        isCustomerFormOpen: false,
    }

    _setInitialState = (props: Props) => {
        this.setState({
            // TODO(customers-migration): remove statements with `users` when we updated all links in our email templates.
            isSearch:
                isSearchUrl(props.location.pathname, 'users') ||
                isSearchUrl(props.location.pathname, 'customers'),
            isUpdate:
                !isCreationUrl(props.location.pathname, 'users') &&
                !isCreationUrl(props.location.pathname, 'customers'),
        })
    }

    componentWillMount() {
        this._setInitialState(this.props)
    }

    componentWillReceiveProps(nextProps: Props) {
        this._setInitialState(nextProps)
    }

    _openModal = () => {
        this.setState({isCustomerFormOpen: true})
    }

    _closeModal = () => {
        this.setState({isCustomerFormOpen: false})
    }

    render() {
        const {isSearch, isUpdate} = this.state
        const {
            customers,
            urlViewId,
            activeView,
            hasActiveView,
            fetchViewItems,
        } = this.props
        let title = 'Loading...'

        if (!isUpdate) {
            title = 'New view'
        } else if (hasActiveView) {
            title = activeView.get('name')
            if (activeView.get('count', 0) > 0) {
                title = `(${compactInteger(
                    activeView.get('count', 0)
                )}) ${title}`
            }
        } else {
            title = 'Wrong view'
        }

        if (isSearch) {
            title = 'Search'
        }

        return (
            <DocumentTitle title={title}>
                <div
                    className="d-flex flex-column"
                    style={{
                        width: '100%',
                    }}
                >
                    <ViewTable
                        type="customer"
                        items={customers}
                        isUpdate={isUpdate}
                        isSearch={isSearch}
                        urlViewId={urlViewId}
                        ActionsComponent={CustomerListActions}
                        viewButtons={
                            <div className="d-inline-flex align-items-center">
                                <Button type="button" onClick={this._openModal}>
                                    Add customer
                                </Button>

                                <Modal
                                    isOpen={this.state.isCustomerFormOpen}
                                    onClose={this._closeModal}
                                >
                                    <ModalHeader title="Add customer" />
                                    <CustomerForm
                                        customer={fromJS({})}
                                        closeModal={this._closeModal}
                                        onSuccess={() => fetchViewItems()}
                                    />
                                </Modal>
                            </div>
                        }
                    />
                </div>
            </DocumentTitle>
        )
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
    const urlViewId = ownProps.match.params.viewId

    return {
        activeView: viewsSelectors.getActiveView(state),
        hasActiveView: viewsSelectors.hasActiveView(state),
        customers: getCustomers(state),
        urlViewId,
        views: state.views,
    }
}

const mapDispatchToProps = {
    fetchViewItems: viewsActions.fetchViewItems,
}

const connector = connect(mapStateToProps, mapDispatchToProps)

export default withRouter(connector(CustomerListContainer))
