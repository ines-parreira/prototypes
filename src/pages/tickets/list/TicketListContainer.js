import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import DocumentTitle from 'react-document-title'
import {fromJS} from 'immutable'
import {bindActionCreators} from 'redux'
import {fetchTags} from '../../../state/tags/actions'
import MacroContainer from '../common/macros/MacroContainer'
import ComplexTableWrapper from '../../common/components/complexTable/ComplexTableWrapper'
import {compactInteger} from '../../../utils'
import {isCreationUrl} from '../../common/utils/url'
import TicketListActions from './components/TicketListActions'

class TicketListContainer extends React.Component {
    state = {
        isUpdate: true
    }

    componentWillMount() {
        this.props.fetchTags()
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            isUpdate: !isCreationUrl(nextProps.location.pathname, 'tickets')
        })
    }

    render() {
        const {isUpdate} = this.state
        const activeView = this.props.views.get('active', fromJS({}))
        const hasActiveView = !activeView.isEmpty()
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

        return (
            <DocumentTitle title={title}>
                <div className="TicketListContainer">
                    <ComplexTableWrapper
                        isUpdate={isUpdate}
                        askedViewId={this.props.params.viewId}
                        viewsType="ticket-list"
                        items={this.props.tickets.get('items', fromJS([]))}
                        hasBulkActions={!activeView.get('editMode', false)}
                        ActionsComponent={TicketListActions}
                        queryPath="bool.should.0.multi_match.query,bool.should.1.multi_match.query,bool.should.2.nested.query.multi_match.query"
                        searchQuery={{
                            bool: {
                                should: [
                                    {
                                        multi_match: {
                                            query: '',
                                            operator: 'and',
                                            fields: [
                                                'subject^3',
                                                'requester.name',
                                                'sender.name',
                                            ]
                                        }
                                    },
                                    {
                                        multi_match: {
                                            query: '',
                                            type: 'phrase_prefix',
                                            fields: [
                                                'requester.email',
                                                'sender.email'
                                            ]
                                        }
                                    },
                                    {
                                        nested: {
                                            path: 'messages',
                                            query: {
                                                multi_match: {
                                                    query: '',
                                                    type: 'phrase_prefix',
                                                    fields: [
                                                        'messages.source.from.name',
                                                        'messages.source.from.email',
                                                        'messages.source.to.name',
                                                        'messages.source.to.email',
                                                        'messages.body_*'
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }}
                    />
                    <MacroContainer
                        activeView={activeView}
                        disableExternalActions selectionMode
                        selectedItemsIds={this.props.views.getIn(['_internal', 'selectedItemsIds'])}
                    />
                </div>
            </DocumentTitle>
        )
    }
}

TicketListContainer.propTypes = {
    tickets: PropTypes.object.isRequired,
    views: PropTypes.object.isRequired,
    fetchTags: PropTypes.func.isRequired,

    // React Router
    params: PropTypes.object,
    location: PropTypes.object
}

function mapStateToProps(state) {
    return {
        tickets: state.tickets,
        views: state.views,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        fetchTags: bindActionCreators(fetchTags, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketListContainer)
