import React from 'react'

import { Field } from 'redux-form'
import { InputField } from '../../../../common/components/semantic'

const ParameterFieldArray = ({ fields }) => (
    <div className="field">
        <label>Parameters</label>
        {!fields.length && <div>No parameter</div>}
        {fields.map((parameter, index) =>
            <div className="fields" key={index}>
                <div className="seven wide field">
                    <Field
                        type="text"
                        name={`${parameter}.key`}
                        placeholder="Key"
                        component={InputField}
                    />
                </div>
                <div className="seven wide field">
                    <Field
                        type="text"
                        name={`${parameter}.value`}
                        placeholder="Value"
                        component={InputField}
                    />
                </div>
                <div className="two wide field">
                    <button
                        className="ui red button"
                        type="button"
                        onClick={() => fields.remove(index)}
                    >
                        Remove
                    </button>
                </div>
            </div>
        )}
        <button
            type="button"
            className="ui grey basic button"
            onClick={() => fields.push({})}
        >
            Add Parameter
        </button>
    </div>
)

ParameterFieldArray.propTypes = {
    fields: React.PropTypes.object,
}


export default ParameterFieldArray
