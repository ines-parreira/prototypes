import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import {
    Button,
    Popover,
    PopoverTitle,
    PopoverContent,
} from 'reactstrap'

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
    setPage: tagsActions.setPage
})
export default class ManageTags extends Component {
    static propTypes = {
        tags: PropTypes.object.isRequired,
        fetch: PropTypes.func.isRequired,
        create: PropTypes.func.isRequired,
        remove: PropTypes.func.isRequired,
        selectAll: PropTypes.func.isRequired,
        setPage: PropTypes.func.isRequired,
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

    _toggleCreationPopup = () => {
        this.setState({showCreationPopup: !this.state.showCreationPopup})
    }

    _toggleRemoveConfirmation = () => {
        this.setState({askRemoveConfirmation: !this.state.askRemoveConfirmation})
    }

    render() {
        const {tags, selectAll} = this.props
        const {sort, reverse} = this.state

        // check if any items are selected
        const selected = tags.get('meta', fromJS({})).some((meta) => {
            if (meta.get('selected')) {
                return true
            }
        })

        const manageTagsClassName = classnames({
            'manage-tags-bulk': selected
        })

        const createTagFormClassName = classnames('ui form', {
            loading: tags.getIn(['_internal', 'creating'])
        })

        return (
            <div className={manageTagsClassName}>
                <div className="manage-tags d-flex justify-content-between">
                    <h1 className="column">
                        <i className="tag blue icon ml5ni mr10i" />
                        Manage tags
                    </h1>

                    <div className="column right aligned">
                        <div className="manage-tags-bulk-actions">
                            <Button
                                id="bulk-remove-button"
                                color="secondary"
                                type="button"
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
                        </div>

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
                                <form
                                    className={createTagFormClassName}
                                    onSubmit={this._onCreate}
                                >
                                    <div className="d-flex">
                                        <input
                                            type="text"
                                            className="mr-2"
                                            placeholder="New tag name"
                                            required
                                            value={this.state.newTag}
                                            autoFocus
                                            onChange={e => this.setState({newTag: e.target.value})}
                                        />
                                        <Button
                                            color="success"
                                            type="submit"
                                        >
                                            <i className="fa fa-fw fa-check" />
                                        </Button>
                                    </div>
                                </form>
                            </PopoverContent>
                        </Popover>
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
