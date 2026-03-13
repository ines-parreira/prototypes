import { Component } from 'react'
import type { ComponentProps } from 'react'

import _isEqual from 'lodash/isEqual'
import _some from 'lodash/some'
import { FormGroup, FormText, Label } from 'reactstrap'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import type { HTTPForm } from 'models/integration/types'
import Select from 'pages/common/components/ast/widget/ReactSelect'
import JsonField from 'pages/common/forms/JsonField'
import type { SelectableOption } from 'pages/common/forms/SelectField/types'

import { CONTEXT_SPECIAL_VARIABLE, DEFAULT_FORM } from './constants'

type Props = {
    form: HTTPForm | null
    onChange: (value: HTTPForm) => void
}

type State = {
    cachedForm: HTTPForm
}

export default class JSONBody extends Component<Props, State> {
    presetOptions = [
        { label: 'JSON template', value: DEFAULT_FORM },
        {
            label: 'Send the entire ticket/message JSON',
            value: CONTEXT_SPECIAL_VARIABLE,
        },
    ]

    state = {
        cachedForm: DEFAULT_FORM,
    }

    componentDidMount() {
        if (!this._formIsPresetOption(this.props?.form)) {
            this.setState({ cachedForm: this.props.form })
        }
    }

    _onDropdownChange = (form: Record<string, unknown> | string) => {
        this.props.onChange(
            _isEqual(form, DEFAULT_FORM) ? this.state.cachedForm : form,
        )
    }

    _onJSONChange = (form: HTTPForm) => {
        this.setState({ cachedForm: form })
        this.props.onChange(form)
    }

    _formIsPresetOption = (
        form:
            | string
            | null
            | Record<string, unknown>
            | Array<Record<string, unknown>>,
    ): boolean => {
        const presetOptionsValues = this.presetOptions.map(
            (option) => option.value,
        )
        return _some(presetOptionsValues, (presetOptionValue) =>
            _isEqual(presetOptionValue, form),
        )
    }

    render() {
        const { form } = this.props

        const dropdownValue = this._formIsPresetOption(form)
            ? (form as Record<string, unknown> | string)
            : DEFAULT_FORM

        return (
            <FormGroup>
                <Label className="control-label">
                    Request Body (JSON)
                    <i
                        id="json-body-label"
                        className="material-icons ml-2 text-muted"
                    >
                        info_outline
                    </i>
                </Label>
                <Tooltip target="json-body-label">
                    You can choose to build your own JSON request body using
                    variables, or to send the whole context (which includes the
                    entire ticket, and new message if any) directly.
                </Tooltip>
                <div className="mb-2">
                    <Select
                        options={this.presetOptions as SelectableOption[]}
                        onChange={this._onDropdownChange}
                        value={dropdownValue as any}
                    />
                </div>
                {_isEqual(dropdownValue, DEFAULT_FORM) ? (
                    <div>
                        <JsonField
                            name="http.form"
                            rows="8"
                            value={form}
                            onChange={
                                this._onJSONChange as ComponentProps<
                                    typeof JsonField
                                >['onChange']
                            }
                        />
                        <FormText color="muted">
                            See full list of variables{' '}
                            <a
                                href="https://docs.gorgias.com/macros/macro-variables"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                here
                            </a>
                        </FormText>
                    </div>
                ) : null}
            </FormGroup>
        )
    }
}
