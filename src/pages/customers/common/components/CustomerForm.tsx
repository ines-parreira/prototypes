import React, {Component, SyntheticEvent} from 'react'
import {fromJS, Map, List} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import {bindActionCreators} from 'redux'
import _isUndefined from 'lodash/isUndefined'
import _pick from 'lodash/pick'
import _merge from 'lodash/merge'
import _find from 'lodash/find'
import _clone from 'lodash/clone'
import _isError from 'lodash/isError'
import {Form} from 'reactstrap'

import {RootState, StoreDispatch} from 'state/types'
import Button from 'pages/common/components/button/Button'
import InputField from 'pages/common/forms/input/InputField'
import TextArea from 'pages/common/forms/TextArea'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import {submitCustomer} from 'state/customers/actions'

import CustomerChannelFieldArray, {
    CustomerChannelContact,
    CustomerChannelContactType,
} from './CustomerChannelFieldArray'
import css from './CustomerForm.less'

const updatableChannels: CustomerChannelContactType[] = ['email', 'phone']

type Channel = {
    type: CustomerChannelContactType
    address: CustomerChannelContact[]
}

type Content = {
    name?: string
    note?: string
    channels?: Channel[]
} & Partial<
    Record<CustomerChannelContactType, CustomerChannelContact[] | Channel[]>
>

const defaultContent: Content = {
    name: '',
    note: '',
    email: [{address: ''}],
    phone: [{address: ''}],
    channels: [],
}

type OwnProps = {
    customer: Map<any, any>
    closeModal: () => void
    onSuccess?: () => any
}

type Props = OwnProps & ConnectedProps<typeof connector>

type Errors = {
    name?: string
} & Partial<Record<CustomerChannelContactType, {address: string}[]>>

type State = {
    submitting: boolean
    errors: Errors
} & Content

class CustomerForm extends Component<Props> {
    static defaultProps: Pick<Props, 'customer'> = {
        customer: fromJS({}),
    }
    state: State
    constructor(props: Props) {
        super(props)

        this.state = _merge(
            {
                submitting: false,
                errors: {},
            },
            this._getForm()
        )
    }

    _validate = (values: State): Errors => {
        const errors: Errors = {}

        // validate phones
        if (values.phone && values.phone.length) {
            values.phone.forEach((phone, index) => {
                if (
                    phone.address &&
                    !/^\+[\d-\(\) ]+$/.test(phone.address as string)
                ) {
                    errors['phone'] = errors['phone'] || ({} as Errors['phone'])
                    const phoneError = errors['phone'] as {
                        address: string
                    }[]
                    phoneError[index] = {
                        address: 'Please enter an international phone number',
                    }
                }
            })
        }

        return errors
    }

    _updateField = (value: Partial<State>) => {
        const newState: State = Object.assign(_clone(this.state), value)

        this.setState(
            Object.assign(value, {
                errors: this._validate(newState),
            })
        )
    }

    _getForm: () => Content = () => {
        if (this.props.isUpdate) {
            const customer = this.props.customer.toJS()
            return this._docToForm(_pick(customer, Object.keys(defaultContent)))
        }

        return _clone(defaultContent)
    }

    _docToForm = (doc: Content = {}): Content => {
        const channels = doc.channels || []

        // if the customer has a "email" property which is not in its channels, add it as an email channel
        // this should not exist but some customers apparently have email in "email" not in "channels"
        const email = doc.email
        if (email) {
            const hasEmailAsChannel = _find(channels, {address: email})
            if (!hasEmailAsChannel) {
                channels.push({
                    type: 'email',
                    address: email as CustomerChannelContact[],
                })
            }
        }

        // divide channels by their types in separated groups
        // ex: email, phone, etc.
        updatableChannels.forEach((updatableChannel) => {
            doc[updatableChannel] = channels.filter(
                (channel) => channel.type === updatableChannel
            )

            // if a type of channel has no address, add an empty one
            if (!doc[updatableChannel]?.length) {
                doc[updatableChannel] = [
                    {
                        address: '',
                    },
                ]
            }
        })

        return doc
    }

    _formToDoc = (form: Map<any, any> = fromJS({})) => {
        const {customer} = this.props

        let initialChannels: List<any> = customer.get('channels', fromJS([]))
        // put aside channels of currently edited types
        initialChannels = initialChannels.filter(
            (initialChannel: Map<any, any>) => {
                return !updatableChannels.includes(initialChannel.get('type'))
            }
        ) as List<any>

        // add channels of currently edited types from form
        const channels = updatableChannels.reduce(
            (previousChannels: List<any>, type: string) => {
                const formValues: List<any> = form.get(type) || fromJS([])
                // merging previous channels with new ones
                const addedChannels = formValues
                    .map((v: Map<any, any>) => v.set('type', type))
                    .filter(
                        (v) =>
                            (v!.get('address', '') as Record<string, string>[])
                                .length as unknown as boolean
                    )
                return previousChannels
                    .toSet()
                    .union(addedChannels.toSet())
                    .toList()
            },
            initialChannels
        )

        // remove channels of currently edited types
        let doc = form
        updatableChannels.forEach((channel) => {
            doc = doc.remove(channel)
        })

        // set form channels
        doc = doc.set('channels', channels)

        return doc
    }

    _handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault()
        let doc: Map<any, any> = fromJS(
            _pick(this.state, Object.keys(defaultContent))
        )

        let promise: Promise<Maybe<{error: unknown}>>
        // if update, set ids for server
        if (this.props.isUpdate) {
            const {customer} = this.props
            doc = doc.set('id', customer.get('id'))
            promise = this.props.onSubmit(
                this._formToDoc(doc).toJS(),
                customer.get('id')
            ) as any as Promise<Maybe<{error: unknown}>>
        } else {
            promise = this.props.onSubmit(
                this._formToDoc(doc).toJS()
            ) as any as Promise<Maybe<{error: unknown}>>
        }

        this.setState({
            submitting: true,
        })

        return promise.then((response = {error: {}}) => {
            this.setState({
                submitting: false,
            })

            if ((response && response.error) || _isError(response)) {
                return
            }

            if (this.props.onSuccess) {
                this.props.onSuccess()
            }

            this.props.closeModal()
        })
    }

    render() {
        const {isUpdate} = this.props
        const invalid = Object.keys(this.state.errors).length > 0

        return (
            <Form onSubmit={this._handleSubmit}>
                <ModalBody>
                    <div className="mb-2">
                        <InputField
                            className={css.field}
                            id="name"
                            label="Name"
                            placeholder="John Doe"
                            caption="Give a name to the customer to make it easier to identify"
                            isRequired
                            value={this.state.name}
                            onChange={(name) => this._updateField({name})}
                            error={this.state.errors.name as string}
                        />
                        <TextArea
                            className={css.field}
                            id="note"
                            label="Note"
                            placeholder="This customer is nice."
                            rows={3}
                            value={this.state.note}
                            onChange={(note) => this._updateField({note})}
                        />
                        <p>
                            <b>
                                Please set below at least one contact
                                information for this customer :
                            </b>
                        </p>
                        <CustomerChannelFieldArray
                            type="email"
                            label="Emails"
                            placeholder="john@snow.com"
                            addLabel="Add an email address"
                            meta={{}}
                            fields={
                                this.state.email as CustomerChannelContact[]
                            }
                            onChange={(email) => this._updateField({email})}
                        />
                        <CustomerChannelFieldArray
                            label="Phone numbers"
                            placeholder="+1 111 111 1111"
                            addLabel="Add a phone number"
                            meta={{}}
                            fields={
                                this.state.phone as CustomerChannelContact[]
                            }
                            onChange={(phone) => this._updateField({phone})}
                            errors={
                                this.state.errors.phone as {address: string}[]
                            }
                        />
                    </div>
                </ModalBody>
                <ModalActionsFooter>
                    <Button
                        type="submit"
                        isDisabled={this.state.submitting || invalid}
                        isLoading={this.state.submitting}
                    >
                        {isUpdate ? 'Update customer' : 'Add customer'}
                    </Button>
                </ModalActionsFooter>
            </Form>
        )
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
    const customer = ownProps.customer || fromJS({})
    return {
        isUpdate: !_isUndefined(customer.get('id')),
    }
}

const mapDispatchToProps = (dispatch: StoreDispatch) => {
    return {
        onSubmit: bindActionCreators(submitCustomer, dispatch),
    }
}

const connector = connect(mapStateToProps, mapDispatchToProps)

export default connector(CustomerForm)
