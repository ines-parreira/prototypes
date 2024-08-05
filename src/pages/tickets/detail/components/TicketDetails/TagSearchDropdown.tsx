import React, {
    ComponentProps,
    KeyboardEvent,
    useMemo,
    useRef,
    useState,
} from 'react'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'
import {List, Map} from 'immutable'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import {useQueryClient} from '@tanstack/react-query'
import {ListTagsOrderBy, queryKeys} from '@gorgias/api-queries'

import {UserRole} from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useGetTags from 'hooks/tags/useGetTags'
import useConditionalShortcuts from 'hooks/useConditionalShortcuts'
import useDebouncedEffect from 'hooks/useDebouncedEffect'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import TagDropdownMenu from 'pages/common/components/TagDropdownMenu/TagDropdownMenu'
import TextInput from 'pages/common/forms/input/TextInput'
import {getCurrentUserState} from 'state/currentUser/selectors'
import {hasRole} from 'utils'

import css from './TagSearchDropdown.less'

const LIMIT_TAGS_SEARCH = 15
const STALE_TIME = 5 * 60 * 1000 // 5 minutes

type Props = {
    addTag: (tag: string) => void
    dropdownContainer?: ComponentProps<typeof DropdownMenu>['container']
    right?: boolean
    shouldBindKeys: boolean
    ticketTags: List<Map<any, any>>
    transparent?: boolean
}

const TagSearchDropdown = ({
    addTag,
    dropdownContainer,
    right,
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
    const queryClient = useQueryClient()

    const searchInputRef = useRef<HTMLInputElement>(null)
    const tagRef = useRef<DropdownItem>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const queryParams = useMemo(
        () => ({
            limit: LIMIT_TAGS_SEARCH,
            search: debouncedSearch,
            order_by: debouncedSearch
                ? undefined
                : ListTagsOrderBy.UsageDescNameDesc,
        }),
        [debouncedSearch]
    )
    const response = useGetTags(dispatch, queryParams, {
        enabled: isDropdownOpen,
        refetchOnWindowFocus: false,
        staleTime: STALE_TIME,
    })
    const tags = useMemo(() => response.data?.data.data ?? [], [response])

    const displayedTags = useMemo(() => {
        const existingTagNames = ticketTags.map(
            (x?: Map<any, any>) => x!.get('name') as string
        )
        return tags.filter((tag) => !existingTagNames.contains(tag.name!))
    }, [tags, ticketTags])
    const hasEmptyResults = !displayedTags.length

    const currentUser = useAppSelector(getCurrentUserState)
    const hasUserRole = useMemo(
        () => hasRole(currentUser, UserRole.Agent),
        [currentUser]
    )

    const handleAddTag = (name?: string, isNew?: boolean) => {
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
    }

    const resetTagsResults = () => {
        setSearch('')
        setDebouncedSearch('')
    }

    const toggle = () => {
        const isOpen = !isDropdownOpen
        setIsDropdownOpen(isOpen)

        if (isOpen) {
            resetTagsResults()
        }
    }

    const openDropdown = () => {
        setIsDropdownOpen(true)
        resetTagsResults()
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
            search !== '' && !displayedTags.find((tag) => tag.name === search),
        [displayedTags, search]
    )

    useConditionalShortcuts(shouldBindKeys, 'TicketDetailContainer', {
        OPEN_TAGS: {
            action: (e) => {
                // shortcut key gets typed in the search field otherwise
                e.preventDefault()
                openDropdown()
            },
        },
        CLOSE_TAGS: {
            key: 'esc',
            action: () => setIsDropdownOpen(false),
        },
    })

    return (
        <Dropdown
            className={css.addTags}
            isOpen={isDropdownOpen}
            toggle={toggle}
            group={false}
        >
            <DropdownToggle
                size="sm"
                className={classNames(
                    {
                        [css.transparent]: transparent,
                    },
                    css.toggle
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
                        onChange={setSearch}
                        onKeyDown={handleSearchKeyDown}
                        role="menuitem"
                    />
                </DropdownItem>
                <DropdownItem divider />
                {response.isFetching ? (
                    <DropdownItem disabled>
                        <i className="material-icons md-spin mr-2">refresh</i>
                        Loading...
                    </DropdownItem>
                ) : (
                    <>
                        {displayedTags.map((tag, i) => {
                            const name = tag.name
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
                                            hasEmptyResults ? tagRef : undefined
                                        }
                                        type="button"
                                        onClick={() =>
                                            handleAddTag(search, true)
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
    )
}

export default TagSearchDropdown
