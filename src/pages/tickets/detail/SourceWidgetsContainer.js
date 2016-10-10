import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {Link, browserHistory} from 'react-router'
import {fromJS} from 'immutable'
import * as WidgetsActions from '../../../state/widgets/actions'
import * as TicketActions from '../../../state/ticket/actions'
import {areSourcesReady, jsonToWidgets} from './components/infobar/utils'

import SourceWidgets from './components/source-widgets/SourceWidgets'

class SourceWidgetsContainer extends React.Component {
    constructor(props) {
        super(props)

        this.ticketWidgetsTemplate = fromJS([])
    }

    componentWillMount() {
        const {actions, params} = this.props
        actions.ticket.fetchTicket(params.ticketId)
    }

    componentWillReceiveProps(nextProps) {
        const {ticket, widgets} = nextProps

        const context = widgets.get('currentContext', '')

        const hasWidgetsTemplates = !this.ticketWidgetsTemplate.isEmpty()

        const sources = fromJS({
            ticket
        })

        const shouldGenerateWidgets = areSourcesReady(sources)
            && !hasWidgetsTemplates

        // generate widgets template from incoming json and use it to display source widgets
        // i.e. the things you can drag into the infobar
        if (shouldGenerateWidgets) {
            this.ticketWidgetsTemplate = fromJS(jsonToWidgets(sources.toJS(), context))
        }
    }

    _leaveEditionMode = () => {
        const {actions, params} = this.props
        actions.widgets.stopEditionMode()
        browserHistory.push(`/app/ticket/${params.ticketId}`)
    }

    render() {
        const {
            ticket,
            widgets
        } = this.props

        const sources = fromJS({
            ticket
        })

        const template = this.ticketWidgetsTemplate

        const isDragging = widgets.getIn(['_internal', 'drag', 'isDragging'])

        return (
            <div>
                <h1>
                    Manage widgets
                    <i
                        className="icon remove grey right floated link"
                        onClick={this._leaveEditionMode}
                    />
                </h1>

                <p>
                    Drag and drop the values below into the sidebar to preview how they will look like next to your
                    tickets.
                </p>

                <div className="source-widgets">
                    <div className="ui card data-fields">
                        <div className="header">
                            <div className="title">Customer data</div>
                            <div>
                                The following data comes from your server, after you configured <Link
                                to="/app/integrations/http" target="_blank"><b>HTTP integrations</b></Link>.
                            </div>
                        </div>
                        <div className="content">
                            <SourceWidgets
                                source={sources}
                                widgets={template}
                                editing={{
                                    isDragging,
                                    actions: this.props.actions.widgets
                                }}
                            />
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}

SourceWidgetsContainer.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(SourceWidgetsContainer)
