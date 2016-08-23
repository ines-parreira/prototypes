import React, {PropTypes} from 'react'
import {renderTemplate} from '../../../../common/utils/template'
import InfobarWidgetField from './InfobarWidgetField'

export default class InfobarWidget extends React.Component {
    render() {
        const {widget, widgets, object, currentUser} = this.props

        if (!object || !widget.root) {
            return null
        }

        let header = ''
        if (widget.title) {
            header = (
                <div className="header">{renderTemplate(widget.title, {self: object.toJS()})}</div>
            )
        }

        return (
            <div className="infobar-card ui card">
                <div className="content">
                    {header}
                    <div className="fields">
                        {widget.fields.map((field) => (
                            <InfobarWidgetField
                                key={field.id}
                                object={object}
                                field={field}
                                widgets={widgets}
                                currentUser={currentUser}
                            />
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}

InfobarWidget.propTypes = {
    widget: PropTypes.object,
    widgets: PropTypes.object,
    object: PropTypes.object,
    currentUser: PropTypes.object
}
