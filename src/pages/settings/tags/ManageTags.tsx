import React, {FormEvent, useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {Container, Form, Popover, PopoverBody, PopoverHeader} from 'reactstrap'
import {CancelToken} from 'axios'
import {useAsyncFn, useDebounce, useEffectOnce} from 'react-use'
import {fromJS, List, Map} from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useCancellableRequest from 'hooks/useCancellableRequest'
import {OrderDirection, PaginationMeta} from 'models/api/types'
import {fetchTags} from 'models/tag/resources'
import {TagSortableProperties} from 'models/tag/types'
import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import Pagination from 'pages/common/components/Pagination'
import Video from 'pages/common/components/Video/Video'
import Search from 'pages/common/components/Search'
import TextInput from 'pages/common/forms/input/TextInput'
import settingsCss from 'pages/settings/settings.less'
import {
    bulkDelete,
    create,
    merge,
    resetMeta,
    selectAll,
} from 'state/tags/actions'
import {FETCH_TAG_LIST_ERROR, REMOVE_TAG_ERROR} from 'state/tags/constants'
import {getMeta, getIsCreating, getSelectAll} from 'state/tags/selectors'
import {ServerErrorAction} from 'store/middlewares/serverErrorHandler'

import css from './ManageTags.less'
import Table from './Table'

const ManageTags = () => {
    const dispatch = useAppDispatch()
    const isCreating = useAppSelector(getIsCreating)
    const areAllTagsSelected = useAppSelector(getSelectAll)

    const [sort, setSort] = useState(TagSortableProperties.Usage)
    const [reverse, setReverse] = useState(true)
    const [search, setSearch] = useState('')
    const [newTag, setNewTag] = useState('')
    const [showCreationPopup, setShowCreationPopup] = useState(false)
    const [tags, setTags] = useState<List<any>>(fromJS([]))
    const [pagination, setPagination] = useState<PaginationMeta>()
    const currentPage = useMemo(() => pagination?.page || 1, [pagination])
    const numberPages = useMemo(() => pagination?.nb_pages || 1, [pagination])

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
            page = currentPage,
            sortArg = sort,
            reverseArg = reverse,
            searchArg = search,
            refreshPreviousPage = false,
        }: {
            page?: number
            sortArg?: TagSortableProperties
            reverseArg?: boolean
            searchArg?: string
            refreshPreviousPage?: boolean
        } = {}) => {
            try {
                const params = {
                    page: refreshPreviousPage && page > 1 ? page - 1 : page,
                    orderBy: sortArg,
                    orderDir: reverseArg
                        ? OrderDirection.Desc
                        : OrderDirection.Asc,
                    search: searchArg,
                }

                const {data, meta} = await fetchTags(params, cancelToken)
                setTags(fromJS(data))
                setPagination(meta)
                dispatch(resetMeta())
            } catch (error) {
                dispatch({
                    type: FETCH_TAG_LIST_ERROR,
                    error,
                    reason: 'Failed to fetch tags',
                })
            }
        }

    const [cancellableFetchTags, cancelFetchTags] =
        useCancellableRequest(createFetchTags)

    const [{loading: isLoading}, fetchPage] = useAsyncFn(
        cancellableFetchTags,
        [currentPage, reverse, search, sort],
        {loading: true}
    )

    const onSort = (sort: TagSortableProperties, reverse: boolean) => {
        setSort(sort)
        setReverse(reverse)
        void fetchPage({sortArg: sort, reverseArg: reverse})
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
            numberPages > 1 &&
            currentPage === numberPages &&
            selectedTags.size === tags.size &&
            (res as ServerErrorAction)?.type !== REMOVE_TAG_ERROR
        ) {
            await fetchPage({page: currentPage - 1})
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

    const handleSelectAll = () => dispatch(selectAll(tags.toJS()))

    const toggleCreationPopup = () => setShowCreationPopup(!showCreationPopup)

    const handlePageChange = (page: number) => {
        void fetchPage({page})
        areAllTagsSelected && handleSelectAll()
    }

    const [, cancel] = useDebounce(
        () => {
            void fetchPage({searchArg: search, page: 1})
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
                    <Pagination
                        className={classnames(
                            'pagination-transparent',
                            css.pagination
                        )}
                        pageCount={numberPages}
                        currentPage={currentPage}
                        onChange={handlePageChange}
                    />
                </>
            )}
        </div>
    )
}

export default ManageTags
