import React, {Component, MouseEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import _capitalize from 'lodash/capitalize'
import {Map} from 'immutable'
import {Card, CardBody} from 'reactstrap'

import * as integrationSelectors from '../../../../../../../../state/integrations/selectors'
import {RootState} from '../../../../../../../../state/types'

import css from './CardInfobarWidget.less'

type OwnProps = {
    widget: Map<any, any>
    template: Map<any, any>
    editing: {
        actions: {
            removeEditedWidget: (
                templatePath: string,
                absolutePath: Array<string | number>
            ) => void
        }
    }
}

export class PlaceholderWidgetContainer extends Component<
    OwnProps & ConnectedProps<typeof connector>
> {
    _renderWidgetType = (widgetType: string): string => {
        if (widgetType === 'smooch_inside') {
            return 'chat'
        }

        return widgetType
    }

    _deleteWidget = (evt: MouseEvent) => {
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
                            ? `Widget for ${
                                  integration.get('name') as string
                              } data`
                            : `Widget for ${_capitalize(
                                  this._renderWidgetType(widget.get('type'))
                              )} data`}
                    </h5>
                </CardBody>
            </Card>
        )
    }
}

const connector = connect((state: RootState, ownProps: OwnProps) => {
    const integrationId = ownProps.widget.get('integration_id')

    return {
        integration: integrationId
            ? integrationSelectors.getIntegrationById(integrationId)(state)
            : null,
    }
})

export default connector(PlaceholderWidgetContainer)
