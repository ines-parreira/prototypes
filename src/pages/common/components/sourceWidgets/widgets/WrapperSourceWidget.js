import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import DragWrapper from '../../dragging/WidgetsDragWrapper'
import {humanizeString} from '../../infobar/utils'
import _last from 'lodash/last'

import SourceWidget from '../SourceWidget'

class WrapperSourceWidget extends React.Component {
    render() {
        const {
            widget,
            source,
            editing,
            parent,
        } = this.props

        const ap = widget.get('absolutePath')
        const tp = widget.get('templatePath')
        const children = widget.get('widgets', fromJS([]))

        if (children.isEmpty()) {
            return null
        }

        return (
            <div
                className={`ui card wrapper draggable ${parent.get('type')}`}
                data-key={widget.get('path').join('.')}
            >
                <div className="content">
                    <div className="header clearfix">
                        {humanizeString(_last(ap))}
                    </div>
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
                            children
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
        )
    }
}

WrapperSourceWidget.propTypes = {
    editing: PropTypes.object,
    source: PropTypes.object.isRequired,
    parent: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
}

export default WrapperSourceWidget
