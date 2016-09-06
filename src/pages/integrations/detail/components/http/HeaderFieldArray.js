import React from 'react'

import { Field } from 'redux-form'
import { InputField } from '../../../../common/components/semantic'

const HeaderFieldArray = ({ fields }) => (
    <div className="field">
        <label>Headers</label>
        {!fields.length && <div>No header</div>}
        {fields.map((header, index) =>
            <div className="fields" key={index}>
                <div className="seven wide field">
                    <Field
                        type="text"
                        name={`${header}.key`}
                        placeholder="Key"
                        component={InputField}
                    />
                </div>
                <div className="seven wide field">
                    <Field
                        type="text"
                        name={`${header}.value`}
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
            Add Header
        </button>
    </div>
)

HeaderFieldArray.propTypes = {
    fields: React.PropTypes.object,
}

export default HeaderFieldArray
