import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import _last from 'lodash/last'
import {Card, CardBody, CardTitle} from 'reactstrap'

import DragWrapper from '../../dragging/WidgetsDragWrapper'
import {humanizeString} from '../../../../../utils.ts'
import * as integrationsSelectors from '../../../../../state/integrations/selectors.ts'

import SourceWidget from '../SourceWidget'

class WrapperSourceWidget extends React.Component {
    render() {
        const {
            widget,
            template,
            source,
            editing,
            parent,
            getIntegrationById,
        } = this.props

        const ap = template.get('absolutePath')
        const tp = template.get('templatePath')
        const children = template.get('widgets', fromJS([]))

        if (children.isEmpty()) {
            return null
        }

        const integrationId = parseInt(_last(ap))
        let displayName = null

        // If the last item of the path is an `int`, it's the id of an integration; therefore we display the
        // integration name or type depending on its type.
        // If it's not an `int`, we just display the last item, humanized.
        if (!isNaN(integrationId)) {
            const integration = getIntegrationById(integrationId)

            if (integration.get('type') === 'http') {
                displayName = integration.get('name')
            } else if (integration.get('type') === 'smooch_inside') {
                displayName = 'Chat'
            } else {
                displayName = humanizeString(integration.get('type'))
            }
        } else {
            displayName = humanizeString(_last(ap))
        }

        return (
            <Card
                className={`wrapper draggable ${parent.get('type')}`}
                data-key={template.get('path').join('.')}
            >
                <CardBody className="header">
                    <CardTitle>{displayName}</CardTitle>
                </CardBody>
                <CardBody className="content">
                    <DragWrapper
                        actions={editing && editing.actions}
                        group={{
                            name: ap.join('.'),
                            pull: true,
                            put: false,
                        }}
                        isEditing
                    >
                        {children.map((w, i) => {
                            const passedTemplate = w.set(
                                'templatePath',
                                `${tp}.widgets.${i}`
                            )

                            return (
                                <SourceWidget
                                    key={`${passedTemplate.get('path')}-${i}`}
                                    source={source}
                                    parent={template}
                                    template={passedTemplate}
                                    widget={widget}
                                    editing={editing}
                                />
                            )
                        })}
                    </DragWrapper>
                </CardBody>
            </Card>
        )
    }
}

WrapperSourceWidget.propTypes = {
    editing: PropTypes.object,
    source: PropTypes.object.isRequired,
    parent: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    template: PropTypes.object.isRequired,
    getIntegrationById: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => {
    return {
        getIntegrationById: integrationsSelectors.makeGetIntegrationById(state),
    }
}

export default connect(mapStateToProps)(WrapperSourceWidget)
