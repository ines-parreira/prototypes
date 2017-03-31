import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import DragWrapper from '../../dragging/WidgetsDragWrapper'
import {humanizeString} from '../../../../../utils'
import _last from 'lodash/last'

import SourceWidget from '../SourceWidget'

class WrapperSourceWidget extends React.Component {
    render() {
        const {
            widget,
            template,
            source,
            editing,
            parent,
        } = this.props

        const ap = template.get('absolutePath')
        const tp = template.get('templatePath')
        const children = template.get('widgets', fromJS([]))

        if (children.isEmpty()) {
            return null
        }

        return (
            <div
                className={`ui card wrapper draggable ${parent.get('type')}`}
                data-key={template.get('path').join('.')}
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
        )
    }
}

WrapperSourceWidget.propTypes = {
    editing: PropTypes.object,
    source: PropTypes.object.isRequired,
    parent: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    template: PropTypes.object.isRequired,
}

export default WrapperSourceWidget
