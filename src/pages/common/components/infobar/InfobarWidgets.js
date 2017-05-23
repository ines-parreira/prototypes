import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import InfobarWidget from './InfobarWidget'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import DragWrapper from '../dragging/WidgetsDragWrapper'
import {compare} from './../../../../utils'
import {canDisplayWidget} from './utils'
import {getSourcePathFromContext} from '../../../../state/widgets/utils'
import _isEqual from 'lodash/isEqual'
import * as integrationsSelectors from '../../../../state/integrations/selectors'

class InfobarWidgets extends React.Component {
    shouldComponentUpdate(nextProps) {
        return !this.props.source.equals(nextProps.source)
            || !this.props.widgets.equals(nextProps.widgets)
            || !_isEqual(this.props.editing, nextProps.editing)
    }

    _generateWidgets = (displayList, integrations, genericSourcePath) => {
        const {source, widgets, editing} = this.props
        const isEditing = !!(editing && editing.isEditing)

        let preparedDisplayList = fromJS([])

        // Create a list `prepareDisplayList` of item containing enough data to generate widget components.
        // For each widget OR userIntegrationData found in displayList, prepare the widget OR retrieve the associated
        // widget, set it's template `path`, `templatePath` when needed
        displayList.forEach((item, idx) => {
            let widget = null
            let sourcePath = null

            if (item.get('type') === 'widget') {
                widget = item.get('widget', fromJS({}))

                sourcePath = getSourcePathFromContext(widget.get('context'), widget.get('type'))
            } else if (item.get('type') === 'data') {
                const integrationId = item.get('integrationId')

                const integration = integrations.find((i) => i.get('id').toString() === integrationId)

                if (!integration || integrations.isEmpty()) {
                    return
                }

                if (integration.get('type') === 'http') {
                    widget = widgets.find((widget) => widget.get('integration_id') === integration.get('id'))
                } else {
                    widget = widgets.find((widget) => widget.get('type') === integration.get('type'))
                }

                if (!widget) {
                    return
                }

                sourcePath = genericSourcePath.slice()
                sourcePath.push(integrationId)
            }

            const template = widget
                .get('template', fromJS({}))
                .set('path', sourcePath)
                .set('templatePath', `${widget.get('order')}.template`)

            if (!canDisplayWidget(template, source)) {
                return
            }

            preparedDisplayList = preparedDisplayList.push(fromJS({
                widget,
                template,
                open: idx === 0
            }))
        })

        preparedDisplayList = preparedDisplayList.sort((a, b) => {
            return compare(a.getIn(['widget', 'order']), b.getIn(['widget', 'order']))
        })

        // We create the components separately from the rest of the function because we want to assign `templatePath`
        // AFTER having sorted the results by `widget.order`.
        return preparedDisplayList.map((item, i) => {
            const order = item.getIn(['widget', 'order'])
            const newItem = item.set('template', item.get('template').set('templatePath', `${order}.template`))

            return (
                <InfobarWidget
                    key={`${newItem.getIn(['template', 'path']).toString()}-${i}`}
                    source={source}
                    widget={newItem.get('widget')}
                    template={newItem.get('template')}
                    editing={editing}
                    isEditing={isEditing}
                    open={newItem.get('open')}
                />
            )
        })
    }

    render() {
        const {
            context,
            source,
            widgets,
            editing,
            integrations
        } = this.props

        if (!widgets) {
            return null
        }

        const isEditing = !!(editing && editing.isEditing)

        const className = classnames('widgets-list', {
            editing: isEditing,
            dragging: !!(editing && editing.isDragging)
        })

        const genericSourcePath = getSourcePathFromContext(context, 'integrations')
        const integrationDatas = source.getIn(genericSourcePath, fromJS({}))

        const customerWidgets = widgets.filter((widget) => widget.get('type') === 'custom')

        // We build a single list of all elements we want to display
        let displayList = fromJS([])

        integrationDatas.forEach((data, integrationId) => {
            displayList = displayList.push(fromJS({
                type: 'data',
                integrationId
            }))
        })

        customerWidgets.forEach((widget) => {
            displayList = displayList.push(fromJS({
                type: 'widget',
                widget
            }))
        })

        return (
            <div className={className}>
                <DragWrapper
                    actions={editing && editing.actions}
                    sort
                    group={{
                        name: 'root',
                        pull: false,
                        put: true
                    }}
                    isEditing={isEditing}
                    watchDrop
                >
                    {
                        this._generateWidgets(displayList, integrations, genericSourcePath)
                    }
                </DragWrapper>
            </div>
        )
    }
}

InfobarWidgets.propTypes = {
    context: PropTypes.string.isRequired,
    editing: PropTypes.object,
    source: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired,
    integrations: PropTypes.object.isRequired
}

InfobarWidgets.defaultProps = {
    source: {},
}

const mapStateToProps = (state) => {
    return {
        integrations: integrationsSelectors.getIntegrations(state)
    }
}

export default connect(mapStateToProps)(InfobarWidgets)
