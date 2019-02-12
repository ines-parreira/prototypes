// @flow
import type {Map} from 'immutable'
import _debounce from 'lodash/debounce'
import React from 'react'
import {connect} from 'react-redux'

import {fieldEnumSearch} from '../../../../state/views/actions'
import MultiSelectOptionsField, {type Option} from '../../forms/MultiSelectOptionsField'

type Props = {
    plural: string,
    singular: string,
    selectedOptions: Option[],
    onChange: Option[] => void,
    field: Map<*, *>,
    fieldEnumSearch: (Map<*, *>, string) => Map<*, *>,
    mapSearchResults: <T>(searchResults: T[]) => Option[]
}

type State = {
    options: Option[],
    isLoading: boolean
}

export class FilterMultiSelectField extends React.Component<Props, State> {
    state: State = {
        options: [],
        isLoading: false
    }

    componentDidMount () {
        this._onSearch('')
    }

    _onSearch = async (query: string) => {
        // Fields that already have an enum don't need to have a search
        if (this.props.field.getIn(['filter', 'enum'])) {
            return
        }

        this.setState({
            isLoading: true,
        })

        const data = await this.props.fieldEnumSearch(this.props.field, query)
        this.setState({
            isLoading: false,
            options: this.props.mapSearchResults(data ? data.toJS() : [])
        })
    }

    _onInputChange = _debounce((input: string) => {
        this._onSearch(input)
    }, 300)

    _onChange = (options: Option[]) => {
        this.props.onChange(options)
        this._onSearch('')
    }

    render() {
        return (
            <MultiSelectOptionsField
                singular={this.props.singular}
                plural={this.props.plural}
                loading={this.state.isLoading}
                options={this.state.options}
                selectedOptions={this.props.selectedOptions}
                onInputChange={(input) => this._onInputChange(input)}
                onChange={this._onChange}
            />
        )
    }
}

export default connect(null, {
    fieldEnumSearch
})(FilterMultiSelectField)
