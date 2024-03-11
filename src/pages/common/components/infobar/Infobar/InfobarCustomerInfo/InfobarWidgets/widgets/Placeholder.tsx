import React, {Component, MouseEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {Map} from 'immutable'

import {getIntegrationById} from 'state/integrations/selectors'
import {removeEditedWidget} from 'state/widgets/actions'
import {RootState} from 'state/types'
import {getWidgetTitle} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/helpers'
import WidgetPanel from 'Infobar/features/WidgetPanel/components/WidgetPanel'

import css from './Placeholder.less'

const PLACEHOLDER_ACCENT_COLOR = 'var(--neutral-grey-4)'

type OwnProps = {
    source: Map<any, any>
    widget: Map<any, any>
    template: Map<any, any>
    isEditing?: boolean
}

export class Placeholder extends Component<
    OwnProps & ConnectedProps<typeof connector>
> {
    _deleteWidget = (evt: MouseEvent) => {
        const {template, isEditing} = this.props

        const absolutePath: string[] = template.get('path')
        const templatePath: string = template.get('templatePath')

        evt.stopPropagation()

        if (isEditing) {
            this.props.dispatch(removeEditedWidget(templatePath, absolutePath))
        }
    }

    _renderWidgetFor() {
        const {source, template, widget, integration} = this.props
        const widgetName = getWidgetTitle({
            source: source?.toJS(),
            widgetType: widget.get('type'),
            appId: widget.get('app_id'),
            template: template?.toJS(),
            integration: integration?.toJS(),
        })

        let widgetFor = `Widget for ${widgetName}`
        if (!widgetName.includes('data')) {
            widgetFor = `${widgetFor} data`
        }

        return widgetFor
    }

    render() {
        const {widget} = this.props

        return (
            <div className={classnames(css.wrapper, 'draggable')}>
                <WidgetPanel
                    widgetType={widget.get('type')}
                    fallbackColor={PLACEHOLDER_ACCENT_COLOR}
                >
                    <div className={css.card}>
                        <h5 className={css.title}>{this._renderWidgetFor()}</h5>
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
                </WidgetPanel>
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
