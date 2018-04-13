// @flow
import React from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS, List} from 'immutable'
import {Input} from 'reactstrap'

import {getActionTemplate} from './../../../../../utils'

import Select from './ReactSelect'

import * as macroActions from './../../../../../state/macro/actions'
import {getMacros} from './../../../../../state/macro/selectors'


type Props = {
    actions: Object,
    onChange: (any) => void,
    value: string,
    macros: Object,
    className: ?string
}

class MacroSelect extends React.Component<Props> {
    _selectFirstOption = (value: string, props: Props) => {
        if (!value && !props.macros.isEmpty()) {
            const firstOption = this._getOptions(props.macros).first()
            props.onChange(firstOption.get('value'))
        }
    }

    componentDidMount() {
        const {actions, macros, value} = this.props

        if (macros.isEmpty()) {
            actions.fetchMacros()
        } else {
            this._selectFirstOption(value, this.props)
        }
    }

    // Update the rule with the first macro when macros are fetched
    componentWillReceiveProps(nextProps) {
        this._selectFirstOption(this.props.value, nextProps)
    }

    _getOptions = (macros = fromJS({})) : List<*> => {
        // Filter out macros with external actions
        return macros
            .filter((macro) => macro.get('actions')
                .filter((action) => getActionTemplate(action.get('name')).execution === 'back')
                .isEmpty())
            .map((macro) => fromJS({value: macro.get('id'), label: macro.get('name')}))
            .toList()
    }

    render() {
        const {value, onChange, macros, className} = this.props
        const options = this._getOptions(macros)

        if (options.isEmpty()) {
            return (
                <Input
                    type="text"
                    placeholder="Loading macros..."
                    readOnly
                />
            )
        }

        return (
            <Select
                className={className}
                value={value}
                onChange={onChange}
                options={options.toJS()}
            />
        )
    }
}

const mapStateToProps = (state) => ({
    macros: getMacros(state)
})

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(macroActions, dispatch)
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MacroSelect)
