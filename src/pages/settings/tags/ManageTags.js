import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import {
    Form,
    Button,
    Popover,
    PopoverTitle,
    PopoverContent,
} from 'reactstrap'

import InputField from '../../common/forms/InputField'

import Table from './Table'
import Pagination from '../../common/components/Pagination'

import * as tagsActions from '../../../state/tags/actions'

@connect((state) => {
    return {
        tags: state.tags
    }
}, {
    fetch: tagsActions.fetchTags,
    create: tagsActions.create,
    remove: tagsActions.remove,
    selectAll: tagsActions.selectAll,
    setPage: tagsActions.setPage,
    merge: tagsActions.merge
})
export default class ManageTags extends Component {
    static propTypes = {
        tags: PropTypes.object.isRequired,
        fetch: PropTypes.func.isRequired,
        create: PropTypes.func.isRequired,
        remove: PropTypes.func.isRequired,
        selectAll: PropTypes.func.isRequired,
        setPage: PropTypes.func.isRequired,
        merge: PropTypes.func.isRequired,
    }

    state = {
        sort: 'name',
        reverse: false,
        newTag: '',
        showCreationPopup: false,
        askRemoveConfirmation: false,
    }

    componentDidMount() {
        this.props.fetch()
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.tags.getIn(['_internal', 'pagination', 'page']) !==
            nextProps.tags.getIn(['_internal', 'pagination', 'page'])) {
            this.props.fetch()
        }
    }

    _onSort = (sort, reverse) => {
        this.setState({
            sort,
            reverse
        })
    }

    _onCreate = (e) => {
        e.preventDefault()

        this.props.create({
            name: this.state.newTag,
        }).then(() => {
            this.setState({
                newTag: '',
                showCreationPopup: false,
            })
        })
    }

    _bulkDelete = () => {
        this.setState({askRemoveConfirmation: false})
        return this.props.tags.get('meta', fromJS({}))
            .forEach((meta, key) => {
                if (meta.get('selected')) {
                    this.props.remove(key)
                }
            })
    }

    _merge = () => {
        this.setState({askMergeConfirmation: false})
        const selectedTagMeta = this.props.tags.get('meta', fromJS({})).filter((meta) => meta.get('selected'))
        this.props.merge(selectedTagMeta.keySeq().toList()).then(() => {
            return this.props.fetch()
        })
    }

    _toggleCreationPopup = () => {
        this.setState({showCreationPopup: !this.state.showCreationPopup})
    }

    _toggleRemoveConfirmation = () => {
        this.setState({askRemoveConfirmation: !this.state.askRemoveConfirmation})
    }

    _toggleMergeConfirmation = () => {
        this.setState({askMergeConfirmation: !this.state.askMergeConfirmation})
    }

    render() {
        const {tags, selectAll} = this.props
        const {sort, reverse} = this.state

        // check if any items are selected
        const selected = tags.get('meta', fromJS({}))
            .filter(meta => meta.get('selected'))
            .size

        const manageTagsClassName = classnames({
            'manage-tags-bulk': selected > 0
        })

        return (
            <div className={manageTagsClassName}>
                <div className="manage-tags d-flex justify-content-between">
                    <h1>
                        <i className="fa fa-fw fa-tag blue mr-2" />
                        Manage tags
                    </h1>

                    <div className="column right aligned">
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
                                            <PopoverTitle>Are you sure?</PopoverTitle>
                                            <PopoverContent>
                                                <p>
                                                    Are you sure you want to merge these tags?{' '}
                                                    <b>This action cannot be undone</b>.
                                                </p>
                                                <Button
                                                    type="submit"
                                                    color="success"
                                                    onClick={this._merge}
                                                >
                                                    Confirm
                                                </Button>
                                            </PopoverContent>
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
                                            <PopoverTitle>Are you sure?</PopoverTitle>
                                            <PopoverContent>
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
                                            </PopoverContent>
                                        </Popover>
                                    </span>
                                )
                            }

                            <span>
                                <Button
                                    id="create-tag-button"
                                    color="primary"
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
                                    <PopoverTitle>Create a new tag</PopoverTitle>
                                    <PopoverContent>
                                        <Form onSubmit={this._onCreate}>
                                            <div className="d-flex align-items-center">
                                                <div className="mr-2">
                                                    <InputField
                                                        type="text"
                                                        placeholder="New tag name"
                                                        value={this.state.newTag}
                                                        autoFocus
                                                        onChange={value => this.setState({newTag: value})}
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
                                                    <i className="fa fa-fw fa-check" />
                                                </Button>
                                            </div>
                                        </Form>
                                    </PopoverContent>
                                </Popover>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="manage-tags-description">
                    <p>
                        You can tag tickets to keep track of topics customers are contacting you about.
                    </p>
                </div>

                <Table
                    rows={tags}
                    sort={sort}
                    reverse={reverse}
                    onSort={this._onSort}
                    onSelectAll={selectAll}
                />

                <Pagination
                    pageCount={tags.getIn(['_internal', 'pagination', 'nb_pages']) || 1}
                    currentPage={tags.getIn(['_internal', 'pagination', 'page']) || 1}
                    onChange={page => this.props.setPage(page)}
                />
            </div>
        )
    }
}
