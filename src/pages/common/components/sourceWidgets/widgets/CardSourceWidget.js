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
            isParentList,
            editing
        } = this.props

        const ap = widget.get('absolutePath')
        const tp = widget.get('templatePath')

        const className = classnames('ui card', {
            draggable: !isParentList,
        })

        let displayedTitle = stripLastListsFromPath(ap)
        displayedTitle = _last(displayedTitle.split('.'))

        return (
            <div
                className={className}
                data-key={widget.get('path')}
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
                                name: ap,
                                pull: true,
                                put: false
                            }}
                            isEditing
                        >
                            {
                                widget
                                    .get('widgets', fromJS([]))
                                    .map((w, i) => {
                                        const passedWidget = w
                                            .set('templatePath', `${tp}.widgets.${i}`)

                                        return (
                                            <SourceWidget
                                                key={`${passedWidget.get('path')}-${i}`}
                                                source={source}
                                                parent={widget}
                                                widget={passedWidget}
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
    isParentList: PropTypes.bool.isRequired
}

CardSourceWidget.defaultProps = {
    isParentList: false
}

export default CardSourceWidget
