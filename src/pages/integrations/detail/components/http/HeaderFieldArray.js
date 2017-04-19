import React from 'react'
import {Field} from 'redux-form'
import _trim from 'lodash/trim'
import {Button} from 'reactstrap'

import {InputField} from '../../../../common/forms'

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
                        format={value => _trim(value)}
                    />
                    <Field
                        className="seven wide"
                        name={`${header}.value`}
                        placeholder="Value"
                        component={InputField}
                    />
                    <div className="two wide field pull-right">
                        <Button
                            color="danger"
                            type="button"
                            onClick={() => fields.remove(index)}
                        >
                            Remove
                        </Button>
                    </div>
                </div>
            )
        }
        <Button
            size="sm"
            color="secondary"
            type="button"
            onClick={() => fields.push({})}
        >
            Add header
        </Button>
    </div>
)

HeaderFieldArray.propTypes = {
    fields: React.PropTypes.object,
}

export default HeaderFieldArray
