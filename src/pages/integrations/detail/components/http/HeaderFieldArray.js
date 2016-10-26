import React from 'react'

import {Field} from 'redux-form'
import {InputField} from '../../../../common/components/formFields'

const HeaderFieldArray = ({fields}) => (
    <div className="field">
        <label>Headers</label>
        {
            !fields.length
            && <p>No header</p>
        }
        {
            fields.map((header, index) =>
                <div className="fields" key={index}>
                    <Field
                        className="seven wide"
                        name={`${header}.key`}
                        placeholder="Key"
                        component={InputField}
                    />
                    <Field
                        className="seven wide"
                        name={`${header}.value`}
                        placeholder="Value"
                        component={InputField}
                    />
                    <div className="two wide field">
                        <button
                            className="ui tiny red button"
                            type="button"
                            onClick={() => fields.remove(index)}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            )
        }
        <button
            type="button"
            className="ui tiny blue button"
            onClick={() => fields.push({})}
        >
            Add Header
        </button>
    </div>
)

HeaderFieldArray.propTypes = {
    fields: React.PropTypes.object,
}

export default HeaderFieldArray
