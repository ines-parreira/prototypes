import React, {Component, ComponentProps, FormEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {Container, Form, Popover, PopoverBody, PopoverHeader} from 'reactstrap'
import {Map} from 'immutable'

import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import InputField from 'pages/common/forms/InputField'
import Pagination from '../../common/components/Pagination'
import Loader from '../../common/components/Loader/Loader'
import PageHeader from '../../common/components/PageHeader'
import Video from '../../common/components/Video/Video'
import Search from '../../common/components/Search'
import {
    fetchTags,
    create,
    remove,
    selectAll,
    setPage,
    merge,
    bulkDelete,
} from '../../../state/tags/actions'
import {
    getMeta,
    getCurrentPage,
    getNumberPages,
    getIsCreating,
} from '../../../state/tags/selectors'
import {RootState} from '../../../state/types'
import {TagSortableProperty} from '../../../state/tags/types'
import withCancellableRequest, {
    CancellableRequestInjectedProps,
} from '../../common/utils/withCancellableRequest'
import settingsCss from '../settings.less'

import Table from './Table'
import css from './ManageTags.less'

type Props = CancellableRequestInjectedProps<
    'fetchTagsCancellable',
    'cancelFetchTagsCancellable',
    typeof fetchTags
> &
    ConnectedProps<typeof connector>

type State = {
    sort: TagSortableProperty
    search: string
    reverse: boolean
    newTag: string
    showCreationPopup: boolean
    isFetching: boolean
}

export class ManageTagsContainer extends Component<Props, State> {
    state = {
        sort: TagSortableProperty.Usage,
        reverse: true,
        search: '',
        newTag: '',
        showCreationPopup: false,
        isFetching: false,
    }

    componentDidMount() {
        this.setState({isFetching: true})

        void this.props
            .fetchTagsCancellable(undefined, undefined, undefined, undefined)
            .then(() => {
                this.setState({isFetching: false})
            })
    }

    componentWillReceiveProps(nextProps: Props) {
        const {currentPage} = this.props
        const nextPage = nextProps.currentPage
        const nextNumPages = nextProps.numberPages

        if (nextPage > nextNumPages) {
            // needed in case user deletes all tags on the last page. We want to now fetch tags for previous page
            this.props.setPage(nextNumPages)
        } else if (currentPage !== nextPage) {
            void this.props.fetchTagsCancellable(
                nextPage,
                this.state.sort,
                this.state.reverse,
                this.state.search
            )
        }
    }

    componentWillUnmount() {
        const {cancelFetchTagsCancellable} = this.props

        cancelFetchTagsCancellable()
    }

    _fetchPage = () => {
        void this.props.fetchTagsCancellable(
            this.props.currentPage,
            this.state.sort,
            this.state.reverse,
            this.state.search
        )
    }

    _onSearch = (search: string) => {
        this.setState({search}, () => {
            void this.props.fetchTagsCancellable(
                1,
                this.state.sort,
                this.state.reverse,
                search
            )
        })
    }

    _onSort = (sort: TagSortableProperty, reverse: boolean) => {
        void this.props
            .fetchTagsCancellable(
                this.props.currentPage,
                sort,
                reverse,
                this.state.search
            )
            .then(() => {
                this.setState({
                    sort,
                    reverse,
                })
            })
    }

    _onCreate = (event: FormEvent) => {
        event.preventDefault()

        void this.props
            .create({
                name: this.state.newTag,
            })
            .then(() => {
                this._fetchPage()
            })
            .then(() =>
                this.setState({
                    newTag: '',
                    showCreationPopup: false,
                })
            )
    }

    _bulkDelete = () => {
        const {meta, bulkDelete} = this.props

        const tagIDs: string[] = []
        meta.forEach((meta: Map<any, any>, key) => {
            if (meta.get('selected')) {
                tagIDs.push(key)
            }
        })
        void bulkDelete(tagIDs).then(() => {
            this._fetchPage()
        })
    }

    _merge = () => {
        const {meta, merge} = this.props

        const selectedTagMeta = meta.filter(
            (meta: Map<any, any>) => meta.get('selected') as boolean
        )

        return merge(selectedTagMeta.keySeq().toList()).then(() => {
            this._fetchPage()
        })
    }

    _toggleCreationPopup = () => {
        this.setState({showCreationPopup: !this.state.showCreationPopup})
    }

    render() {
        const {currentPage, numberPages, selectAll, meta, isCreating} =
            this.props
        const {sort, reverse, isFetching} = this.state

        if (isFetching) {
            return <Loader />
        }

        // check if any items are selected
        const selected = meta.filter(
            (meta: Map<any, any>) => meta.get('selected') as boolean
        ).size

        return (
            <div
                className={classnames('full-width overflow-auto', {
                    manageTagsClassName: selected > 0,
                })}
            >
                <PageHeader title="Manage tags">
                    <div className="manage-tags-bulk-actions">
                        <div className="d-flex">
                            <Search
                                bindKey
                                forcedQuery={this.state.search}
                                onChange={this._onSearch}
                                placeholder="Search tags by name..."
                                searchDebounceTime={300}
                                className="mr-2"
                            />
                            <Button
                                id="create-tag-button"
                                type="button"
                                onClick={this._toggleCreationPopup}
                            >
                                Create tag
                            </Button>
                            <Popover
                                placement="bottom"
                                isOpen={this.state.showCreationPopup}
                                target="create-tag-button"
                                toggle={this._toggleCreationPopup}
                                trigger="legacy"
                                fade={false}
                            >
                                <PopoverHeader>Create a new tag</PopoverHeader>
                                <PopoverBody>
                                    <Form onSubmit={this._onCreate}>
                                        <div className="d-flex align-items-center">
                                            <div className="mr-2">
                                                <InputField
                                                    type="text"
                                                    placeholder="New tag name"
                                                    value={this.state.newTag}
                                                    autoFocus
                                                    onChange={(value) =>
                                                        this.setState({
                                                            newTag: value,
                                                        })
                                                    }
                                                    required
                                                    inline
                                                />
                                            </div>
                                            <IconButton isDisabled={isCreating}>
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
                        <Video
                            videoId="MHwrVTk6SNQ"
                            legend="Working with tags"
                        />
                    </div>
                </Container>

                <Table
                    sort={sort}
                    reverse={reverse}
                    onSort={
                        this._onSort as ComponentProps<typeof Table>['onSort']
                    }
                    onSelectAll={selectAll}
                    refresh={this._fetchPage}
                    onMerge={this._merge}
                    onBulkDelete={this._bulkDelete}
                />

                <Pagination
                    className={classnames(
                        'pagination-transparent',
                        css.pagination
                    )}
                    pageCount={numberPages}
                    currentPage={currentPage}
                    onChange={(page) => this.props.setPage(page)}
                />
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => {
        return {
            isCreating: getIsCreating(state),
            meta: getMeta(state),
            currentPage: getCurrentPage(state),
            numberPages: getNumberPages(state),
        }
    },
    {
        create,
        remove,
        selectAll,
        setPage,
        merge,
        bulkDelete,
    }
)

export default withCancellableRequest(
    'fetchTagsCancellable',
    fetchTags
)(connector(ManageTagsContainer))
