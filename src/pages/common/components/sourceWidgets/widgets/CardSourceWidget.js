import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import _last from 'lodash/last'
import {Card, CardBody} from 'reactstrap'

import DragWrapper from '../../dragging/WidgetsDragWrapper.tsx'
import {stripLastListsFromPath} from '../../infobar/utils.tsx'

import SourceWidget from '../SourceWidget'

class CardSourceWidget extends React.Component {
    render() {
        const {source, widget, template, isParentList} = this.props

        const ap = template.get('absolutePath')
        const tp = template.get('templatePath')

        const className = classnames({
            draggable: !isParentList,
        })

        let displayedTitle = stripLastListsFromPath(ap)
        displayedTitle = _last(displayedTitle)

        return (
            <Card className={className} data-key={template.get('path')}>
                <CardBody className="header">
                    {displayedTitle}
                    {isParentList && <span className="meta"> (list)</span>}
                </CardBody>
                <CardBody className="content">
                    <DragWrapper
                        group={{
                            name: ap.join('.'),
                            pull: true,
                            put: false,
                        }}
                        isEditing
                    >
                        {template.get('widgets', fromJS([])).map((w, i) => {
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
                                />
                            )
                        })}
                    </DragWrapper>
                </CardBody>
            </Card>
        )
    }
}

CardSourceWidget.propTypes = {
    source: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    template: PropTypes.object.isRequired,
    isParentList: PropTypes.bool.isRequired,
}

CardSourceWidget.defaultProps = {
    isParentList: false,
}

export default CardSourceWidget
