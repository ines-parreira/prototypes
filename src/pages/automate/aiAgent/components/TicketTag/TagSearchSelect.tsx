import React, {useCallback, useEffect, useRef, useState} from 'react'
import {DropdownItem as BareDropdownItem} from 'reactstrap'
import {CancelToken} from 'axios'
import _debounce from 'lodash/debounce'
import {fromJS, List, Map} from 'immutable'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {useOnClickOutside} from 'pages/common/hooks/useOnClickOutside'
import {reportError} from 'utils/errors'
import useCancellableRequest from 'hooks/useCancellableRequest'
import {fieldEnumSearch} from 'state/views/actions'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import css from './TagSearchSelect.less'

type Props = {
    onSelect: (name: string) => void
    defaultTag: string | undefined
}

const LIMIT_TAGS_SEARCH = 15

const TagSearchSelect = ({onSelect, defaultTag}: Props) => {
    const dropdownAnchor = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setIsLoading] = useState(false)
    const [firstToggle, setFirstToggle] = useState(true)
    const [tagsResults, setTagsResults] = useState<List<any>>(fromJS([]))
    const [search, setSearch] = useState('')
    const [selectedTag, setSelectedTag] = useState<string | undefined>(
        defaultTag
    )

    const [fieldEnumSearchCancellable] = useCancellableRequest(
        (cancelToken: CancelToken) => (field: Map<any, any>, search: string) =>
            fieldEnumSearch(field, search, cancelToken)()
    )

    const queryResults = async (search: string) => {
        setIsLoading(true)

        const field = fromJS({
            filter: {type: 'tag', size: LIMIT_TAGS_SEARCH},
        })

        try {
            const data = await fieldEnumSearchCancellable(field, search)
            if (!data) return

            setTagsResults(data)
        } catch (error) {
            reportError(error, {
                tags: {team: AI_AGENT_SENTRY_TEAM},
                extra: {
                    context: 'Error trying to load account tags',
                },
            })
        }
        setIsLoading(false)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const queryResultsOnSearch = useCallback(_debounce(queryResults, 1000), [])

    const handleSearch = (search: string) => {
        setIsLoading(true)
        setSearch(search)
        void queryResultsOnSearch(search)
    }

    const handleTagSelection = (tagName: string) => {
        setSelectedTag(tagName)
        setIsOpen(false)
        onSelect(tagName)
    }

    useOnClickOutside(dropdownRef, () => {
        if (isOpen) {
            setIsOpen(false)
        }
    })

    useEffect(() => {
        // Search for tags on the first toggle of the dropdown
        if (firstToggle && isOpen) {
            setIsLoading(true)
            void queryResultsOnSearch(search)
            setFirstToggle(false)
        }
    }, [firstToggle, isOpen, search, queryResultsOnSearch])

    return (
        <div>
            <div
                className={css.dropdownSelection}
                ref={dropdownAnchor}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedTag ? (
                    selectedTag
                ) : (
                    <div className={css.dropdownPlaceholder}>
                        Choose tag
                        <span>
                            <i className="material-icons md-2">
                                arrow_drop_down
                            </i>
                        </span>
                    </div>
                )}
            </div>
            <Dropdown
                placement="right"
                ref={dropdownRef}
                isOpen={isOpen}
                onToggle={() => setIsOpen(!isOpen)}
                target={dropdownAnchor}
            >
                <DropdownSearch
                    onChange={(value) => handleSearch(value)}
                    className={css.dropdownSearch}
                    placeholder="Search"
                />
                {loading ? (
                    <BareDropdownItem disabled>
                        <i className="material-icons md-spin mr-2">refresh</i>
                        Loading...
                    </BareDropdownItem>
                ) : null}
                <div className={css.dropdownItemsContainer}>
                    {tagsResults.map((t: Map<any, any>) => {
                        const id = t.get('id') as string
                        const name = t.get('name') as string
                        return (
                            <DropdownItem
                                key={id}
                                className={css.dropdownItem}
                                onClick={() => handleTagSelection(name)}
                                option={{
                                    label: name,
                                    value: name,
                                }}
                            />
                        )
                    })}
                </div>
            </Dropdown>
        </div>
    )
}

export default TagSearchSelect
