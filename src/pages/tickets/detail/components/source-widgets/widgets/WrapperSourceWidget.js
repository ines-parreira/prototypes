import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import DragWrapper from '../../common/DragWrapper'

import SourceWidget from '../SourceWidget'

class WrapperSourceWidget extends React.Component {
    render() {
        const {
            source,
            widget,
            editing
        } = this.props

        const ap = widget.get('absolutePath')
        const tp = widget.get('templatePath')

        return (
            <div
                className="ui card wrapper draggable"
                data-key={widget.get('path')}
            >
                <div className="content">
                    <div className="header clearfix">
                        {ap}
                    </div>
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
        )
    }
}

WrapperSourceWidget.propTypes = {
    editing: PropTypes.object,
    source: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired
}

export default WrapperSourceWidget
