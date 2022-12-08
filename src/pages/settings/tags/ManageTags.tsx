import React, {FormEvent, useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {Container, Form, Popover, PopoverBody, PopoverHeader} from 'reactstrap'
import axios, {AxiosError, CancelToken} from 'axios'
import {useAsyncFn, useDebounce, useEffectOnce} from 'react-use'
import {Map} from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useCancellableRequest from 'hooks/useCancellableRequest'
import {CursorDirection, CursorMeta, OrderDirection} from 'models/api/types'
import {fetchTags} from 'models/tag/resources'
import {FetchTagsOptions, Tag, TagSortableProperties} from 'models/tag/types'
import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import Loader from 'pages/common/components/Loader/Loader'
import Navigation from 'pages/common/components/Navigation/Navigation'
import PageHeader from 'pages/common/components/PageHeader'
import Video from 'pages/common/components/Video/Video'
import Search from 'pages/common/components/Search'
import TextInput from 'pages/common/forms/input/TextInput'
import settingsCss from 'pages/settings/settings.less'
import {REMOVE_TAG_ERROR} from 'state/tags/constants'

import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {bulkDelete, create, merge, selectAll} from 'state/tags/actions'
import {getMeta, getIsCreating, getSelectAll} from 'state/tags/selectors'
import {ServerErrorAction} from 'store/middlewares/serverErrorHandler'

import css from './ManageTags.less'
import Table from './Table'

const ManageTags = () => {
    const dispatch = useAppDispatch()
    const isCreating = useAppSelector(getIsCreating)
    const areAllTagsSelected = useAppSelector(getSelectAll)

    const [meta, setMeta] = useState<CursorMeta | null>(null)
    const [sort, setSort] = useState(TagSortableProperties.Usage)
    const [reverse, setReverse] = useState(true)
    const [search, setSearch] = useState('')
    const [newTag, setNewTag] = useState('')
    const [showCreationPopup, setShowCreationPopup] = useState(false)
    const [tags, setTags] = useState<Tag[]>([])

    const toggledTags = useAppSelector(getMeta)
    const selectedTags = useMemo(
        () =>
            toggledTags
                .filter(
                    (meta: Map<any, any>) => meta.get('selected') as boolean
                )
                .keySeq(),
        [toggledTags]
    )

    const createFetchTags =
        (cancelToken: CancelToken) =>
        async ({
            orderBy = sort,
            orderDir = reverse ? OrderDirection.Desc : OrderDirection.Asc,
            search,
            direction,
            refreshPreviousPage,
        }: {
            orderBy?: TagSortableProperties
            orderDir?: FetchTagsOptions['orderDir']
            search?: FetchTagsOptions['search']
            direction?: CursorDirection
            refreshPreviousPage?: boolean
        } = {}) => {
            const params: FetchTagsOptions = {
                cursor: null,
                orderBy: `${orderBy}:${orderDir}`,
                search,
            }

            if (
                (direction === CursorDirection.PrevCursor ||
                    refreshPreviousPage) &&
                meta?.prev_cursor
            ) {
                params.cursor = meta?.prev_cursor
            } else if (
                direction === CursorDirection.NextCursor &&
                meta?.next_cursor
            ) {
                params.cursor = meta?.next_cursor
            }

            try {
                const res = await fetchTags(params, {cancelToken})
                setMeta(res.data.meta)
                setTags(res.data.data)
                setSort(orderBy || TagSortableProperties.Usage)
                setReverse(orderDir === OrderDirection.Asc ? false : true)
            } catch (error) {
                if (axios.isCancel(error)) {
                    return
                }
                const responseError = error as AxiosError<{
                    error?: {msg: string}
                }>
                await dispatch(
                    notify({
                        message:
                            responseError.response?.data.error?.msg ||
                            'Failed to fetch tags.',
                        status: NotificationStatus.Error,
                    })
                )
            }
        }

    const [cancellableFetchTags, cancelFetchTags] =
        useCancellableRequest(createFetchTags)

    const [{loading: isLoading}, fetchPage] = useAsyncFn(
        cancellableFetchTags,
        [reverse, search, sort, meta],
        {loading: true}
    )

    const onSort = (sort: TagSortableProperties, reverse: boolean) => {
        void fetchPage({
            orderBy: sort,
            orderDir: reverse ? OrderDirection.Desc : OrderDirection.Asc,
        })
    }

    const onCreate = async (event: FormEvent) => {
        event.preventDefault()

        await dispatch(
            create({
                name: newTag,
            })
        )
        await fetchPage()
        setNewTag('')
        setShowCreationPopup(false)
    }

    const handleBulkDelete = async () => {
        const res = await dispatch(bulkDelete(selectedTags.toJS()))

        if (
            !!meta?.prev_cursor &&
            !meta?.next_cursor &&
            (res as ServerErrorAction)?.type !== REMOVE_TAG_ERROR
        ) {
            await fetchPage({refreshPreviousPage: true})
        } else {
            await fetchPage()
        }
        areAllTagsSelected && handleSelectAll()
    }

    const handleMerge = async () => {
        await dispatch(merge(selectedTags.toList()))
        await fetchPage()
        areAllTagsSelected && handleSelectAll()
    }

    const handleSelectAll = () => dispatch(selectAll(tags))

    const toggleCreationPopup = () => setShowCreationPopup(!showCreationPopup)

    const handlePageChange = (direction: CursorDirection) => {
        void fetchPage({direction})
        areAllTagsSelected && handleSelectAll()
    }

    const [, cancel] = useDebounce(
        () => {
            void fetchPage({search})
        },
        1000,
        [search]
    )

    useEffectOnce(() => {
        cancel()
        void fetchPage()
    })

    useEffect(() => () => cancelFetchTags(), [cancelFetchTags])

    return (
        <div
            className={classnames('full-width overflow-auto', {
                manageTagsClassName: selectedTags.size > 0,
            })}
        >
            <PageHeader title="Manage tags">
                <div className="manage-tags-bulk-actions">
                    <div className="d-flex">
                        <Search
                            bindKey
                            forcedQuery={search}
                            onChange={setSearch}
                            placeholder="Search tags by name..."
                            searchDebounceTime={300}
                            className="mr-2"
                        />
                        <Button
                            id="create-tag-button"
                            onClick={toggleCreationPopup}
                        >
                            Create tag
                        </Button>
                        <Popover
                            placement="bottom"
                            isOpen={showCreationPopup}
                            target="create-tag-button"
                            toggle={toggleCreationPopup}
                            trigger="legacy"
                            fade={false}
                        >
                            <PopoverHeader>Create a new tag</PopoverHeader>
                            <PopoverBody>
                                <Form onSubmit={onCreate}>
                                    <div className="d-flex align-items-center">
                                        <div className="mr-2">
                                            <TextInput
                                                placeholder="New tag name"
                                                value={newTag}
                                                autoFocus
                                                onChange={(value) =>
                                                    setNewTag(value)
                                                }
                                                isRequired
                                            />
                                        </div>
                                        <IconButton
                                            type="submit"
                                            isDisabled={isCreating}
                                        >
                                            check
                                        </IconButton>
                                    </div>
                                </Form>
                            </PopoverBody>
                        </Popover>
                    </div>
                </div>
            </PageHeader>

            <Container fluid className={settingsCss.pageContainer}>
                <div className={css.description}>
                    <div>
                        <p>
                            You can tag tickets to keep track of topics
                            customers are contacting you about.
                        </p>
                        <p>
                            Check your tag statistics{' '}
                            <Link to="/app/stats/tags">here</Link>.
                        </p>
                    </div>
                    <Video videoId="MHwrVTk6SNQ" legend="Working with tags" />
                </div>
            </Container>

            {isLoading ? (
                <Loader className={css.loader} />
            ) : (
                <>
                    <Table
                        sort={sort}
                        reverse={reverse}
                        onSort={onSort}
                        onSelectAll={handleSelectAll}
                        refresh={fetchPage}
                        onMerge={handleMerge}
                        onBulkDelete={handleBulkDelete}
                        tags={tags}
                    />

                    <Navigation
                        className={css.navigation}
                        hasNextItems={!!meta?.next_cursor}
                        hasPrevItems={!!meta?.prev_cursor}
                        fetchNextItems={() =>
                            handlePageChange(CursorDirection.NextCursor)
                        }
                        fetchPrevItems={() =>
                            handlePageChange(CursorDirection.PrevCursor)
                        }
                    />
                </>
            )}
        </div>
    )
}

export default ManageTags
