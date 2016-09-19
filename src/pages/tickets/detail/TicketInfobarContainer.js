import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {Link} from 'react-router'
import * as WidgetActions from '../../../state/widgets/actions'
import Infobar from './components/infobar/Infobar'
import InfobarWidgets from './components/infobar/InfobarWidgets'
import {fromJS} from 'immutable'
import {areSourcesReady, canDrop} from './components/infobar/utils'
import {Loader} from '../../common/components/Loader'

class TicketsInfobarContainer extends React.Component {
    componentWillMount() {
        const fetch = this.props.actions.fetchWidgets()

        // if editing, start in edition mode when widgets have been fetched
        if (this.props.route.isEditingWidgets) {
            // start edition mode
            fetch.then(this.props.actions.startEdition)
        }
    }

    componentWillReceiveProps(nextProps) {
        this.ticketTemplate = nextProps.widgets
            .get('items')
            .find((w) => w.get('context', '') === 'ticket', null, fromJS({}))
            .get('template', fromJS([]))

        if (nextProps.widgets.getIn(['_internal', 'hasFetchedWidgets'])) {
            const sources = fromJS({
                ticket: nextProps.ticket
            })

            // if no widgets, generate them from incoming json
            if (areSourcesReady(sources) && this.ticketTemplate.isEmpty() && !nextProps.widgets.getIn(['_internal', 'hasGeneratedWidgets'])) {
                nextProps.actions.generateAndSetWidgets(sources)
            }
        }
    }

    render() {
        const sources = fromJS({
            ticket: this.props.ticket
        })

        const isEditing = this.props.route.isEditingWidgets

        const widgets = isEditing
            ? this.props.widgets.getIn(['_internal', 'editedTemplate'])
            : this.ticketTemplate || fromJS([])

        // for now we want to display the bar all the time, even if empty
        // const shouldDisplayBar = source && !source.isEmpty() && !widgets.isEmpty()
        //
        // if (!shouldDisplayBar) {
        //     return null
        // }

        const isDragging = this.props.widgets.getIn(['_internal', 'drag', 'isDragging'])

        return (
            <Infobar>
                <div className="infobar-content">
                    <div className="infobar-box">
                        {
                            areSourcesReady(sources) && (
                                <div>
                                    {
                                        // hiding edit button for now
                                        false && !isEditing && (
                                            <Link
                                                className="ui green button"
                                                onClick={this.props.actions.startEdition}
                                                to={`/app/ticket/${this.props.params.ticketId}/edit-widgets`}
                                            >
                                                Edit
                                            </Link>
                                        )
                                    }
                                    {
                                        isEditing && (
                                            <div className="ui message">
                                                <p>
                                                    Currently editing
                                                </p>
                                                <Link
                                                    className="ui red button"
                                                    onClick={this.props.actions.stopEdition}
                                                    to={`/app/ticket/${this.props.params.ticketId}`}
                                                >
                                                    Stop edition
                                                </Link>
                                                <button
                                                    className="ui green button"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        )
                                    }

                                    {
                                        !this.props.widgets.getIn(['_internal', 'hasFetchedWidgets']) ? (
                                            <Loader />
                                        ) : (
                                            <InfobarWidgets
                                                source={sources}
                                                title={this.props.ticket.getIn(['requester', 'name'])}
                                                widgets={widgets}
                                                editing={isEditing ? {
                                                    isEditing,
                                                    isDragging,
                                                    _internal: this.props.widgets.get('_internal', fromJS({})),
                                                    actions: this.props.actions,
                                                    canDrop: (targetAbsolutePath, targetTemplateParent) => {
                                                        const sourceAbsolutePath = this.props.widgets.getIn(['_internal', 'drag', 'absolutePath'])
                                                        return isDragging
                                                            && canDrop(sourceAbsolutePath, widgets, targetAbsolutePath, targetTemplateParent)
                                                    }
                                                } : undefined}
                                            />
                                        )
                                    }
                                </div>
                            )
                        }
                    </div>
                </div>
            </Infobar>
        )
    }
}

TicketsInfobarContainer.propTypes = {
    params: PropTypes.object,
    widgets: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        widgets: state.widgets,
        ticket: state.ticket,
        currentUser: state.currentUser
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(WidgetActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketsInfobarContainer)
