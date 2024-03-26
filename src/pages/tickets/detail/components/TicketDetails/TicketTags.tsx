import React, {useEffect, useMemo, useRef, useState} from 'react'
import type {ComponentProps, KeyboardEvent} from 'react'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
import {fromJS, List, Map} from 'immutable'
import _debounce from 'lodash/debounce'
import _isUndefined from 'lodash/isUndefined'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'
import {CancelToken} from 'axios'

import {UserRole} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import useCancellableRequest from 'hooks/useCancellableRequest'
import useConditionalShortcuts from 'hooks/useConditionalShortcuts'
import usePrevious from 'hooks/usePrevious'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import TagDropdownMenu from 'pages/common/components/TagDropdownMenu/TagDropdownMenu'
import TextInput from 'pages/common/forms/input/TextInput'
import {TagLabel} from 'pages/common/utils/labels'
import {getCurrentUserState} from 'state/currentUser/selectors'
import {fieldEnumSearch} from 'state/views/actions'
import {hasRole} from 'utils'

import css from './TicketTags.less'

const LIMIT_TAGS_SEARCH = 15

type Props = {
    addTag: (tag: string) => void
    className?: string
    dropdownContainer?: ComponentProps<typeof DropdownMenu>['container']
    isDisabled?: boolean
    removeTag: (tag: string) => void
    right?: boolean
    shouldBindKeys?: boolean
    ticketTags: List<any>
    transparent?: boolean
}

const TicketTags = ({
    addTag,
    className,
    dropdownContainer,
    isDisabled = false,
    removeTag,
    right = false,
    shouldBindKeys = false,
    ticketTags,
    transparent = false,
}: Props) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [tagsResults, setTagsResults] = useState<List<any>>(fromJS([]))
    const [isLoading, setIsLoading] = useState(false)
    const [search, setSearch] = useState('')
    const tagRef = useRef<DropdownItem>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const currentUser = useAppSelector(getCurrentUserState)
    const prevTicketTags = usePrevious(ticketTags)
    const hasUserRole = useMemo(
        () => hasRole(currentUser, UserRole.Agent),
        [currentUser]
    )
    const displayedTags = useMemo(() => {
        const existingTagNames = ticketTags.map(
            (x: Map<any, any>) => x.get('name') as string
        )
        return tagsResults.filter(
            (tag: Map<any, any>) => !existingTagNames.contains(tag.get('name'))
        ) as List<any>
    }, [tagsResults, ticketTags])
    const hasEmptyResults = displayedTags.isEmpty()

    useConditionalShortcuts(shouldBindKeys, 'TicketDetailContainer', {
        OPEN_TAGS: {
            action: (e) => {
                // shortcut key gets typed in the search field otherwise
                e.preventDefault()
                toggle()
            },
        },
        CLOSE_TAGS: {
            key: 'esc',
            action: () => toggle(undefined, false),
        },
    })

    const [fieldEnumSearchCancellable] = useCancellableRequest(
        (cancelToken: CancelToken) => (field: Map<any, any>, search: string) =>
            fieldEnumSearch(field, search, cancelToken)()
    )

    const queryResults = async (search: string) => {
        setIsLoading(true)

        const field = fromJS({
            filter: {type: 'tag', size: LIMIT_TAGS_SEARCH},
        })

        const data = await fieldEnumSearchCancellable(field, search)
        if (!data) return

        setTagsResults(data)
        setIsLoading(false)
    }

    const queryResultsOnSearch = _debounce(queryResults, 1000)

    useEffect(() => {
        if (isDropdownOpen && searchInputRef.current && prevTicketTags) {
            const prevExistingTagNames = prevTicketTags
                .sortBy((x: Map<any, any>) => x.get('name') as string)
                .map((x: Map<any, any>) => x.get('name') as string)
            const existingTagNames = ticketTags
                .sortBy((x: Map<any, any>) => x.get('name') as string)
                .map((x: Map<any, any>) => x.get('name') as string)

            if (!prevExistingTagNames.equals(existingTagNames)) {
                searchInputRef.current.focus()
            }
        }
    }, [isDropdownOpen, prevTicketTags, ticketTags])

    const onSearch = (search: string) => {
        setIsLoading(true)
        setSearch(search)
        void queryResultsOnSearch(search)
    }

    const resetTagsResults = () => {
        setSearch('')
        void queryResults('')
    }

    const handleAddTag = (name: string) => {
        if (!name) {
            return
        }

        addTag(name)
        resetTagsResults()
    }

    const toggle = (_?: KeyboardEvent, visible?: boolean) => {
        const opens = !_isUndefined(visible) ? visible : !isDropdownOpen
        setIsDropdownOpen(opens)

        if (opens) {
            resetTagsResults()
        }
    }

    const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown' && tagRef.current) {
            const node = ReactDOM.findDOMNode(
                tagRef.current
            ) as HTMLElement | null
            node?.focus()
        }
    }

    const didNotFindSearchTerm = useMemo(
        () =>
            !displayedTags.find(
                (tag: Map<any, any>) => tag.get('name') === search
            ) && search !== '',
        [displayedTags, search]
    )

    return (
        <div
            className={classnames(
                css.tags,
                {
                    [css.right]: right,
                },
                className
            )}
        >
            {!isDisabled && (
                <Dropdown
                    className={css.addTags}
                    isOpen={isDropdownOpen}
                    toggle={toggle}
                    group={false}
                >
                    <DropdownToggle
                        size="sm"
                        className={classnames(
                            {
                                [css.transparent]: transparent,
                            },
                            css.addTag
                        )}
                    >
                        <ButtonIconLabel icon="add">Add tags</ButtonIconLabel>
                    </DropdownToggle>
                    <TagDropdownMenu
                        right={!!right}
                        style={{padding: '0.5rem 4px'}}
                        container={dropdownContainer}
                        modifiers={{
                            preventOverflow: {
                                boundariesElement: 'viewport',
                            },
                        }}
                    >
                        <DropdownItem header>ADD TAG:</DropdownItem>
                        <DropdownItem header className="dropdown-item-input">
                            <TextInput
                                ref={searchInputRef}
                                placeholder="Search tags..."
                                autoFocus
                                value={search}
                                onChange={onSearch}
                                onKeyDown={handleSearchKeyDown}
                                role="menuitem"
                            />
                        </DropdownItem>
                        <DropdownItem divider />
                        {isLoading ? (
                            <DropdownItem disabled>
                                <i className="material-icons md-spin mr-2">
                                    refresh
                                </i>
                                Loading...
                            </DropdownItem>
                        ) : (
                            <>
                                {displayedTags.map((tag: Map<any, any>, i) => {
                                    const name = tag.get('name') as string
                                    return (
                                        <DropdownItem
                                            key={i}
                                            ref={i === 0 ? tagRef : undefined}
                                            type="button"
                                            toggle={false}
                                            onClick={() => handleAddTag(name)}
                                        >
                                            {name}
                                        </DropdownItem>
                                    )
                                })}
                                {didNotFindSearchTerm ? (
                                    hasUserRole ? (
                                        <>
                                            {!hasEmptyResults && (
                                                <DropdownItem divider />
                                            )}
                                            <DropdownItem
                                                ref={
                                                    hasEmptyResults
                                                        ? tagRef
                                                        : undefined
                                                }
                                                type="button"
                                                onClick={() =>
                                                    handleAddTag(search)
                                                }
                                            >
                                                <b>Create</b> {search}
                                            </DropdownItem>
                                        </>
                                    ) : hasEmptyResults ? (
                                        <DropdownItem disabled>
                                            Couldn't find the tag: {search}
                                        </DropdownItem>
                                    ) : null
                                ) : null}
                            </>
                        )}
                    </TagDropdownMenu>
                </Dropdown>
            )}
            {ticketTags
                .sort((a: Map<any, any>, b: Map<any, any>) => {
                    const first = (a.get('name') as string).toLowerCase()
                    const second = (b.get('name') as string).toLowerCase()

                    return first > second ? 1 : second > first ? -1 : 0
                })
                .map((tag: Map<any, any>, i) => (
                    <TagLabel
                        key={i}
                        decoration={tag.get('decoration')}
                        className={css.tagLabel}
                    >
                        <span>
                            {tag.get('name')}
                            {!isDisabled && (
                                <i
                                    className={classnames(
                                        css.remove,
                                        'material-icons cursor-pointer ml-1'
                                    )}
                                    onClick={() =>
                                        removeTag(tag.get('name') as string)
                                    }
                                >
                                    close
                                </i>
                            )}
                        </span>
                    </TagLabel>
                ))}
        </div>
    )
}

export default TicketTags
