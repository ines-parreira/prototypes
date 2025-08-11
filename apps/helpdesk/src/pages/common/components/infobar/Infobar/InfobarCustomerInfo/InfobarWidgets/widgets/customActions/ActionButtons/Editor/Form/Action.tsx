import { Label } from '@gorgias/axiom'

import { AVAILABLE_HTTP_METHODS } from 'config'
import { httpMethodsWithBody } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/httpMethodsWithBody'
import {
    Action as ActionType,
    OnChangeAction,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import InputField from 'pages/common/forms/input/InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { validateWebhookURL, validateWebhookURLToPattern } from 'utils'

import Body from './Body'
import Parameters from './Parameters'

import css from './Actions.less'

type Props = {
    action: ActionType
    onChange: OnChangeAction
}

export default function Action({ action, onChange }: Props) {
    return (
        <div className="http">
            <div className={css.formParamRow}>
                <div className={css.formParamSelect}>
                    <Label htmlFor="httpMethod" className={css.selectLabel}>
                        Method
                    </Label>
                    <SelectField
                        id="httpMethod"
                        showSelectedOption
                        value={action.method}
                        onChange={(value) => onChange('method', value)}
                        options={AVAILABLE_HTTP_METHODS.map((method) => ({
                            value: method,
                            label: method,
                        }))}
                        dropdownMenuClassName={css.longDropdown}
                    />
                </div>
                <div className={css.formParamLargeCol}>
                    <InputField
                        type="text"
                        name="url"
                        label="URL"
                        error={validateWebhookURL(action.url)}
                        value={action.url}
                        onChange={(value) => onChange('url', value)}
                        pattern={validateWebhookURLToPattern(action.url)}
                        isRequired
                    />
                </div>
            </div>
            <div className={css.formParamSection}>Headers</div>
            <Parameters
                addLabel="Header"
                path={`headers`}
                value={action.headers}
                onChange={onChange}
            />

            <div className={css.formParamSection}>Query Parameters</div>
            <Parameters
                path={`params`}
                value={action.params}
                onChange={onChange}
            />

            {httpMethodsWithBody.includes(action.method) && (
                <Body body={action.body} onChange={onChange} />
            )}
        </div>
    )
}
