import React, {PropTypes} from 'react'
import InfobarWidget from './InfobarWidget'
import {fromJS} from 'immutable'
import {DEFAULT_SOURCE_PATH} from '../../../../../config'

class InfobarWidgets extends React.Component {
    render() {
        const {
            source,
            widgets,
            editing
        } = this.props

        // check if widgets configuration has a root widget
        const hasRootWidget = !!widgets.find((value) => {
            return value.get('path') === DEFAULT_SOURCE_PATH
        })

        const rootWidgetOnDrag = {
            type: 'card',
            path: DEFAULT_SOURCE_PATH
        }

        return (
            <div>
                {
                    // add a root empty widget if there is no
                    // and if the dragged component can be dropped there
                    !hasRootWidget && editing && editing.isDragging && editing.canDrop(DEFAULT_SOURCE_PATH) && (
                        <InfobarWidget
                            source={source}
                            widget={fromJS(rootWidgetOnDrag)}
                            editing={editing}
                        />
                    )
                }

                {(() => {
                    return widgets.map((widget, i) => {
                        const passedWidget = widget
                            .set('templatePath', i.toString())

                        return (
                            <InfobarWidget
                                key={i}
                                source={source}
                                widget={passedWidget}
                                editing={editing}
                            />
                        )
                    })
                })()}
            </div>
        )
    }
}

InfobarWidgets.propTypes = {
    editing: PropTypes.object,
    source: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired
}

InfobarWidgets.defaultProps = {
    source: {},
}

export default InfobarWidgets
