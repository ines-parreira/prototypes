import type { ComponentType } from 'react'
import React, { useCallback, useMemo } from 'react'

import { useEffectOnce } from '@repo/hooks'
import type { Map } from 'immutable'
import _debounce from 'lodash/debounce'

import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import type { Option } from 'pages/common/forms/MultiSelectOptionsField/types'
import type { CancellableRequestInjectedProps } from 'pages/common/utils/withCancellableRequest'
import withCancellableRequest from 'pages/common/utils/withCancellableRequest'
import { fieldEnumSearch } from 'state/views/actions'
import type { FieldSearchResult } from 'state/views/types'

type Props = {
    plural: string
    singular: string
    selectedOptions: Option[]
    onChange: (options: Option[]) => void
    field: Map<any, any>
    mapSearchResults: (searchResults: FieldSearchResult[]) => Option[]
    dropdownMenu?: ComponentType<any>
} & CancellableRequestInjectedProps<
    'fieldEnumSearchCancellable',
    'cancelFieldEnumSearchCancellable',
    typeof fieldEnumSearch
>

export function FilterMultiSelectField(props: Props) {
    const {
        dropdownMenu,
        field,
        fieldEnumSearchCancellable,
        mapSearchResults,
        onChange,
        selectedOptions,
        singular,
        plural,
    } = props
    const [options, setOptions] = React.useState<Option[]>([])
    const [isLoading, setLoading] = React.useState(false)

    const handleSearch = useCallback(
        async (query: string) => {
            // Fields that already have an enum don't need to have a search
            if (field.getIn(['filter', 'enum'])) {
                return
            }

            setLoading(true)
            const data = await fieldEnumSearchCancellable(field, query)
            setLoading(false)

            if (!data) {
                return
            }

            setOptions(mapSearchResults(data ? data.toJS() : []))
        },
        [field, fieldEnumSearchCancellable, mapSearchResults],
    )

    useEffectOnce(() => {
        void handleSearch('')
    })

    // handleSearch must be a stable function for debounce to work
    const handleInputChange = useMemo(
        () => _debounce(handleSearch, 1000),
        [handleSearch],
    )

    const handleChange = (options: Option[]) => {
        onChange(options)
        void handleSearch('')
    }

    return (
        <MultiSelectOptionsField
            singular={singular}
            plural={plural}
            loading={isLoading}
            options={options}
            selectedOptions={selectedOptions}
            onInputChange={handleInputChange}
            onChange={handleChange}
            dropdownMenu={dropdownMenu}
        />
    )
}

export default withCancellableRequest<
    'fieldEnumSearchCancellable',
    'cancelFieldEnumSearchCancellable',
    typeof fieldEnumSearch
>(
    'fieldEnumSearchCancellable',
    fieldEnumSearch,
)(FilterMultiSelectField)
