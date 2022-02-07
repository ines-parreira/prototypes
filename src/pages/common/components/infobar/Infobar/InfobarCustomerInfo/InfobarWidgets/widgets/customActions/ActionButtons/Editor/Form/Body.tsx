import React from 'react'
import {FormGroup, Label} from 'reactstrap'

import {ContentType} from 'models/api/types'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
import JsonField from 'pages/common/forms/JsonField'
import {Action, OnChangeAction} from '../../../types'

import Parameters from './Parameters'

type Props = {
    body: Action['body']
    onChange: OnChangeAction
}

const Body = ({body, onChange}: Props) => (
    <FormGroup>
        <Label className="control-label">Body</Label>
        <div className="mb-3">
            <RadioFieldSet
                options={[
                    {value: ContentType.Json, label: ContentType.Json},
                    {value: ContentType.Form, label: ContentType.Form},
                ]}
                selectedValue={body.contentType}
                onChange={(value) => onChange('body.contentType', value)}
            />
        </div>

        {body.contentType === ContentType.Form ? (
            <Parameters
                path={`body.${ContentType.Form}`}
                value={body[ContentType.Form]}
                onChange={onChange}
            />
        ) : (
            <JsonField
                name="json"
                value={body[ContentType.Json]}
                onChange={(value) =>
                    onChange(`body.${ContentType.Json}`, value)
                }
            />
        )}
    </FormGroup>
)

export default Body
