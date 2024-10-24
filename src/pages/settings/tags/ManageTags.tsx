import {
    ListTagsOrderBy,
    ListTagsParams,
    OrderDirection,
    Tag,
} from '@gorgias/api-queries'
import axios, {AxiosError, CancelToken} from 'axios'
import classnames from 'classnames'
import {Map} from 'immutable'
import React, {
    FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {Link} from 'react-router-dom'
import {Form, Popover, PopoverBody, PopoverHeader} from 'reactstrap'

import {useAppNode} from 'appNode'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'
import useCancellableRequest from 'hooks/useCancellableRequest'
import useEffectOnce from 'hooks/useEffectOnce'
import {CursorDirection, CursorMeta} from 'models/api/types'
import {fetchTags} from 'models/tag/resources'
import {OrderBy, OrderByOrderDir} from 'models/tag/types'
import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import Loader from 'pages/common/components/Loader/Loader'
import Navigation from 'pages/common/components/Navigation/Navigation'
import PageHeader from 'pages/common/components/PageHeader'
import Search from 'pages/common/components/Search'
import Video from 'pages/common/components/Video/Video'
import TextInput from 'pages/common/forms/input/TextInput'
import settingsCss from 'pages/settings/settings.less'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {bulkDelete, create, merge, selectAll} from 'state/tags/actions'
import {REMOVE_TAG_ERROR} from 'state/tags/constants'

import {getMeta, getIsCreating, getSelectAll} from 'state/tags/selectors'
import {ServerErrorAction} from 'store/middlewares/serverErrorHandler'

import css from './ManageTags.less'
import Table from './Table'

const ManageTags = () => {
    const dispatch = useAppDispatch()
    const isCreating = useAppSelector(getIsCreating)
    const areAllTagsSelected = useAppSelector(getSelectAll)

    const [meta, setMeta] = useState<CursorMeta | null>(null)
    const [sort, setSort] = useState<OrderBy>(ListTagsOrderBy.Usage)
    const [reverse, setReverse] = useState(true)
    const [search, setSearch] = useState('')
    const [newTag, setNewTag] = useState('')
    const [showCreationPopup, setShowCreationPopup] = useState(false)
    const [tags, setTags] = useState<Tag[]>([])
    const toggledTags = useAppSelector(getMeta)
    const selectedTagsIds = useMemo(
        () =>
            toggledTags
                .filter(
                    (meta: Map<any, any>) => meta.get('selected') as boolean
                )
                .keySeq()
                .toList(),
        [toggledTags]
    )
    const appNode = useAppNode()

    const createFetchTags =
        (cancelToken: CancelToken) =>
        async ({
            orderBy = sort,
            orderDir = reverse ? OrderDirection.Desc : OrderDirection.Asc,
            search,
            direction,
            refreshPreviousPage,
        }: {
            orderBy?: OrderBy
            orderDir?: OrderDirection
            search?: ListTagsParams['search']
            direction?: CursorDirection
            refreshPreviousPage?: boolean
        } = {}) => {
            const params = {
                cursor:
                    (direction === CursorDirection.PrevCursor ||
                        refreshPreviousPage) &&
                    meta?.prev_cursor
                        ? meta.prev_cursor
                        : direction === CursorDirection.NextCursor &&
                            meta?.next_cursor
                          ? meta.next_cursor
                          : undefined,
                order_by: `${orderBy}:${orderDir}` as OrderByOrderDir,
                search,
            }

            try {
                const res = await fetchTags(params, {cancelToken})
                setMeta(res.data.meta)
                setTags(res.data.data)
                setSort(orderBy || ListTagsOrderBy.UsageDescNameDesc)
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

    const onSort = (sort: OrderBy, reverse: boolean) => {
        void fetchPage({
            orderBy: sort,
            orderDir: reverse ? OrderDirection.Desc : OrderDirection.Asc,
            search,
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
        const res = await dispatch(bulkDelete(selectedTagsIds.toJS()))

        if (
            !!meta?.prev_cursor &&
            !meta?.next_cursor &&
            (res as ServerErrorAction)?.type !== REMOVE_TAG_ERROR
        ) {
            await fetchPage({refreshPreviousPage: true})
        } else {
            await fetchPage()
        }
        handleSelectAll(false)
    }

    const handleMerge = async () => {
        await dispatch(merge(selectedTagsIds))
        await fetchPage()
        handleSelectAll(false)
    }

    const handleSelectAll = (value?: boolean) =>
        dispatch(selectAll(tags, value))

    const toggleCreationPopup = () => setShowCreationPopup(!showCreationPopup)

    const handlePageChange = (direction: CursorDirection) => {
        void fetchPage({direction, search})
        areAllTagsSelected && handleSelectAll()
    }

    const onSearchChange = useCallback(
        (search: string) => {
            setSearch(search)
            void fetchPage({search})
        },
        [fetchPage]
    )

    useEffectOnce(() => {
        void fetchPage()
    })

    useEffect(() => () => cancelFetchTags(), [cancelFetchTags])

    return (
        <div
            className={classnames('full-width overflow-auto', {
                manageTagsClassName: selectedTagsIds.size > 0,
            })}
        >
            <PageHeader title="Manage tags">
                <div className="manage-tags-bulk-actions">
                    <div className="d-flex">
                        <Search
                            value={search}
                            onChange={onSearchChange}
                            placeholder="Search tags by name..."
                            searchDebounceTime={500}
                            className="mr-2"
                        />
                        <Button
                            id="create-tag-button"
                            onClick={toggleCreationPopup}
                        >
                            Create tag
                        </Button>
                        <Popover
                            className="popoverDark"
                            placement="bottom"
                            isOpen={showCreationPopup}
                            target="create-tag-button"
                            toggle={toggleCreationPopup}
                            trigger="legacy"
                            fade={false}
                            container={appNode ?? undefined}
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

            <div className={settingsCss.pageContainer}>
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
                    <Video youtubeId="MHwrVTk6SNQ" legend="Working with tags" />
                </div>
            </div>

            {isLoading ? (
                <Loader className={css.loader} />
            ) : (
                <>
                    <Table
                        sort={sort}
                        reverse={reverse}
                        onSort={onSort}
                        onSelectAll={(value) => handleSelectAll(value)}
                        refresh={fetchPage}
                        onMerge={handleMerge}
                        onBulkDelete={handleBulkDelete}
                        tags={tags}
                        selectedTagsIds={selectedTagsIds}
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
