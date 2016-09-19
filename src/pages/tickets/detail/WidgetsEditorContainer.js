import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import * as WidgetsActions from '../../../state/widgets/actions'
import * as TicketActions from '../../../state/ticket/actions'

import InfobarWidgets from './components/infobar/InfobarWidgets'
import {jsonToTemplate} from './components/infobar/utils'

// import JsonSource from './components/widgets-editor/JsonSource'

class WidgetsEditorContainer extends React.Component {
    componentWillMount() {
        this.props.actions.ticket.fetchTicket(this.props.params.ticketId, () => {
            this.props.actions.widgets.startEdition()
        })
    }

    render() {
        const {
            ticket,
            widgets,
            actions
        } = this.props

        const drag = widgets.getIn(['_internal', 'drag'], fromJS({}))
        const isDragging = drag.get('isDragging', false)

        const sources = fromJS({
            ticket
        })

        const template = fromJS(jsonToTemplate(sources.toJS()))

        return (
            <div>
                {
                    isDragging && (
                        <div className="ui message">
                            <p>
                                Dragging <b>{drag.get('absolutePath')}</b>
                            </p>
                            <button
                                className="ui orange button"
                                onClick={actions.widgets.cancelDrag}
                            >
                                Cancel
                            </button>
                        </div>
                    )
                }

                <InfobarWidgets
                    source={sources}
                    widgets={template}
                />
            </div>
        )
    }
}

/*

 <JsonSource
 json={source.toJS()}
 actions={actions.widgets}
 />
 */

WidgetsEditorContainer.propTypes = {
    params: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        ticket: state.ticket,
        widgets: state.widgets
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            ticket: bindActionCreators(TicketActions, dispatch),
            widgets: bindActionCreators(WidgetsActions, dispatch)
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WidgetsEditorContainer)
