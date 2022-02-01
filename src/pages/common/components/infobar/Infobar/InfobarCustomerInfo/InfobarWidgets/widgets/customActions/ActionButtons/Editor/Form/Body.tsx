import React, {memo} from 'react'

import {FormGroup, Label} from 'reactstrap'

import BooleanField from 'pages/common/forms/BooleanField'
import JsonField from '../../../../../../../../../../forms/JsonField'
import {ContentType} from '../../../../../../../../../../../../models/api/types'
import {Action, OnChangeAction} from '../../../types'

import Parameters from './Parameters'

type Props = {
    body: Action['body']
    onChange: OnChangeAction
}

function Body({body, onChange}: Props) {
    let field = (
        <JsonField
            name="json"
            value={body[ContentType.Json]}
            onChange={(value) => onChange(`body.${ContentType.Json}`, value)}
        />
    )

    const isFormData = body.contentType === ContentType.Form

    if (isFormData) {
        field = (
            <Parameters
                path={`body.${ContentType.Form}`}
                value={body[ContentType.Form]}
                onChange={onChange}
            />
        )
    }

    return (
        <FormGroup>
            <Label className="control-label">Body</Label>
            <div className="mb-3">
                <BooleanField
                    type="radio"
                    value={!isFormData}
                    onChange={() =>
                        onChange('body.contentType', ContentType.Json)
                    }
                    label={ContentType.Json}
                />
                <BooleanField
                    type="radio"
                    value={isFormData}
                    onChange={() =>
                        onChange('body.contentType', ContentType.Form)
                    }
                    label={ContentType.Form}
                />
            </div>

            {field}
        </FormGroup>
    )
}

export default memo(Body)
