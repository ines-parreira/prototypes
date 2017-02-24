import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import DocumentTitle from 'react-document-title'
import {compactInteger} from '../../../utils'
import {isCreationUrl, isSearchUrl} from '../../common/utils/url'
import {getUsers} from '../../../state/users/selectors'

import * as viewsActions from '../../../state/views/actions'
import * as viewsSelectors from '../../../state/views/selectors'

import UserListActions from './components/UserListActions'
import ViewTable from '../../common/components/ViewTable/Page'

class UserListContainer extends React.Component {
    state = {
        isSearch: false,
        isUpdate: true
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            isSearch: isSearchUrl(nextProps.location.pathname, 'users'),
            isUpdate: !isCreationUrl(nextProps.location.pathname, 'users')
        })
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
                <ViewTable
                    type="user"
                    items={users}
                    view={activeView}
                    isUpdate={isUpdate}
                    isSearch={isSearch}
                    urlViewId={urlViewId}
                    ActionsComponent={UserListActions}
                />
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
}

const mapStateToProps = (state, ownProps) => {
    const urlViewId = ownProps.params.viewId

    return {
        getView: viewsSelectors.makeGetView(state),
        getViewIdToDisplay: viewsSelectors.makeGetViewIdToDisplay(state),
        activeView: viewsSelectors.getActiveView(state),
        hasActiveView: viewsSelectors.hasActiveView(state),
        selectedItemsIds: viewsSelectors.getSelectedItemsIds(state),
        users: getUsers(state),
        urlViewId,
        views: state.views,
    }
}

const mapDispatchToProps = {
    setViewActive: viewsActions.setViewActive,
    fetchPage: viewsActions.fetchPage,
}

export default connect(mapStateToProps, mapDispatchToProps)(UserListContainer)
