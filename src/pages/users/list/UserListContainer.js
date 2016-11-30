import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import DocumentTitle from 'react-document-title'
import {fromJS} from 'immutable'
import ComplexTableWrapper from '../../common/components/complexTable/ComplexTableWrapper'
import {compactInteger} from '../../../utils'
import UserListActions from './components/UserListActions'

class UserListContainer extends React.Component {
    render() {
        const activeView = this.props.views.get('active', fromJS({}))
        let title = 'Loading...'
        const hasActiveView = !activeView.isEmpty()

        if (hasActiveView) {
            title = activeView.get('name')
            if (activeView.get('count', 0) > 0) {
                title = `(${compactInteger(activeView.get('count', 0))}) ${title}`
            }
        } else {
            title = 'Wrong view'
        }

        return (
            <DocumentTitle title={title}>
                <div className="UserListContainer">
                    <ComplexTableWrapper
                        askedViewId={this.props.params.viewId}
                        viewsType="user-list"
                        items={this.props.users.get('items', fromJS([]))}
                        hasBulkActions
                        ActionsComponent={UserListActions}
                        queryPath="bool.should.0.multi_match.query"
                        searchQuery={{
                            bool: {
                                should: [
                                    {
                                        multi_match: {
                                            query: '',
                                            operator: 'and',
                                            type: 'phrase_prefix',
                                            fields: [
                                                'name',
                                                'email'
                                            ]
                                        }
                                    }
                                ]
                            }
                        }}
                    />
                </div>
            </DocumentTitle>
        )
    }
}

UserListContainer.propTypes = {
    views: PropTypes.object.isRequired,
    tags: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    currentUser: PropTypes.object,
    settings: PropTypes.object.isRequired,

    // React Router
    params: PropTypes.object,
    location: PropTypes.object
}

function mapStateToProps(state) {
    return {
        views: state.views,
        tags: state.tags,
        schemas: state.schemas,
        users: state.users,
        currentUser: state.currentUser,
        settings: state.settings
    }
}
export default connect(mapStateToProps)(UserListContainer)
