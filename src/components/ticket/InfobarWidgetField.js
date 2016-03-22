import React, { PropTypes } from 'react'
import { renderTemplate } from '../utils/template'

export default class InfobarWidgetField extends React.Component {
    render() {
        const { object, field } = this.props
        let value = null

        if (field.type === 'field') {
            //console.log('template', field.value.value)
            //console.log('object', object.toJS())
            value = renderTemplate(field.value.value, {
                self: object.toJS()
            })

            if (field.editable) {
                value = (
                    <a href="" target="_blank">{value}</a>
                )
            }
        }

        return (
            <div className="field">
                <span className="field-label">{field.label}:</span> <span className="field-value">{value}</span>
            </div>
        )
    }
}

InfobarWidgetField.propTypes = {
    object: PropTypes.object,
    field: PropTypes.object
}
