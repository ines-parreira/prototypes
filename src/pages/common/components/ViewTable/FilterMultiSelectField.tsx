import type {Map, List} from 'immutable'
import _debounce from 'lodash/debounce'
import React, {ComponentType} from 'react'

import {fieldEnumSearch} from '../../../../state/views/actions'
import withCancellableRequest, {
    CancellableRequestInjectedProps,
} from '../../../common/utils/withCancellableRequest.js'
import MultiSelectOptionsField from '../../forms/MultiSelectOptionsField/index.js'
import {Option} from '../../forms/MultiSelectOptionsField/types'

type Props = {
    plural: string
    singular: string
    selectedOptions: Option[]
    onChange: (options: Option[]) => void
    field: Map<any, any>
    fieldEnumSearchCancellable: (
        field: Map<any, any>,
        query: string
    ) => Promise<Maybe<List<any>>>
    mapSearchResults: <T>(searchResults: T[]) => Option[]
    dropdownMenu?: ComponentType<any>
} & CancellableRequestInjectedProps<
    'fieldEnumSearchCancellable',
    'cancelFieldEnumSearchCancellable',
    typeof fieldEnumSearch
>

type State = {
    options: Option[]
    isLoading: boolean
}

export class FilterMultiSelectField extends React.Component<Props, State> {
    state: State = {
        options: [],
        isLoading: false,
    }

    componentDidMount() {
        void this._onSearch('')
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
        void this._onSearch(input)
    }, 300)

    _onChange = (options: Option[]) => {
        this.props.onChange(options)
        void this._onSearch('')
    }

    render() {
        return (
            <MultiSelectOptionsField
                singular={this.props.singular}
                plural={this.props.plural}
                loading={this.state.isLoading}
                options={this.state.options}
                selectedOptions={this.props.selectedOptions}
                onInputChange={(input: string) => this._onInputChange(input)}
                onChange={this._onChange}
                dropdownMenu={this.props.dropdownMenu}
            />
        )
    }
}

export default withCancellableRequest<
    'fieldEnumSearchCancellable',
    'cancelFieldEnumSearchCancellable',
    typeof fieldEnumSearch
>(
    'fieldEnumSearchCancellable',
    fieldEnumSearch
)(FilterMultiSelectField)
