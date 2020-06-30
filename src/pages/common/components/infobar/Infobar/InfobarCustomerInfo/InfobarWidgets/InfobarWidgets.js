import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import _isEqual from 'lodash/isEqual'

import DragWrapper from '../../../../dragging/WidgetsDragWrapper'
import {compare} from '../../../../../../../utils'
import {canDisplayWidget} from '../../../utils'
import {getSourcePathFromContext} from '../../../../../../../state/widgets/utils'
import * as integrationsSelectors from '../../../../../../../state/integrations/selectors'

import InfobarWidget from './InfobarWidget'
import PlaceholderWidget from './widgets/PlaceholderWidget'
import {infobarWidgetShouldRender} from './predicates'
import css from './InfobarWidgets.less'
import {InfobarTabs} from './InfobarTabs'

class InfobarWidgets extends React.Component {
    shouldComponentUpdate(nextProps) {
        return (
            !this.props.source.equals(nextProps.source) ||
            !this.props.widgets.equals(nextProps.widgets) ||
            !_isEqual(this.props.editing, nextProps.editing)
        )
    }

    _getPreparedDisplayList = (
        displayList,
        integrations,
        genericSourcePath
    ) => {
        const {source, widgets, editing} = this.props
        const isEditing = !!(editing && editing.isEditing)

        let preparedDisplayList = fromJS([])

        // Create a list `prepareDisplayList` of item containing enough data to generate widget components.
        // For each widget OR customerIntegrationData found in displayList, prepare the widget OR retrieve the
        // associated widget, set it's template `path`, `templatePath` when needed
        displayList.forEach((item, idx) => {
            let widget = null
            let sourcePath = genericSourcePath.slice()

            if (item.get('type') === 'widget') {
                widget = item.get('widget', fromJS({}))

                if (widget.get('type') !== 'custom') {
                    let selectedIntegrations = null
                    let integration = null

                    if (widget.get('type') !== 'http') {
                        selectedIntegrations = integrations.filter(
                            (i) =>
                                i.get('type').toString() === widget.get('type')
                        )
                    } else {
                        selectedIntegrations = integrations.filter(
                            (i) =>
                                i.get('id').toString() ===
                                widget.get('integration_id').toString()
                        )
                    }

                    if (
                        !selectedIntegrations ||
                        selectedIntegrations.isEmpty()
                    ) {
                        return
                    }

                    selectedIntegrations.forEach((selectedIntegration) => {
                        const tmpSourcePath = sourcePath.slice()
                        tmpSourcePath.push(
                            selectedIntegration.get('id').toString()
                        )

                        // If there's something in source at sourcePath, the customer has data for this integration,
                        // so we can display the widget
                        if (source.getIn(tmpSourcePath)) {
                            integration = selectedIntegration
                        }
                    })

                    if (!integration) {
                        return
                    }

                    sourcePath.push(integration.get('id').toString())
                } else {
                    sourcePath = getSourcePathFromContext(
                        widget.get('context'),
                        widget.get('type')
                    )
                }
            } else if (item.get('type') === 'data') {
                const integrationId = item.get('integrationId')

                const integration = integrations.find(
                    (i) => i.get('id').toString() === integrationId
                )

                if (!integration || integrations.isEmpty()) {
                    return
                }

                if (integration.get('type') === 'http') {
                    widget = widgets.find(
                        (widget) =>
                            widget.get('integration_id') ===
                            integration.get('id')
                    )
                } else {
                    widget = widgets.find(
                        (widget) =>
                            widget.get('type') === integration.get('type')
                    )
                }

                if (!widget) {
                    return
                }

                sourcePath.push(integrationId)
            }

            const template = widget
                .get('template', fromJS({}))
                .set('path', sourcePath)
                .set('templatePath', `${widget.get('order')}.template`)

            if (!isEditing && !canDisplayWidget(template, source)) {
                return
            }

            preparedDisplayList = preparedDisplayList.push(
                fromJS({
                    widget,
                    template,
                    open: idx === 0,
                })
            )
        })

        // Here we add the non-displayed widgets to the list.
        if (isEditing) {
            const displayedWidgetsIds = preparedDisplayList.map((item) =>
                item.getIn(['widget', 'id'])
            )
            const nonDisplayedWidgets = widgets.filter(
                (widget) => !displayedWidgetsIds.includes(widget.get('id'))
            )

            const nonDisplayedItems = nonDisplayedWidgets.map((widget) => {
                const template = widget
                    .get('template', fromJS({}))
                    .set('path', genericSourcePath)
                    .set('templatePath', `${widget.get('order')}.template`)

                return fromJS({
                    widget,
                    template,
                    open: false,
                    type: 'placeholder',
                })
            })

            preparedDisplayList = preparedDisplayList.concat(nonDisplayedItems)
        }

        return preparedDisplayList.sort((a, b) =>
            compare(a.getIn(['widget', 'order']), b.getIn(['widget', 'order']))
        )
    }

    _renderWidgets(preparedDisplayList) {
        const {source, editing} = this.props
        const isEditing = !!(editing && editing.isEditing)

        if (!infobarWidgetShouldRender(source)) {
            return null
        }

        // We create the components separately from the rest of the function because we want to assign `templatePath`
        // AFTER having sorted the results by `widget.order`.
        return preparedDisplayList.map((item, index) => {
            const order = item.getIn(['widget', 'order'])
            const newItem = item.set(
                'template',
                item.get('template').set('templatePath', `${order}.template`)
            )

            if (item.get('type') === 'placeholder') {
                return (
                    <PlaceholderWidget
                        key={`${newItem
                            .getIn(['template', 'path'])
                            .toString()}-${index}`}
                        source={source}
                        widget={newItem.get('widget')}
                        template={newItem.get('template')}
                        editing={editing}
                        isEditing={isEditing}
                        open={newItem.get('open')}
                    />
                )
            }

            return (
                <InfobarWidget
                    key={`${newItem
                        .getIn(['template', 'path'])
                        .toString()}-${index}`}
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
            integrations,
            displayTabs,
        } = this.props

        if (!widgets) {
            return null
        }

        const isEditing = !!(editing && editing.isEditing)

        const className = classnames('widgets-list', css.container, {
            editing: isEditing,
            dragging: !!(editing && editing.isDragging),
        })

        const genericSourcePath = getSourcePathFromContext(
            context,
            'integrations'
        )
        const integrationDatas = source.getIn(genericSourcePath, fromJS({}))

        const customerWidgets = widgets.filter(
            (widget) => widget.get('type') === 'custom'
        )

        // We build a single list of all elements we want to display
        let displayList = fromJS([])

        if (!isEditing) {
            integrationDatas.forEach((data, integrationId) => {
                displayList = displayList.push(
                    fromJS({
                        type: 'data',
                        integrationId,
                    })
                )
            })
        }

        ;(isEditing ? widgets : customerWidgets).forEach((widget) => {
            displayList = displayList.push(
                fromJS({
                    type: 'widget',
                    widget,
                })
            )
        })

        const preparedDisplayList = this._getPreparedDisplayList(
            displayList,
            integrations,
            genericSourcePath
        )

        return (
            <>
                {displayTabs && !isEditing && (
                    <InfobarTabs preparedDisplayList={preparedDisplayList} />
                )}
                <div className={className}>
                    <DragWrapper
                        actions={editing && editing.actions}
                        sort
                        group={{
                            name: 'root',
                            pull: false,
                            put: true,
                        }}
                        isEditing={isEditing}
                        watchDrop
                    >
                        {this._renderWidgets(preparedDisplayList)}
                    </DragWrapper>
                </div>
            </>
        )
    }
}

InfobarWidgets.propTypes = {
    context: PropTypes.string.isRequired,
    editing: PropTypes.object,
    source: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired,
    integrations: PropTypes.object.isRequired,
    displayTabs: PropTypes.bool.isRequired,
}

InfobarWidgets.defaultProps = {
    source: {},
}

const mapStateToProps = (state) => {
    return {
        integrations: integrationsSelectors.getIntegrations(state),
    }
}

export default connect(mapStateToProps)(InfobarWidgets)
