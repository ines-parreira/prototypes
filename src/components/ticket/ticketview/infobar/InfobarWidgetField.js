import React, {PropTypes} from 'react'
import {renderTemplate} from '../../../utils/template'
import {formatDatetime} from '../../../../utils'
import InfobarWidget from './InfobarWidget'

export default class InfobarWidgetField extends React.Component {
    render() {
        const {object, field, widgets, currentUser} = this.props
        let fieldValue = null

        switch (field.type) {
            case 'field': {
                const fieldRawVal = field.value.value
                if (!fieldRawVal) {
                    break
                }
                const fieldVal = renderTemplate(field.value.value, {self: object.toJS()})

                switch (field.value.type) {
                    case 'url':
                        const urlText = fieldVal.length > 28 ? `${fieldVal.slice(0, 25)}...` : fieldVal
                        fieldValue = (
                            <span className="field-value">
                                <a href="{fieldVal}" target="_blank">{urlText}</a>
                            </span>
                        )
                        break
                    case 'datetime':
                        fieldValue = (
                            <span className="field-value datetime">
                                {formatDatetime(fieldVal, currentUser.get('timezone'), 'DD-MM-YYYY hh:mm')}
                            </span>
                        )
                        break
                    default:
                        fieldValue = (
                            <span className="field-value">{fieldVal}</span>
                        )
                        break
                }
                break
            }
            case 'widget': {
                let widget = null
                for (const w of widgets) {
                    if (w.id === parseInt(field.value.value, 10)) {
                        widget = w
                        // we need to set this to true, otherwise it will not be displayed
                        widget.root = true
                        break
                    }
                }

                if (!widget) {
                    break
                }

                const path = widget.object_path.split('.')
                const obj = object.getIn(path.slice(1))

                if (widget.type === 'list') {
                    fieldValue = obj.map((o, i) => (
                        <InfobarWidget
                                key={`${widget.id}-${i}`}
                                object={o}
                                widget={widget}
                                widgets={widgets}
                                currentUser={currentUser}
                        />
                    ))
                } else {
                    fieldValue = (
                        <InfobarWidget
                            object={object}
                            widget={widget}
                            widgets={widgets}
                            currentUser={currentUser}
                        />
                    )
                }
                break
            }
            default:
                break
        }

        let fieldLabel = null
        if (field.label) {
            fieldLabel = <span className="field-label">{field.label}:</span>
        }
        return (
            <div className="field">
                {fieldLabel} {fieldValue}
            </div>
        )
    }
}

InfobarWidgetField.propTypes = {
    object: PropTypes.object,
    widgets: PropTypes.object,
    currentUser: PropTypes.object,
    field: PropTypes.object
}
