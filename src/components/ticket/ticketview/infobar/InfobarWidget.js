import React, { PropTypes } from 'react'
import { renderTemplate } from '../../../utils/template'
import InfobarWidgetField from './InfobarWidgetField'

export default class InfobarWidget extends React.Component {
    render() {
        const { widget, widgets, object, currentUser} = this.props
        if (!object) {
            return null
        }

        if (!widget.root) {
            return null
        }

        let header = ''
        if (widget.title) {
            header = (
                <div className="content">
                    <div className="header">{renderTemplate(widget.title, { self: object.toJS() })}</div>
                </div>
            )
        }
        return (
            <div className="infobar-card ui card">
                {header}
                <div className="content">
                    <div className="fields">
                        {widget.fields.map((field) => (
                                <InfobarWidgetField
                                    key={field.id}
                                    object={object}
                                    field={field}
                                    widgets={widgets}
                                    currentUser={currentUser}
                                />
                            )
                        )}
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
