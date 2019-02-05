// @flow
import React from 'react'
import _isEqual from 'lodash/isEqual'
import _some from 'lodash/some'
import {
    FormGroup,
    FormText,
    Label
} from 'reactstrap'

import Select from '../../../../../common/components/ast/widget/ReactSelect'
import Tooltip from '../../../../../common/components/Tooltip'
import JsonField from '../../../../../common/forms/JsonField'

import {CONTEXT_SPECIAL_VARIABLE, DEFAULT_FORM} from './constants'


type Props = {
    form: string | Object | Array<*>,
    onChange: (string | Object | Array<*>) => void
}

type State = {
    cachedForm: string | Object | Array<*>
}


export default class JSONBody extends React.Component<Props, State> {
    presetOptions = [
        {label: 'JSON template', value: DEFAULT_FORM},
        {label: 'Send the entire ticket/message JSON', value: CONTEXT_SPECIAL_VARIABLE},
    ]

    state = {
        cachedForm: DEFAULT_FORM
    }

    componentWillMount() {
        if (!this._formIsPresetOption(this.props.form)) {
            this.setState({cachedForm: this.props.form})
        }
    }

    _onDropdownChange = (form: Object | string) => {
        this.props.onChange(_isEqual(form, DEFAULT_FORM) ? this.state.cachedForm : form)
    }

    _onJSONChange = (form: Object) => {
        this.setState({cachedForm: form})
        this.props.onChange(form)
    }

    _formIsPresetOption = (form: string | Object | Array<*>): boolean => {
        const presetOptionsValues = this.presetOptions.map((option) => option.value)
        return _some(presetOptionsValues, (presetOptionValue) => _isEqual(presetOptionValue, form))
    }

    render() {
        const {form} = this.props

        let dropdownValue = this._formIsPresetOption(form) ? form : DEFAULT_FORM

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
                    You can choose to build your own JSON request body using variables, or to send the whole
                    context (which includes the entire ticket, and new message if any) directly.
                </Tooltip>
                <div className="mb-2">
                    <Select
                        options={this.presetOptions}
                        onChange={this._onDropdownChange}
                        value={dropdownValue}
                    />
                </div>
                {
                    _isEqual(dropdownValue, DEFAULT_FORM) ? (
                        <div>
                            <JsonField
                                name="http.form"
                                rows="8"
                                value={form || DEFAULT_FORM}
                                onChange={this._onJSONChange}
                            />
                            <FormText color="muted">
                                See full list of variables{' '}
                                    <a
                                        href="https://api.gorgias.io/#Customer-object"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        here
                                    </a>
                            </FormText>
                        </div>
                    ) : null
                }
            </FormGroup>
        )
    }
}
