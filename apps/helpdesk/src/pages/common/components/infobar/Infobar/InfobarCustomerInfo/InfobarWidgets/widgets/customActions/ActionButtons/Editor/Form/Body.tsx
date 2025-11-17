import { ContentType } from 'models/api/types'
import JsonField from 'pages/common/forms/JsonField'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'

import type { Action, OnChangeAction } from '../../../types'
import Parameters from './Parameters'

import css from './Body.less'

type Props = {
    body: Action['body']
    onChange: OnChangeAction
}

const Body = ({ body, onChange }: Props) => (
    <>
        <div className={css.formParamSection}>Body</div>
        <RadioFieldSet
            className="mb-4"
            options={[
                { value: ContentType.Json, label: ContentType.Json },
                { value: ContentType.Form, label: ContentType.Form },
            ]}
            selectedValue={body.contentType}
            onChange={(value) => onChange('body.contentType', value)}
        />

        {body.contentType === ContentType.Form ? (
            <Parameters
                addLabel="Body Parameter"
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
    </>
)

export default Body
