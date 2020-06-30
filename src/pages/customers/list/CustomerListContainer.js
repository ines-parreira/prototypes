import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import DocumentTitle from 'react-document-title'
import {Button} from 'reactstrap'

import {compactInteger} from '../../../utils'
import {isCreationUrl, isSearchUrl} from '../../common/utils/url'
import {getCustomers} from '../../../state/customers/selectors'

import * as viewsActions from '../../../state/views/actions'
import * as viewsSelectors from '../../../state/views/selectors'

import ViewTable from '../../common/components/ViewTable/ViewTable'

import CustomerForm from '../common/components/CustomerForm'
import Modal from '../../common/components/Modal'

import CustomerListActions from './components/CustomerListActions'

class CustomerListContainer extends React.Component {
    state = {
        isSearch: false,
        isUpdate: true,
        isCustomerFormOpen: false,
    }

    _setInitialState = (props) => {
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

    componentWillReceiveProps(nextProps) {
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
                                <Button
                                    type="button"
                                    color="primary"
                                    onClick={this._openModal}
                                >
                                    Add customer
                                </Button>

                                <Modal
                                    isOpen={this.state.isCustomerFormOpen}
                                    onClose={this._closeModal}
                                    header="Add customer"
                                >
                                    <CustomerForm
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

CustomerListContainer.propTypes = {
    activeView: ImmutablePropTypes.map.isRequired,
    hasActiveView: PropTypes.bool.isRequired,
    location: PropTypes.object,
    params: PropTypes.object,
    urlViewId: PropTypes.string,
    customers: PropTypes.object.isRequired,
    views: PropTypes.object.isRequired,
    fetchViewItems: PropTypes.func.isRequired,
}

const mapStateToProps = (state, ownProps) => {
    const urlViewId = ownProps.params.viewId

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

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CustomerListContainer)
