// @flow
import React from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS, List} from 'immutable'

import type {Map} from 'immutable'

import {getActionTemplate} from './../../../../../utils'

import Select from './ReactSelect'

import * as macroActions from './../../../../../state/macro/actions'


type Props = {
    actions: Object,
    onChange: (any) => void,
    value: string,
    className?: string
}

type State = {
    loading: boolean,
    macros: Map<*,*>,
}

class MacroSelect extends React.Component<Props, State> {
    state = {
        loading: false,
        macros: fromJS([]),
    }

    _selectFirstOption = (value: string, props: Props) => {
        if (!value && !this.state.macros.isEmpty()) {
            const firstOption = this._getOptions(this.state.macros).first()
            props.onChange(firstOption.get('value').toString())
        }
    }

    componentDidMount() {
        this._loadMacros()
    }

    // Update the rule with the first macro when macros are fetched
    componentWillReceiveProps(nextProps) {
        this._selectFirstOption(this.props.value, nextProps)
    }

    _getOptions = (macros = fromJS({})): List<*> => {
        if (this.state.loading) {
            return fromJS([])
        }

        // Filter out macros with external actions
        return macros
            .filter((macro) => macro.get('actions')
                .filter((action) => getActionTemplate(action.get('name')).execution === 'back')
                .isEmpty())
            .map((macro) => fromJS({value: macro.get('id').toString(), label: macro.get('name')}))
            .toList()
            .sortBy((macro) => (macro.get('label') || '').toLowerCase())
    }

    _loadMacros = (search) => {
        this.setState({loading: true})
        this.props.actions.fetchMacros({search}).then((res) => {
            this.setState({
                loading: false,
                macros: res.macros,
            })
        })
    }

    render() {
        const {value, onChange, className} = this.props
        const options = this._getOptions(this.state.macros)

        return (
            <Select
                className={className}
                value={value}
                onChange={onChange}
                onSearchChange={this._loadMacros}
                options={options.toJS()}
            />
        )
    }
}

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(macroActions, dispatch)
})

//$FlowFixMe
export default connect(
    null,
    mapDispatchToProps
)(MacroSelect)
