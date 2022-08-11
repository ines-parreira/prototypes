import React, {Component, MouseEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {Map} from 'immutable'

import {getIntegrationById} from 'state/integrations/selectors'
import {RootState} from 'state/types'
import {WIDGET_COLOR_SUPPORTED_TYPES} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/constants.js'

import cssWrapper from './Wrapper.less'
import css from './Placeholder.less'

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

export class Placeholder extends Component<
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

        const widgetType = widget.get('type') as string
        const colorClassNames = []
        if (WIDGET_COLOR_SUPPORTED_TYPES.includes(widgetType))
            colorClassNames.push(cssWrapper[widgetType])
        if (!colorClassNames.length)
            colorClassNames.push(cssWrapper.placeholder)

        return (
            <div
                className={classnames(
                    cssWrapper.widgetWrapper,
                    css.wrapper,
                    [colorClassNames],
                    'draggable'
                )}
            >
                <div className={css.card}>
                    <h5 className={css.title}>
                        {integration
                            ? `Widget for ${
                                  integration.get('name') as string
                              } data`
                            : `Widget for ${this._renderWidgetType(
                                  widget.get('type')
                              )} data`}
                    </h5>
                    <i
                        className={classnames(
                            css.delete,
                            'material-icons',
                            'text-danger'
                        )}
                        onClick={this._deleteWidget}
                    >
                        delete
                    </i>
                </div>
            </div>
        )
    }
}

const connector = connect((state: RootState, ownProps: OwnProps) => {
    const integrationId = ownProps.widget.get('integration_id')

    return {
        integration: integrationId
            ? getIntegrationById(integrationId)(state)
            : null,
    }
})

export default connector(Placeholder)
