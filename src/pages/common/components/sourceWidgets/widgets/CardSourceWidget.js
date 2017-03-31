import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import DragWrapper from '../../dragging/WidgetsDragWrapper'
import {stripLastListsFromPath} from '../../infobar/utils'
import _last from 'lodash/last'

import SourceWidget from '../SourceWidget'

class CardSourceWidget extends React.Component {
    render() {
        const {
            source,
            widget,
            template,
            isParentList,
            editing
        } = this.props

        const ap = template.get('absolutePath')
        const tp = template.get('templatePath')

        const className = classnames('ui card', {
            draggable: !isParentList,
        })

        let displayedTitle = stripLastListsFromPath(ap)
        displayedTitle = _last(displayedTitle)

        return (
            <div
                className={className}
                data-key={template.get('path')}
            >
                <div className="content">
                    <div className="header clearfix">
                        {displayedTitle}
                        {isParentList && <span className="meta"> (list)</span>}
                    </div>
                    <div className="content">
                        <DragWrapper
                            actions={editing && editing.actions}
                            group={{
                                name: ap.join('.'),
                                pull: true,
                                put: false
                            }}
                            isEditing
                        >
                            {
                                template
                                    .get('widgets', fromJS([]))
                                    .map((w, i) => {
                                        const passedTemplate = w
                                            .set('templatePath', `${tp}.widgets.${i}`)

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
                                    })
                            }
                        </DragWrapper>
                    </div>
                </div>
            </div>
        )
    }
}

CardSourceWidget.propTypes = {
    editing: PropTypes.object,
    source: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    template: PropTypes.object.isRequired,
    isParentList: PropTypes.bool.isRequired
}

CardSourceWidget.defaultProps = {
    isParentList: false
}

export default CardSourceWidget
