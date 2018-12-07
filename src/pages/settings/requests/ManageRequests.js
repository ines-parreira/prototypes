//@flow
import React from 'react'
import {connect} from 'react-redux'
import {
    Button,
    Container,
    Popover,
    PopoverHeader,
    PopoverBody, Alert,
} from 'reactstrap'
import {Link} from 'react-router'

import Loader from '../../common/components/Loader'
import {fetchRequests, deleteRequest, bulkDeleteRequest} from '../../../state/requests/actions'
import {getRequests} from '../../../state/requests/selectors'
import PageHeader from '../../common/components/PageHeader'

type Props = {
    requests: Object,
    fetchRequests: typeof fetchRequests,
    deleteRequest: typeof deleteRequest,
    bulkDeleteRequest: typeof bulkDeleteRequest,
}

type State = {
    selectedAll: boolean,
    selectedItems: Array<number>,
    isFetching: boolean,
    askDeleteConfirmation: Object,
    askDeleteConfirmationBulk: boolean,
}

export class ManageRequests extends React.Component<Props, State> {
    state = {
        selectedAll: false,
        selectedItems: [],
        isFetching: false,
        askDeleteConfirmation: {},
        askDeleteConfirmationBulk: false,
    }

    componentWillMount() {
        this._fetchRequests()
    }

    _fetchRequests = () => {
        this.setState({isFetching: true})
        this.props.fetchRequests()
            .then(() => {
                this.setState({isFetching: false})
            })
    }

    _toggleSelectAll = () => {
        const {requests} = this.props
        this.setState({
            selectedAll: !this.state.selectedAll,
            selectedItems: this.state.selectedAll ? [] : requests.map((r) => r.get('id')).toJS()
        })
    }

    _toggleSelectItem = (itemId: number) => {
        const {selectedItems} = this.state
        const idx = selectedItems.indexOf(itemId)
        if (idx !== -1) {
            selectedItems.splice(idx, 1)
        } else {
            selectedItems.push(itemId)
        }

        this.setState({selectedItems})
    }

    _onDelete = (requestId: number) => {
        this.setState({askDeleteConfirmation: {}})
        this.props.deleteRequest(requestId).then(this._fetchRequests)
    }

    _bulkDeleteRequest = () => {
        this.setState({askDeleteConfirmation: {}, askDeleteConfirmationBulk: false})
        this.props.bulkDeleteRequest(this.state.selectedItems).then(this._fetchRequests)
    }

    _toggleRemoveConfirmation = (requestId: number) => {
        const {askDeleteConfirmation} = this.state
        askDeleteConfirmation[requestId] = !askDeleteConfirmation[requestId]
        this.setState({askDeleteConfirmation})
    }

    _toggleRemoveConfirmationBulk = () => {
        this.setState({askDeleteConfirmationBulk: !this.state.askDeleteConfirmationBulk})
    }

    render() {
        const {requests} = this.props
        const {isFetching, selectedItems, selectedAll, askDeleteConfirmation, askDeleteConfirmationBulk} = this.state

        if (isFetching) {
            return <Loader/>
        }

        return (
            <div className="full-width">
                <PageHeader title="Manage Requests (experimental)">
                    <Button
                        id="bulk-remove-button"
                        color="secondary"
                        type="button"
                        className="mr-2"
                        disabled={!selectedItems.length}
                        onClick={this._toggleRemoveConfirmationBulk}
                    >
                        Delete Requests
                    </Button>
                    <Popover
                        placement="bottom"
                        isOpen={askDeleteConfirmationBulk}
                        target="bulk-remove-button"
                        toggle={this._toggleRemoveConfirmation}
                    >
                        <PopoverHeader>Are you sure?</PopoverHeader>
                        <PopoverBody>
                            <p>
                                Are you sure you want to delete these requests?{' '}
                                <b>All the training data will be lost.</b>
                            </p>
                            <Button
                                type="submit"
                                color="danger"
                                onClick={this._bulkDeleteRequest}
                            >
                                Confirm
                            </Button>
                        </PopoverBody>
                    </Popover>

                    <Link
                        className="btn btn-primary"
                        id="create-request-button"
                        to="/app/settings/requests/add"
                    >
                        Create request
                    </Link>
                </PageHeader>

                <Container
                    fluid
                    className="page-container"
                >
                    <div className="manage-requests-description">
                        <p>
                            Requests are distinct categories of customer messages that can be used to automatically classify
                            individual customer requests, questions, demands/etc...

                            Requests are most useful in combination with <Link to="/app/settings/rules/">Rules</Link> and
                            can be used to create automatic replies.
                        </p>
                        <Alert color="warning">
                            <strong>Note:</strong> This feature is experimental and should be used with care.
                        </Alert>
                    </div>
                    <table className="view-table">
                        <thead>
                        <tr>
                            <td
                                className="cell-wrapper cell-short clickable"
                                onClick={this._toggleSelectAll}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedAll}
                                />
                            </td>
                            <td colSpan={2}>
                                <div className="cell-wrapper">Requests</div>
                            </td>
                        </tr>
                        </thead>
                        <tbody>
                        {requests.map((r, i) => (
                            <tr key={i}>
                                <td
                                    className="cell-wrapper cell-short clickable"
                                    onClick={() => this._toggleSelectItem(r.get('id'))}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(r.get('id'))}
                                    />
                                </td>
                                <td>
                                    <div className="cell-wrapper">
                                        {r.get('name')}
                                    </div>
                                </td>
                                <td className="smallest">
                                    <div className="cell-wrapper">
                                        <Link
                                            to={`/app/settings/requests/update/${r.get('id')}`}
                                            className="p-0 mr-3 btn-link"
                                        >
                                            <i className="material-icons mr-1">
                                                edit
                                            </i>
                                            Edit
                                        </Link>

                                        <Button
                                            id={`remove-button-${r.get('id')}`}
                                            type="button"
                                            color="link"
                                            onClick={() => this._toggleRemoveConfirmation(r.get('id'))}
                                            className="p-0"
                                        >
                                            <i className="material-icons mr-1">
                                                clear
                                            </i>
                                            Delete
                                        </Button>
                                        <Popover
                                            placement="left"
                                            isOpen={askDeleteConfirmation[r.get('id')]}
                                            target={`remove-button-${r.get('id')}`}
                                            toggle={() => this._toggleRemoveConfirmation(r.get('id'))}
                                        >
                                            <PopoverHeader>Are you sure?</PopoverHeader>
                                            <PopoverBody>
                                                <p>
                                                    Are you sure you want to delete this request?{' '}
                                                    <b>All it's training data will be lost.</b>.
                                                </p>
                                                <Button
                                                    type="submit"
                                                    color="danger"
                                                    onClick={() => this._onDelete(r.get('id'))}
                                                >
                                                    Confirm
                                                </Button>
                                            </PopoverBody>
                                        </Popover>
                                    </div>
                                </td>
                            </tr>
                        )).toList()}
                        </tbody>
                    </table>
                </Container>
            </div>
        )
    }
}

export default connect((state) => ({
    requests: getRequests(state),
}), ({
    fetchRequests: fetchRequests,
    deleteRequest: deleteRequest,
    bulkDeleteRequest: bulkDeleteRequest,
}))(ManageRequests)
