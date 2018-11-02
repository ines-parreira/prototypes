// @flow
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import classnames from 'classnames'
import {
    Container,
    Button,
    Form,
    Popover,
    PopoverHeader,
    PopoverBody,
} from 'reactstrap'

import InputField from '../../common/forms/InputField'

import Table from './Table'
import Pagination from '../../common/components/Pagination'
import Loader from '../../common/components/Loader'
import PageHeader from '../../common/components/PageHeader'
import Video from '../../common/components/Video'

import * as tagsActions from '../../../state/tags/actions'
import * as tagsSelectors from '../../../state/tags/selectors'

import css from './ManageTags.less'

import type {Map, List} from 'immutable'


type Props = {
    tags: List<*>,
    meta: Map<*,*>,
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
    reverse: boolean,
    newTag: string,
    showCreationPopup: boolean,
    askMergeConfirmation: boolean,
    askRemoveConfirmation: boolean,
    isFetching: boolean,
    mergeTagDestination: string
}

export class ManageTags extends Component<Props, State> {
    state = {
        sort: 'usage',
        reverse: true,
        newTag: '',
        showCreationPopup: false,
        askMergeConfirmation: false,
        askRemoveConfirmation: false,
        isFetching: false,
        mergeTagDestination: '',
    }

    componentDidMount() {
        this.setState({isFetching: true})
        this.props.fetch()
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
            this.props.fetch(nextPage, this.state.sort, this.state.reverse)
        }
    }

    _fetchPage = () => {
        this.props.fetch(this.props.currentPage, this.state.sort, this.state.reverse)
    }

    _onSort = (sort: string, reverse: boolean) => {
        this.props.fetch(this.props.currentPage, sort, reverse)
            .then(() => {
                this.setState({
                    sort,
                    reverse,
                })
            })
    }

    _onCreate = (event: Object) => {
        event.preventDefault()

        this.props.create({
            name: this.state.newTag,
        }).then(() => {
            this._fetchPage()
        }).then(() =>
            this.setState({
                newTag: '',
                showCreationPopup: false,
            }))
    }

    _bulkDelete = () => {
        this.setState({askRemoveConfirmation: false})
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
        this.setState({askMergeConfirmation: false})
        const {meta, merge} = this.props

        const selectedTagMeta = meta.filter((meta) => meta.get('selected'))

        return merge(
            selectedTagMeta.keySeq().toList()
        ).then(() => {
            this._fetchPage()
        }).then(() => {
            this.setState({
                mergeTagDestination: ''
            })
        })
    }

    _toggleCreationPopup = () => {
        this.setState({showCreationPopup: !this.state.showCreationPopup})
    }

    _toggleRemoveConfirmation = () => {
        this.setState({askRemoveConfirmation: !this.state.askRemoveConfirmation})
    }

    _toggleMergeConfirmation = () => {
        const {tags, meta} = this.props
        const destID = meta.filter((meta) => meta.get('selected')).keySeq().toList().last()
        const destName = tags.filter((meta) => meta.get('id').toString() === destID.toString()).first().get('name', '')
        this.setState({
            askMergeConfirmation: !this.state.askMergeConfirmation,
            mergeTagDestination: destName
        })
    }

    render() {
        const {tags, currentPage, numberPages, selectAll, meta} = this.props
        const {sort, reverse, isFetching, mergeTagDestination} = this.state

        if (isFetching) {
            return <Loader/>
        }

        // check if any items are selected
        const selected = meta
            .filter((meta) => meta.get('selected'))
            .size

        return (
            <div className={classnames('full-width', {manageTagsClassName: selected > 0})}>
                <PageHeader title="Manage tags">
                    <div className="manage-tags-bulk-actions">
                        {
                            selected > 1 && (
                                <span>
                                        <Button
                                            id="bulk-merge-button"
                                            color="secondary"
                                            type="button"
                                            className="mr-2"
                                            onClick={this._toggleMergeConfirmation}
                                        >
                                            Merge
                                        </Button>
                                        <Popover
                                            placement="bottom"
                                            isOpen={this.state.askMergeConfirmation}
                                            target="bulk-merge-button"
                                            toggle={this._toggleMergeConfirmation}
                                        >
                                            <PopoverHeader>Are you sure?</PopoverHeader>
                                            <PopoverBody>
                                                <p>
                                                    You are about to merge {selected} tags into{' '}
                                                    <b>{mergeTagDestination}</b>.<br/>
                                                    <b>This action cannot be undone</b>.
                                                </p>
                                                <Button
                                                    type="submit"
                                                    color="success"
                                                    onClick={this._merge}
                                                >
                                                    Confirm
                                                </Button>
                                            </PopoverBody>
                                        </Popover>
                                    </span>
                            )
                        }
                        {
                            selected > 0 && (
                                <span>
                                        <Button
                                            id="bulk-remove-button"
                                            color="secondary"
                                            type="button"
                                            className="mr-2"
                                            onClick={this._toggleRemoveConfirmation}
                                        >
                                            Delete
                                        </Button>
                                        <Popover
                                            placement="bottom"
                                            isOpen={this.state.askRemoveConfirmation}
                                            target="bulk-remove-button"
                                            toggle={this._toggleRemoveConfirmation}
                                        >
                                            <PopoverHeader>Are you sure?</PopoverHeader>
                                            <PopoverBody>
                                                <p>
                                                    Are you sure you want to delete these tags?{' '}
                                                    <b>They will be removed from all tickets</b>.
                                                </p>
                                                <Button
                                                    type="submit"
                                                    color="success"
                                                    onClick={this._bulkDelete}
                                                >
                                                    Confirm
                                                </Button>
                                            </PopoverBody>
                                        </Popover>
                                    </span>
                            )
                        }

                        <span>
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
                                                    onChange={(value) => this.setState({newTag: value})}
                                                    required
                                                    inline
                                                />
                                            </div>
                                            <Button
                                                color="success"
                                                type="submit"
                                                className={classnames({
                                                    'btn-loading': tags.getIn(['_internal', 'creating']),
                                                })}
                                            >
                                                <i className="fa fa-fw fa-check"/>
                                            </Button>
                                        </div>
                                    </Form>
                                </PopoverBody>
                            </Popover>
                        </span>
                    </div>
                </PageHeader>

                <Container fluid className="page-container">
                    <div className={css.description}>
                        <div>
                            <p>
                                You can tag tickets to keep track of topics customers are contacting you about.
                            </p>
                            <p>
                                Check your tag statistics <Link to="/app/stats/tags">here</Link>.
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

export default connect((state) => {
    return {
        tags: tagsSelectors.getTags(state),
        meta: tagsSelectors.getMeta(state),
        currentPage: tagsSelectors.getCurrentPage(state),
        numberPages: tagsSelectors.getNumberPages(state)
    }
}, {
    fetch: tagsActions.fetchTags,
    create: tagsActions.create,
    remove: tagsActions.remove,
    selectAll: tagsActions.selectAll,
    setPage: tagsActions.setPage,
    merge: tagsActions.merge,
    bulkDelete: tagsActions.bulkDelete
})(ManageTags)
