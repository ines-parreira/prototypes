// @flow
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {
    Button,
    Container,
    Form,
    Popover,
    PopoverBody,
    PopoverHeader,
} from 'reactstrap'

import type {List, Map} from 'immutable'

import InputField from '../../common/forms/InputField'

import Pagination from '../../common/components/Pagination'
import Loader from '../../common/components/Loader'
import PageHeader from '../../common/components/PageHeader.tsx'
import Video from '../../common/components/Video'
import Search from '../../common/components/Search'

import * as tagsActions from '../../../state/tags/actions.ts'
import * as tagsSelectors from '../../../state/tags/selectors.ts'

import Table from './Table'
import css from './ManageTags.less'

type Props = {
    tags: List<*>,
    meta: Map<*, *>,
    currentPage: number,
    numberPages: number,
    fetch: typeof tagsActions.fetchTags,
    create: typeof tagsActions.create,
    remove: typeof tagsActions.remove,
    selectAll: () => void,
    setPage: typeof tagsActions.setPage,
    merge: typeof tagsActions.merge,
    bulkDelete: typeof tagsActions.bulkDelete,
}

type State = {
    sort: string,
    search: string,
    reverse: boolean,
    newTag: string,
    showCreationPopup: boolean,
    isFetching: boolean,
}

export class ManageTags extends Component<Props, State> {
    state = {
        sort: 'usage',
        reverse: true,
        search: '',
        newTag: '',
        showCreationPopup: false,
        isFetching: false,
    }

    componentDidMount() {
        this.setState({isFetching: true})
        this.props.fetch().then(() => {
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
            this.props.fetch(
                nextPage,
                this.state.sort,
                this.state.reverse,
                this.state.search
            )
        }
    }

    _fetchPage = () => {
        this.props.fetch(
            this.props.currentPage,
            this.state.sort,
            this.state.reverse,
            this.state.search
        )
    }

    _onSearch = (search: string) => {
        this.setState({search}, () => {
            this.props.fetch(1, this.state.sort, this.state.reverse, search)
        })
    }

    _onSort = (sort: string, reverse: boolean) => {
        this.props
            .fetch(this.props.currentPage, sort, reverse, this.state.search)
            .then(() => {
                this.setState({
                    sort,
                    reverse,
                })
            })
    }

    _onCreate = (event: Object) => {
        event.preventDefault()

        this.props
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

        let tagIDs = []
        meta.forEach((meta, key) => {
            if (meta.get('selected')) {
                tagIDs.push(key)
            }
        })
        bulkDelete(tagIDs).then(() => {
            this._fetchPage()
        })
    }

    _merge = () => {
        const {meta, merge} = this.props

        const selectedTagMeta = meta.filter((meta) => meta.get('selected'))

        return merge(selectedTagMeta.keySeq().toList()).then(() => {
            this._fetchPage()
        })
    }

    _toggleCreationPopup = () => {
        this.setState({showCreationPopup: !this.state.showCreationPopup})
    }

    render() {
        const {tags, currentPage, numberPages, selectAll, meta} = this.props
        const {sort, reverse, isFetching} = this.state

        if (isFetching) {
            return <Loader />
        }

        // check if any items are selected
        const selected = meta.filter((meta) => meta.get('selected')).size

        return (
            <div
                className={classnames('full-width', {
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
                                color="success"
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
                                            <Button
                                                color="success"
                                                type="submit"
                                                className={classnames({
                                                    'btn-loading': tags.getIn([
                                                        '_internal',
                                                        'creating',
                                                    ]),
                                                })}
                                            >
                                                <i className="material-icons">
                                                    check
                                                </i>
                                            </Button>
                                        </div>
                                    </Form>
                                </PopoverBody>
                            </Popover>
                        </div>
                    </div>
                </PageHeader>

                <Container fluid className="page-container">
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
                    onSort={this._onSort}
                    onSelectAll={selectAll}
                    refresh={this._fetchPage}
                    onMerge={this._merge}
                    onBulkDelete={this._bulkDelete}
                />

                <Pagination
                    className="pagination-transparent"
                    pageCount={numberPages}
                    currentPage={currentPage}
                    onChange={(page) => this.props.setPage(page)}
                />
            </div>
        )
    }
}

export default connect(
    (state) => {
        return {
            tags: tagsSelectors.getTags(state),
            meta: tagsSelectors.getMeta(state),
            currentPage: tagsSelectors.getCurrentPage(state),
            numberPages: tagsSelectors.getNumberPages(state),
        }
    },
    {
        fetch: tagsActions.fetchTags,
        create: tagsActions.create,
        remove: tagsActions.remove,
        selectAll: tagsActions.selectAll,
        setPage: tagsActions.setPage,
        merge: tagsActions.merge,
        bulkDelete: tagsActions.bulkDelete,
    }
)(ManageTags)
