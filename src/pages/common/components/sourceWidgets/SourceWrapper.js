import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import {fromJS} from 'immutable'
import {areSourcesReady, jsonToWidgets} from '../infobar/utils'

import SourceWidgets from './SourceWidgets'

export default class SourceWrapper extends React.Component {
    constructor(props) {
        super(props)

        this.widgetsTemplate = fromJS([])
    }

    componentWillReceiveProps(nextProps) {
        const {sources, widgets} = nextProps

        const context = widgets.get('currentContext', '')

        const hasWidgetsTemplates = !this.widgetsTemplate.isEmpty()

        const shouldGenerateWidgets = areSourcesReady(sources)
            && !hasWidgetsTemplates

        // generate widgets template from incoming json and use it to display source widgets
        // i.e. the things you can drag into the infobar
        if (shouldGenerateWidgets) {
            this.widgetsTemplate = fromJS(jsonToWidgets(sources.toJS(), context))
        }
    }

    _leaveEditionMode = () => {
        const {actions, context, identifier} = this.props
        actions.widgets.stopEditionMode()
        browserHistory.push(`/app/${context}/${identifier}`)
    }

    render() {
        const {
            sources,
            widgets
        } = this.props

        const template = this.widgetsTemplate

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
                                The following data comes from your server, after you configured&nbsp;
                                <Link to="/app/integrations/http" target="_blank"><b>HTTP integrations</b></Link>.
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

SourceWrapper.propTypes = {
    context: PropTypes.string.isRequired,
    identifier: PropTypes.string.isRequired,
    sources: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}
