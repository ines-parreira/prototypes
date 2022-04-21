import React from 'react'
import {FormGroup, Label} from 'reactstrap'

import {AVAILABLE_HTTP_METHODS} from 'config'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import {validateWebhookURL, validateWebhookURLToPattern} from 'utils'

import {
    Action as ActionType,
    OnChangeAction,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import {httpMethodsWithBody} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/httpMethodsWithBody'

import css from '../../ActionButtons.less'

import Parameters from './Parameters'
import Body from './Body'

type Props = {
    action: ActionType
    onChange: OnChangeAction
}

export default function Action({action, onChange}: Props) {
    return (
        <div className="http">
            <div className={css.formParamRow}>
                <div>
                    <DEPRECATED_InputField
                        type="select"
                        name="method"
                        label="Method"
                        value={action.method}
                        onChange={(value) => onChange('method', value)}
                        required
                    >
                        {AVAILABLE_HTTP_METHODS.map((method) => (
                            <option key={method} value={method}>
                                {method}
                            </option>
                        ))}
                    </DEPRECATED_InputField>
                </div>
                <div className={css.formParamLargeCol}>
                    <DEPRECATED_InputField
                        type="text"
                        name="url"
                        label="URL"
                        error={validateWebhookURL(action.url)}
                        value={action.url}
                        onChange={(value) => onChange('url', value)}
                        pattern={validateWebhookURLToPattern(action.url)}
                        required
                    />
                </div>
            </div>
            <FormGroup className="mt-3">
                <Label className="control-label">Headers</Label>
                <Parameters
                    path={`headers`}
                    value={action.headers}
                    onChange={onChange}
                />
            </FormGroup>
            <FormGroup className="mt-3">
                <Label className="control-label">Query Parameters</Label>
                <Parameters
                    path={`params`}
                    value={action.params}
                    onChange={onChange}
                />
            </FormGroup>
            {httpMethodsWithBody.includes(action.method) && (
                <Body body={action.body} onChange={onChange} />
            )}
        </div>
    )
}
