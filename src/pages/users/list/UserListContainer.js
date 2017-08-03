import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import DocumentTitle from 'react-document-title'
import {Button} from 'reactstrap'

import {compactInteger} from '../../../utils'
import {isCreationUrl, isSearchUrl} from '../../common/utils/url'
import {getUsers} from '../../../state/users/selectors'

import * as viewsActions from '../../../state/views/actions'
import * as viewsSelectors from '../../../state/views/selectors'

import UserListActions from './components/UserListActions'
import ViewTable from '../../common/components/ViewTable/Page'

import UserForm from '../common/components/UserForm'
import Modal from '../../common/components/Modal'

class UserListContainer extends React.Component {
    state = {
        isSearch: false,
        isUpdate: true,
        isUserFormOpen: false,
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            isSearch: isSearchUrl(nextProps.location.pathname, 'users'),
            isUpdate: !isCreationUrl(nextProps.location.pathname, 'users')
        })
    }

    _openModal = () => {
        this.setState({isUserFormOpen: true})
    }

    _closeModal = () => {
        this.setState({isUserFormOpen: false})
    }

    _fetchView = () => {
        this.props.fetchPage(1)
    }

    render() {
        const {isSearch, isUpdate} = this.state
        const {users, urlViewId, activeView, hasActiveView} = this.props
        let title = 'Loading...'

        if (!isUpdate) {
            title = 'New view'
        } else if (hasActiveView) {
            title = activeView.get('name')
            if (activeView.get('count', 0) > 0) {
                title = `(${compactInteger(activeView.get('count', 0))}) ${title}`
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
                        type="user"
                        items={users}
                        isUpdate={isUpdate}
                        isSearch={isSearch}
                        urlViewId={urlViewId}
                        ActionsComponent={UserListActions}
                        viewButtons={(
                            <div className="d-inline-flex align-items-center">
                                <Button
                                    type="button"
                                    color="primary"
                                    onClick={this._openModal}
                                >
                                    Add user
                                </Button>

                                <Modal
                                    isOpen={this.state.isUserFormOpen}
                                    onClose={this._closeModal}
                                    header="Add user"
                                >
                                    <UserForm
                                        closeModal={this._closeModal}
                                        onSuccess={this._fetchView}
                                    />
                                </Modal>
                            </div>
                        )}
                    />
                </div>
            </DocumentTitle>
        )
    }
}

UserListContainer.propTypes = {
    activeView: ImmutablePropTypes.map.isRequired,
    hasActiveView: PropTypes.bool.isRequired,
    location: PropTypes.object,
    params: PropTypes.object,
    urlViewId: PropTypes.string,
    users: PropTypes.object.isRequired,
    views: PropTypes.object.isRequired,
    fetchPage: PropTypes.func.isRequired,
}

const mapStateToProps = (state, ownProps) => {
    const urlViewId = ownProps.params.viewId

    return {
        activeView: viewsSelectors.getActiveView(state),
        hasActiveView: viewsSelectors.hasActiveView(state),
        users: getUsers(state),
        urlViewId,
        views: state.views,
    }
}

const mapDispatchToProps = {
    fetchPage: viewsActions.fetchPage,
}

export default connect(mapStateToProps, mapDispatchToProps)(UserListContainer)
