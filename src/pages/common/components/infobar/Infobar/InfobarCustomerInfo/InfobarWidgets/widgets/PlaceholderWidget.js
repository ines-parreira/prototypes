// @flow
import React from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import _capitalize from 'lodash/capitalize'

import type {Map} from 'immutable'

import {Card, CardBody} from 'reactstrap'

import * as integrationSelectors from '../../../../../../../../state/integrations/selectors'

import css from './CardInfobarWidget.less'

type Props = {
    widget: Map<string, *>,
    template: Map<string, *>,
    editing: Object,
    integration: ?Map<string, *>,
}

@connect((state, ownProps) => {
    const integrationId = ownProps.widget.get('integration_id')

    return {
        integration: integrationId
            ? integrationSelectors.getIntegrationById(integrationId)(state)
            : null,
    }
})
export default class PlaceholderWidget extends React.Component<Props> {
    _renderWidgetType = (widgetType: string): string => {
        if (widgetType === 'smooch_inside') {
            return 'chat'
        }

        return widgetType
    }

    _deleteWidget = (evt: Object) => {
        const {template, editing} = this.props

        const absolutePath: Array<string | number> = template.get('path')
        const templatePath: string = template.get('templatePath')

        evt.stopPropagation()

        if (editing) {
            editing.actions.removeEditedWidget(templatePath, absolutePath)
        }
    }

    render() {
        const {widget, integration} = this.props

        return (
            <Card
                className={classnames(
                    css.component,
                    css.placeholder,
                    'wrapper transparent draggable'
                )}
            >
                <CardBody className="clearfix">
                    <span className="tools">
                        <i
                            className="material-icons text-danger clickable"
                            onClick={this._deleteWidget}
                        >
                            close
                        </i>
                    </span>
                    <h5 className={classnames(css.title)}>
                        {integration
                            ? `Widget for ${integration.get('name')} data`
                            : `Widget for ${_capitalize(
                                  this._renderWidgetType(widget.get('type'))
                              )} data`}
                    </h5>
                </CardBody>
            </Card>
        )
    }
}
