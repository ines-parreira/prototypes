import React, {
    KeyboardEvent,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react'
import {List, Map} from 'immutable'
import {useQueryClient} from '@tanstack/react-query'
import {ListTagsOrderBy, queryKeys} from '@gorgias/api-queries'
import cn from 'classnames'

import {UserRole} from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useGetTags from 'hooks/tags/useGetTags'
import useConditionalShortcuts from 'hooks/useConditionalShortcuts'
import useDebouncedEffect from 'hooks/useDebouncedEffect'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import dropdownItemCss from 'pages/common/components/dropdown/DropdownItem.less'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import {getCurrentUserState} from 'state/currentUser/selectors'
import {hasRole} from 'utils'

import css from './TagSearchDropdown.less'

const LIMIT_TAGS_SEARCH = 15
const STALE_TIME = 5 * 60 * 1000 // 5 minutes

type Props = {
    addTag: (tag: string) => void
    shouldBindKeys: boolean
    ticketTags: List<Map<any, any>>
    transparent?: boolean
}

const TagSearchDropdown = ({
    addTag,
    shouldBindKeys,
    ticketTags,
    transparent,
}: Props) => {
    const dispatch = useAppDispatch()
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    useDebouncedEffect(
        () => {
            setDebouncedSearch(search)
        },
        [search],
        300
    )
    const isTyping = useMemo(
        () => debouncedSearch !== search,
        [debouncedSearch, search]
    )
    const queryClient = useQueryClient()

    const searchInputRef = useRef<HTMLInputElement>(null)
    const targetRef = useRef<HTMLButtonElement>(null)
    const bodyRef = useRef<HTMLDivElement>(null)

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const queryParams = useMemo(
        () => ({
            limit: LIMIT_TAGS_SEARCH,
            search: debouncedSearch,
            order_by: ListTagsOrderBy.UsageDescNameDesc,
        }),
        [debouncedSearch]
    )
    const response = useGetTags(dispatch, queryParams, {
        enabled: isDropdownOpen,
        refetchOnWindowFocus: false,
        staleTime: STALE_TIME,
    })
    const tags = useMemo(() => response.data?.data.data ?? [], [response])

    const existingTagNames = useMemo(
        () => ticketTags.map((x?: Map<any, any>) => x!.get('name') as string),
        [ticketTags]
    )

    const displayedTags = useMemo(
        () => tags.filter((tag) => !existingTagNames.contains(tag.name!)),
        [existingTagNames, tags]
    )
    const tagsLength = useMemo(() => displayedTags.length, [displayedTags])
    const hasEmptyResults = !tagsLength

    const didNotFindSearchTerm = useMemo(
        () => search !== '' && !tags.find((tag) => tag.name === search),
        [search, tags]
    )

    const currentUser = useAppSelector(getCurrentUserState)
    const hasUserRole = useMemo(
        () => hasRole(currentUser, UserRole.Agent),
        [currentUser]
    )

    const handleAddTag = useCallback(
        (name?: string, isNew?: boolean) => {
            if (!name) {
                return
            }

            addTag(name)

            if (isNew) {
                void queryClient.removeQueries({
                    queryKey: queryKeys.tags.listTags(queryParams),
                })
            }
            searchInputRef.current?.focus()
            setSearch('')
        },
        [addTag, queryClient, queryParams]
    )

    const resetTagsResults = () => {
        setSearch('')
        setDebouncedSearch('')
    }

    const onToggle = (value: boolean) => {
        setIsDropdownOpen(value)
        resetTagsResults()
    }

    const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown' && bodyRef.current?.firstElementChild) {
            e.preventDefault()
            ;(bodyRef.current?.firstElementChild as HTMLElement)?.focus()
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            ;(bodyRef.current?.lastElementChild as HTMLElement)?.focus()
        }
    }

    const handleElementKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (
            (e.key === 'ArrowUp' &&
                e.target === bodyRef.current?.firstElementChild) ||
            (e.key === 'ArrowDown' &&
                e.target === bodyRef.current?.lastElementChild)
        ) {
            e.preventDefault()
            searchInputRef?.current?.focus({preventScroll: true})
        }
    }

    const handleCreateTagKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleAddTag(search, true)
            } else if (e.key === 'ArrowUp') {
                if (e.target === bodyRef.current?.firstElementChild) {
                    searchInputRef?.current?.focus()
                } else {
                    ;(
                        (e.target as HTMLElement)
                            ?.previousElementSibling as HTMLElement
                    ).focus()
                }
            } else if (e.key === 'ArrowDown') {
                searchInputRef?.current?.focus()
            }
        },
        [handleAddTag, search]
    )

    useConditionalShortcuts(shouldBindKeys, 'TicketDetailContainer', {
        OPEN_TAGS: {
            action: (e) => {
                // shortcut key gets typed in the search field otherwise
                e.preventDefault()
                onToggle(true)
            },
        },
        CLOSE_TAGS: {
            key: 'esc',
            action: () => onToggle(false),
        },
    })

    return (
        <>
            <Button
                ref={targetRef}
                onClick={() => onToggle(!isDropdownOpen)}
                intent="secondary"
                fillStyle={transparent ? 'ghost' : 'fill'}
                size="small"
            >
                <ButtonIconLabel icon="add">Add tags</ButtonIconLabel>
            </Button>
            <Dropdown
                isOpen={isDropdownOpen}
                onToggle={onToggle}
                target={targetRef}
            >
                <DropdownSearch
                    ref={searchInputRef}
                    value={search}
                    onChange={setSearch}
                    className={css.inputSearch}
                    placeholder="Search"
                    autoFocus
                    role="listitem"
                    onKeyDown={handleSearchKeyDown}
                />
                <DropdownBody
                    isLoading={response.isFetching || isTyping}
                    ref={bodyRef}
                    role="list"
                >
                    {displayedTags.map((tag, i) => {
                        const name = tag.name
                        return (
                            <DropdownItem
                                key={tag.id}
                                option={{
                                    label: name!,
                                    value: name!,
                                }}
                                onClick={() => handleAddTag(name)}
                                role="listitem"
                                onKeyDown={
                                    i === 0 || i === tagsLength - 1
                                        ? handleElementKeyDown
                                        : undefined
                                }
                            >
                                {name}
                            </DropdownItem>
                        )
                    })}
                    {didNotFindSearchTerm ? (
                        hasUserRole ? (
                            <div
                                className={cn(
                                    dropdownItemCss.item,
                                    css.createTag,
                                    {
                                        [css.separator]: !hasEmptyResults,
                                    }
                                )}
                                onClick={() => handleAddTag(search, true)}
                                role="listitem"
                                onKeyDown={handleCreateTagKeyDown}
                                tabIndex={0}
                            >
                                <b>Create</b>&nbsp;{search}
                            </div>
                        ) : hasEmptyResults ? (
                            <div
                                className={cn(
                                    dropdownItemCss.item,
                                    dropdownItemCss.disabled
                                )}
                            >
                                Couldn't find the tag: {search}
                            </div>
                        ) : null
                    ) : hasEmptyResults ? (
                        <div
                            className={cn(
                                dropdownItemCss.item,
                                dropdownItemCss.disabled
                            )}
                        >
                            No results
                        </div>
                    ) : null}
                </DropdownBody>
            </Dropdown>
        </>
    )
}

export default TagSearchDropdown
