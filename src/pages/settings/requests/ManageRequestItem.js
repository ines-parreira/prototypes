//@flow
import React from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import _pick from 'lodash/pick'
import {browserHistory, Link} from 'react-router'
import {
    Breadcrumb, BreadcrumbItem, Button, Container,
    Form, FormGroup,
    Popover, PopoverBody, PopoverHeader
} from 'reactstrap'

import {createRequest, deleteRequest, updateRequest} from '../../../state/requests/actions'
import {getRequests} from '../../../state/requests/selectors'
import InputField from '../../common/forms/InputField'
import PageHeader from '../../common/components/PageHeader'

type Props = {
    requests: Array<*>,
    requestId: number,
    isUpdate: boolean,
    params: Object,
    createRequest: typeof createRequest,
    updateRequest: typeof updateRequest,
    deleteRequest: typeof deleteRequest,
}

type State = {
    name: string,
    samples: string,

    errors: Object,
    isSubmitting: boolean,
    isDeleting: boolean,
    askDeleteConfirmation: boolean,
}

export class ManageRequestItem extends React.Component<Props, State> {
    state = {
        name: '',
        samples: '',
        errors: {},
        isSubmitting: false,
        isDeleting: false,
        askDeleteConfirmation: false,
    }

    constructor(props: Props) {
        super()

        const {requests, requestId} = props
        const request = requests.find((r) => r.get('id') === requestId)

        if (request) {
            this.state = {
                name: request.get('name'),
                samples: request.get('samples'),
                errors: {},
                isSubmitting: false,
                isDeleting: false,
                askDeleteConfirmation: false,
            }
        }
    }

    _toggleDeleteConfirmation = () => {
        this.setState({
            askDeleteConfirmation: !this.state.askDeleteConfirmation,
        })
    }

    _deleteRequest = () => {
        const {requestId} = this.props
        if (requestId === null) {
            return
        }

        this.setState({isDeleting: true})
        this.props.deleteRequest(this.props.requestId)
            .then(({error}) => {
                this.setState({isDeleting: false})
                if (!error) {
                    browserHistory.push('/app/settings/requests')
                }
            })
    }

    _onSubmit = (e: Event) => {
        e.preventDefault()

        const {isUpdate, requestId, updateRequest, createRequest} = this.props
        const form = _pick(this.state, ['name', 'samples'])

        this.setState({isSubmitting: true})
        const promise = isUpdate ? updateRequest(requestId, form) : createRequest(form)

        return promise
            .then(({error}) => {
                this.setState({isSubmitting: false})
                if (error) {
                    if (error.data) {
                        this.setState({errors: error.data})
                    }
                } else {
                    this.setState({errors: {}})
                    if (!isUpdate) {
                        browserHistory.push('/app/settings/requests')
                    }
                }
            })
    }

    render() {
        const {requests, requestId, isUpdate} = this.props
        const request = requests.find((r) => r.get('id') === requestId)
        const name = request ? request.get('name') : ''
        const samples = request ? request.get('samples', '').split('\n') : []

        return (
            <div className="full-width">
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/requests">Manage Requests</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {isUpdate ? `Edit ${name}` : 'Create Request'}
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <Container fluid className="page-container">
                    <Form onSubmit={this._onSubmit}>
                        <InputField
                            type="text"
                            name="name"
                            label="Name"
                            value={this.state.name}
                            onChange={(value) => this.setState({name: value})}
                            placeholder="Refund policy"
                            help="The request name will appear on the ticket (similar to tags). Try to keep it short and simple."
                            required
                        />
                        <InputField
                            type="textarea"
                            rows={samples.length + 2}
                            name="samples"
                            label="Sample statements"
                            help="One example sentence per line. For best results: keep them short (5-10 words), as many and as variate as possible. Note that we ignore: order of words, case of the text, common words (Ex: the, and, etc..) and punctuation."
                            value={this.state.samples}
                            onChange={(value) => this.setState({samples: value})}
                            required
                        />
                        <FormGroup>
                            <Button
                                type="submit"
                                color="primary"
                                className={classnames('mr-2', {
                                    'btn-loading': this.state.isSubmitting,
                                })}
                                disabled={this.state.isSubmitting}
                            >
                                {isUpdate ? 'Update Request' : 'Create Request'}
                            </Button>
                            {
                                isUpdate && (
                                    <span>
                                        <Button
                                            id="deleteRequest-agent-button"
                                            type="button"
                                            color="danger"
                                            outline
                                            onClick={this._toggleDeleteConfirmation}
                                            className={classnames('pull-right', {
                                                'btn-loading': this.state.isDeleting,
                                            })}
                                            disabled={this.state.isDeleting}
                                        >
                                            Delete Request
                                        </Button>
                                        <Popover
                                            placement="left"
                                            isOpen={this.state.askDeleteConfirmation}
                                            target="deleteRequest-agent-button"
                                            toggle={this._toggleDeleteConfirmation}
                                        >
                                            <PopoverHeader>Are you sure?</PopoverHeader>
                                            <PopoverBody>
                                                <p>
                                                    You are about to <b>deleteRequest</b> this request. This action is{' '}
                                                    <b>irreversible</b>. You will lose all the training data that this request collected.
                                                </p>
                                                <Button
                                                    type="submit"
                                                    color="danger"
                                                    onClick={() => {
                                                        this._toggleDeleteConfirmation()
                                                        this._deleteRequest()
                                                    }}
                                                >
                                                    Confirm
                                                </Button>
                                            </PopoverBody>
                                        </Popover>
                                    </span>
                                )
                            }
                        </FormGroup>
                    </Form>
                </Container>
            </div>
        )
    }
}

export default connect((state, ownProps: Props) => ({
    requests: getRequests(state),
    requestId: parseInt(ownProps.params.id),
    isUpdate: !!ownProps.params.id,
}), ({
    createRequest,
    updateRequest,
    deleteRequest,
}))(ManageRequestItem)
