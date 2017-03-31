import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import DragWrapper from '../../dragging/WidgetsDragWrapper'

import InfobarWidget from '../InfobarWidget'

import * as integrationsSelectors from '../../../../../state/integrations/selectors'

@connect((state, ownProps) => {
    const {widget} = ownProps

    // todo(jebarjonet) use integrationId instead of integration type
    // see https://github.com/gorgias/gorgias/issues/1334#issuecomment-290482595
    const integrations = integrationsSelectors.getIntegrationsByTypes(widget.get('type'))(state)

    return {
        integration: integrations.isEmpty() ? fromJS({}) : integrations.first(),
    }
})
class WrapperInfobarWidget extends React.Component {
    static propTypes = {
        integration: ImmutablePropTypes.map.isRequired,
        editing: PropTypes.object,
        source: PropTypes.object.isRequired,
        widget: PropTypes.object.isRequired,
        template: PropTypes.object.isRequired,
        isEditing: PropTypes.bool.isRequired,
        open: PropTypes.bool
    }

    static childContextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
        integrationId: PropTypes.number,
    }

    getChildContext() {
        const integration = this.props.integration || fromJS({})

        return {
            integration,
            integrationId: integration.get('id'),
        }
    }

    _deleteWrapper = (e) => {
        const {template, editing} = this.props

        const ap = template.get('absolutePath')
        const tp = template.get('templatePath')

        e.stopPropagation()
        if (editing) {
            editing.actions.removeEditedWidget(tp, ap)
        }
    }

    render() {
        const {
            widget,
            template,
            isEditing,
            source,
            editing,
        } = this.props

        const ap = template.get('absolutePath')
        const tp = template.get('templatePath')

        return (
            <div className="ui card wrapper draggable">
                <div className="content">
                    {
                        isEditing
                        && (
                            <div className="header clearfix">
                                <span className="tools">
                                    <i
                                        className="red link remove icon"
                                        onClick={this._deleteWrapper}
                                    />
                                </span>
                            </div>
                        )
                    }

                    <DragWrapper
                        actions={editing && editing.actions}
                        sort
                        group={{
                            name: ap.join('.'),
                            pull: false,
                            put: true
                        }}
                        templatePath={tp}
                        isEditing={isEditing}
                        watchDrop
                    >
                        {
                            template
                                .get('widgets', fromJS([]))
                                .map((w, i) => {
                                    const passedTemplate = w
                                        .set('templatePath', `${tp}.widgets.${i}`)

                                    return (
                                        <InfobarWidget
                                            key={`${passedTemplate.get('path')}-${i}`}
                                            source={source}
                                            parent={template}
                                            widget={widget}
                                            template={passedTemplate}
                                            editing={editing}
                                            isEditing={isEditing}
                                        />
                                    )
                                })
                        }
                    </DragWrapper>
                </div>
            </div>
        )
    }
}

export default WrapperInfobarWidget

