import React from 'react'
import PropTypes from 'prop-types'

import ReactSortable from './ReactSortable'

/**
 * A wrapper for draggable elements setting the draggable feature
 */
class DragWrapper extends React.Component {
    render() {
        const {
            children,
            actions,
            sort,
            group,
            templatePath,
            isEditing,
            watchDrop,
        } = this.props

        if (!isEditing) {
            return children
        }

        return (
            <ReactSortable
                options={{
                    sort,
                    draggable: '.draggable',
                    group,
                    animation: 150,
                    onStart() {
                        actions.stopWidgetEdition()
                        actions.drag(group.name)
                    },
                    onEnd() {
                        actions.cancelDrag()
                    },
                }}
                onChange={(order, sortable, evt) => {
                    if (watchDrop) {
                        if (evt.type === 'add' || evt.type === 'update') {
                            const key = evt.item.dataset.key
                            actions.drop(
                                evt.type,
                                templatePath,
                                key,
                                evt.newIndex,
                                evt.oldIndex
                            )
                        }
                    }
                }}
            >
                {children}
            </ReactSortable>
        )
    }
}

DragWrapper.propTypes = {
    actions: PropTypes.object,
    children: PropTypes.node,
    group: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired,
    sort: PropTypes.bool,
    templatePath: PropTypes.string,
    watchDrop: PropTypes.bool,
}

DragWrapper.defaultProps = {
    sort: false,
    templatePath: '',
    watchDrop: false,
}

export default DragWrapper
