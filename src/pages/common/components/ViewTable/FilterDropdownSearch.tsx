import React, {useCallback} from 'react'
import {useMount} from 'react-use'
import {Map, List} from 'immutable'
import {DropdownItem} from 'reactstrap'
import {CancelToken} from 'axios'

import Search from 'pages/common/components/Search'
import useCancellableRequest from 'hooks/useCancellableRequest'
import {fieldEnumSearch} from 'state/views/actions'

type Props = {
    field: Map<any, any>
    onSearchStart: () => void
    onSearchSuccess: (results: Maybe<List<any>>) => void
    onSearchError: () => void
}

export default function FilterDropdownSearch({
    field,
    onSearchStart,
    onSearchError,
    onSearchSuccess,
}: Props) {
    const [fieldEnumSearchCancellable] = useCancellableRequest(
        (cancelToken: CancelToken) => {
            return (field: Map<any, any>, query: string) =>
                fieldEnumSearch(field, query, cancelToken)()
        }
    )

    const handleSearch = useCallback(
        async (query: string) => {
            if (field.getIn(['filter', 'enum'])) {
                return
            }

            onSearchStart()
            try {
                const data = await fieldEnumSearchCancellable(field, query)
                if (data) {
                    onSearchSuccess(data)
                }
            } catch (error) {
                onSearchError()
            }
        },
        [
            onSearchStart,
            onSearchError,
            onSearchSuccess,
            field,
            fieldEnumSearchCancellable,
        ]
    )

    useMount(() => {
        void handleSearch('')
    })

    if (!field.getIn(['filter', 'type'])) {
        return null
    }

    return (
        <>
            <DropdownItem key="search" header className="dropdown-item-input">
                <Search
                    autoFocus
                    onChange={handleSearch}
                    searchDebounceTime={1000}
                />
            </DropdownItem>
            <DropdownItem key="divider" divider />
        </>
    )
}
