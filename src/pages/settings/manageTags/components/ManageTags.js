import React, {Component, PropTypes} from 'react'
import ManageTagsTable from './ManageTagsTable'
import classnames from 'classnames'
import SemanticPaginator from '../../../common/components/SemanticPaginator'
import {fromJS} from 'immutable'

class ManageTags extends Component {
    constructor() {
        super()

        this.state = {
            sort: 'name',
            reverse: false
        }

        this.tagName = {}
    }

    componentDidMount() {
        this.props.fetch()

        $(this.refs.createTag).popup({
            popup: $(this.refs.createTagPopup),
            on: 'click',
            position: 'bottom right'
        })
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.tags.getIn(['_internal', 'pagination', 'page']) !==
            nextProps.tags.getIn(['_internal', 'pagination', 'page'])) {
            this.props.fetch()
        }
    }


    componentDidUpdate(prevProps) {
        const oldCreating = prevProps.tags.getIn(['_internal', 'creating'])
        const newCreating = this.props.tags.getIn(['_internal', 'creating'])

        // a tag was created, hide the popup
        if (oldCreating && !newCreating) {
            $(this.refs.createTag).popup('hide')
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
            name: this.tagName.value
        })
    }

    _tagNameRef = (input) => {
        this.tagName = input
    }

    _bulkDelete = () => {
        const message = 'Are you sure you want to delete these tags?\nThey will be removed from all tickets.'
        if (window.confirm(message)) {
            this.props.tags.get('meta', fromJS({})).forEach((meta, key) => {
                if (meta.get('selected')) {
                    this.props.remove(key)
                }
            })
        }
    }

    _onRemove = (tagId) => {
        const message = 'Are you sure you want to delete this tag?\nIt will be removed from all tickets.'
        if (window.confirm(message)) {
            this.props.remove(tagId)
        }
    }

    render() {
        const {tags, select, selectAll, edit, save, cancel} = this.props
        const {sort, reverse} = this.state

        // check if any items are selected
        const selected = tags.get('meta', fromJS({})).some((meta) => {
            if (meta.get('selected')) {
                return true
            }
        })

        const manageTagsClassName = classnames('ui grid', {
            'manage-tags-bulk': selected
        })

        const createTagFormClassName = classnames('ui form', {
            loading: tags.getIn(['_internal', 'creating'])
        })

        return (
            <div className={manageTagsClassName}>
                <div className="manage-tags thirteen wide column">
                    <div className="ui grid two column">
                        <h1 className="column">
                            <i className="tag blue icon ml5ni mr10i"/>
                            Manage tags
                        </h1>

                        <div className="column right aligned">
                            <div className="manage-tags-bulk-actions">
                                <button className="ui basic button" type="button" onClick={this._bulkDelete}>
                                    Delete
                                </button>
                            </div>

                            <button className="ui green button" type="button" ref="createTag">
                                Create tag
                            </button>

                            <div className="ui popup manage-tags-create-popup" ref="createTagPopup">
                                <form className={createTagFormClassName} onSubmit={this._onCreate}>
                                    <div className="ui right labeled input">
                                        <input type="text" placeholder="New tag name" required ref={this._tagNameRef}/>
                                        <button className="ui green label" type="submit">
                                            <i className="icon checkmark"></i>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="manage-tags-description">
                        <p>
                            You can tag tickets to keep track of topics customers are contacting you about.
                        </p>
                    </div>

                    <ManageTagsTable
                        rows={tags}
                        sort={sort}
                        reverse={reverse}
                        onSort={this._onSort}
                        onEdit={edit}
                        onSave={save}
                        onCancel={cancel}
                        onRemove={this._onRemove}
                        onSelect={select}
                        onSelectAll={selectAll}
                    />

                    <SemanticPaginator
                        page={tags.getIn(['_internal', 'pagination', 'page'], 1)}
                        totalPages={tags.getIn(['_internal', 'pagination', 'nb_pages'])}
                        onChange={(page) => this.props.setPage(page)}
                        radius={1}
                        anchor={2}
                    />
                </div>
            </div>
        )
    }
}

ManageTags.propTypes = {
    tags: PropTypes.object.isRequired,
    fetch: PropTypes.func.isRequired,
    edit: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    select: PropTypes.func.isRequired,
    selectAll: PropTypes.func.isRequired,
    setPage: PropTypes.func.isRequired,
}

export default ManageTags
