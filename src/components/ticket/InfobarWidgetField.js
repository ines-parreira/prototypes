import React, {PropTypes} from 'react'
import {renderTemplate} from '../utils/template'
import InfobarWidget from './InfobarWidget'

export default class InfobarWidgetField extends React.Component {
    render() {
        const {object, field, widgets} = this.props
        let value = null

        switch (field.type) {
            case 'field':
                value = (
                    <span className="field-value">{renderTemplate(field.value.value, {self: object.toJS()})}</span>
                )
                break
            case 'widget':
                let widget = null
                for (const w of widgets) {
                    if (w.id === parseInt(field.value.value, 10)) {
                        widget = w
                        // we need to set this to true, otherwise it will not be displayed
                        widget.root = true
                        break
                    }
                }

                const path = widget.object_path.split('.')
                const obj = object.getIn(path.slice(1))

                if (widget.type === 'list') {
                    value = obj.map((o, i) => {
                        return (
                            <InfobarWidget
                                key={`${widget.id}-${i}`}
                                object={o}
                                widget={widget}
                                widgets={widgets}
                            />
                        )
                    })
                } else {
                    value = (
                        <InfobarWidget
                            object={object}
                            widget={widget}
                            widgets={widgets}
                        />
                    )
                }
                break
            default:
                break
        }

        return (
            <div className="field">
                <span className="field-label">{field.label}:</span> {value}
            </div>
        )
    }
}

InfobarWidgetField.propTypes = {
    object: PropTypes.object,
    widgets: PropTypes.object,
    field: PropTypes.object
}
