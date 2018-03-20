import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import _last from 'lodash/last'
import classnames from 'classnames'
import {Card, CardBody} from 'reactstrap'

import DragWrapper from '../../dragging/WidgetsDragWrapper'
import InfobarWidget from '../InfobarWidget'

import * as integrationsSelectors from '../../../../../state/integrations/selectors'

import css from './CardInfobarWidget.less'

@connect((state, ownProps) => {
    const {widget, template} = ownProps
    let integrations = integrationsSelectors.getIntegrationsByTypes(widget.get('type'))(state)

    const absolutePath = template.get('absolutePath')
    const integrationId = parseInt(_last(absolutePath))

    if (!isNaN(integrationId)) {
        const integration = integrationsSelectors.getIntegrationById(integrationId)(state)
        integrations = integration ? fromJS([integration]) : fromJS([])
    }

    return {
        integration: integrations.isEmpty() ? fromJS({}) : integrations.first()
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
            <Card className={classnames(css.component, 'wrapper transparent draggable')}>
                {
                    isEditing && (
                        <CardBody className="header clearfix">
                            <span className="tools">
                                <i
                                    className="material-icons text-danger clickable"
                                    onClick={this._deleteWrapper}
                                >
                                    close
                                </i>
                            </span>
                        </CardBody>
                    )
                }

                <CardBody className="content">
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
                </CardBody>
            </Card>
        )
    }
}

export default WrapperInfobarWidget

