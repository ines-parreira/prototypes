// @flow
import type {Map, List} from 'immutable'
import _debounce from 'lodash/debounce'
import React, {type ComponentType} from 'react'

import {fieldEnumSearch} from '../../../../state/views/actions.ts'
import withCancellableRequest from '../../../common/utils/withCancellableRequest'
import MultiSelectOptionsField, {
    type Option,
} from '../../forms/MultiSelectOptionsField'

type Props = {
    plural: string,
    singular: string,
    selectedOptions: Option[],
    onChange: (Option[]) => void,
    field: Map<*, *>,
    fieldEnumSearchCancellable: (
        field: Map<*, *>,
        query: string
    ) => Promise<?List<*>>,
    mapSearchResults: <T>(searchResults: T[]) => Option[],
    dropdownMenu?: ComponentType<*>,
}

type State = {
    options: Option[],
    isLoading: boolean,
}

export class FilterMultiSelectField extends React.Component<Props, State> {
    state: State = {
        options: [],
        isLoading: false,
    }

    componentDidMount() {
        this._onSearch('')
    }

    _onSearch = async (query: string) => {
        const {field, fieldEnumSearchCancellable} = this.props
        // Fields that already have an enum don't need to have a search
        if (this.props.field.getIn(['filter', 'enum'])) {
            return
        }

        this.setState({
            isLoading: true,
        })

        const data = await fieldEnumSearchCancellable(field, query)
        if (!data) {
            return
        }
        this.setState({
            isLoading: false,
            options: this.props.mapSearchResults(data ? data.toJS() : []),
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
                dropdownMenu={this.props.dropdownMenu}
            />
        )
    }
}

export default withCancellableRequest<Props>(
    'fieldEnumSearchCancellable',
    fieldEnumSearch
)(FilterMultiSelectField)
