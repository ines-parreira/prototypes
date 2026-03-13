import { Component } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import type { List, Map, Set } from 'immutable'
import { fromJS } from 'immutable'
import _clone from 'lodash/clone'
import _omit from 'lodash/omit'
import _pick from 'lodash/pick'
import { Form } from 'reactstrap'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { TicketMessageSourceType } from 'business/types/ticket'
import type { Customer } from 'models/customer/types'
import type {
    CustomerChannel,
    MultiSelectBinaryChoiceFieldOption,
} from 'models/customerChannel/types'
import type { SourceType } from 'models/ticket/types'
import BinaryChoiceField from 'pages/common/components/BinaryChoiceField'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import {
    isCustomerDataPresent,
    isCustomerDataValid,
} from 'pages/common/components/infobar/utils'
import { JSONTree } from 'pages/common/components/JSONTree'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import MultiSelectBinaryChoiceField from 'pages/common/components/MultiSelectBinaryChoiceField'
import SourceIcon from 'pages/common/components/SourceIcon'

const defaultContent = {
    name: '',
    email: '',
    note: '',
    data: {},
    channels: [],
}

type Props = {
    destinationCustomer: Map<any, any>
    sourceCustomer: Map<any, any>
    mergeCustomers: (
        destinationCustomerId: number,
        sourceCustomerId: number,
        customerData: Customer,
    ) => Promise<unknown>
    toggleModal: (isShown: boolean) => void
    onSuccess?: () => void
    isOpen: boolean
    isLoading: boolean
    requiredAddresses: Set<string>
}

type State = {
    name: string
    email: string
    note: string
    data: Record<string, unknown>
    channels: CustomerChannel[]
}

export default class MergeCustomersModal extends Component<Props, State> {
    state = _clone(defaultContent)

    componentDidMount = () => {
        const { sourceCustomer } = this.props
        const initData = this.props.destinationCustomer
            .map((v, k) => {
                if (!v) {
                    return sourceCustomer.get(k as string) as unknown
                }

                return v as unknown
            })
            .toJS() as Customer

        initData.channels = initData.channels.concat(
            (sourceCustomer.get('channels') as List<any>).toJS(),
        )

        this.setState(_pick(initData, Object.keys(defaultContent)) as State)
    }

    componentDidUpdate(prevProps: Props) {
        if (!prevProps.isOpen && this.props.isOpen) {
            // TODO(customers-migration): ask confirmation to update this event
            logEvent(SegmentEvent.ModalToggled, {
                open: true,
                name: 'merge users',
            })
        }
    }

    _handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault()

        const data = {
            customer: _pick(this.state, Object.keys(defaultContent)),
        }

        const { error } = (await this.props.mergeCustomers(
            this.props.destinationCustomer.get('id') as number,
            this.props.sourceCustomer.get('id') as number,
            data.customer as any as Customer,
        )) as { error: unknown }

        this._toggle()

        if (!error && this.props.onSuccess) {
            this.props.onSuccess()
        }
    }

    _generateChannelOptions = (customer: Map<any, any>) => {
        const channels = (
            customer.get('channels', fromJS([])) as List<
                Map<any, any> | undefined
            >
        ).filter((channel: unknown) => !!channel) as List<Map<any, any>>
        return channels
            .map((channel, idx) => ({
                label: (
                    <div key={idx}>
                        <SourceIcon
                            className="mr-2"
                            type={
                                (channel as Map<any, any>).get(
                                    'type',
                                ) as SourceType
                            }
                        />
                        {(channel as Map<any, any>).get('address') as string}
                    </div>
                ),
                value: (channel as Map<any, any>).toJS(),
            }))
            .toList()
            .toJS() as Array<MultiSelectBinaryChoiceFieldOption>
    }

    _toggle = () => {
        this.props.toggleModal(false)
    }

    render() {
        const {
            destinationCustomer,
            sourceCustomer,
            isLoading,
            requiredAddresses,
        } = this.props
        const primaryEmail = this.state.email

        let baseCustomerData: Map<any, any> =
            destinationCustomer.get('data') || fromJS({})

        if (isCustomerDataValid(baseCustomerData)) {
            baseCustomerData = baseCustomerData.delete('_shopify')
        }

        baseCustomerData = isCustomerDataPresent(baseCustomerData)
            ? baseCustomerData.toJS()
            : {}
        let mergeCustomerData: Map<any, any> =
            sourceCustomer.get('data') || fromJS({})

        if (isCustomerDataValid(mergeCustomerData)) {
            mergeCustomerData = mergeCustomerData.delete('_shopify')
        }

        mergeCustomerData = isCustomerDataPresent(mergeCustomerData)
            ? mergeCustomerData.toJS()
            : {}

        const allChannels = (
            (
                destinationCustomer.get('channels') as List<any>
            ).toJS() as CustomerChannel[]
        ).concat(
            (
                sourceCustomer.get('channels') as List<any>
            ).toJS() as CustomerChannel[],
        )

        const allRequiredAddresses = requiredAddresses.toJS() as string[]
        allRequiredAddresses.push(primaryEmail)

        const requiredChannelValues = allChannels.filter(
            (channel: CustomerChannel) =>
                allRequiredAddresses.includes(channel.address),
        )

        return (
            <Modal
                isOpen={this.props.isOpen}
                onClose={this._toggle}
                size="large"
            >
                <Form onSubmit={this._handleSubmit}>
                    <ModalHeader title="Merge customers" />
                    <ModalBody>
                        <div className="content">
                            <p className="merge-instructions">
                                {`Select what data you want to keep, then click
                                the "Merge Customers" button. The fields in blue
                                will be kept.`}
                            </p>
                            <BinaryChoiceField
                                label="Name"
                                options={[
                                    {
                                        label: (
                                            <span>
                                                <i className="material-icons mr-2">
                                                    person
                                                </i>
                                                {destinationCustomer.get(
                                                    'name',
                                                )}
                                            </span>
                                        ),
                                        value:
                                            destinationCustomer.get('name') ||
                                            '',
                                    },
                                    {
                                        label: (
                                            <span>
                                                <i className="material-icons mr-2">
                                                    person
                                                </i>
                                                {sourceCustomer.get('name')}
                                            </span>
                                        ),
                                        value: sourceCustomer.get('name') || '',
                                    },
                                ]}
                                value={this.state.name}
                                onChange={(name: string) =>
                                    this.setState({ name })
                                }
                            />
                            <BinaryChoiceField
                                label="Note"
                                options={[
                                    {
                                        label: (
                                            <span>
                                                <i className="material-icons mr-2">
                                                    note
                                                </i>
                                                {destinationCustomer.get(
                                                    'note',
                                                )}
                                            </span>
                                        ),
                                        value:
                                            destinationCustomer.get('note') ||
                                            '',
                                    },
                                    {
                                        label: (
                                            <span>
                                                <i className="material-icons mr-2">
                                                    note
                                                </i>
                                                {sourceCustomer.get('note')}
                                            </span>
                                        ),
                                        value: sourceCustomer.get('note') || '',
                                    },
                                ]}
                                value={this.state.note}
                                onChange={(note: string) =>
                                    this.setState({ note })
                                }
                            />
                            <BinaryChoiceField
                                label="Primary email"
                                tooltip={
                                    <span>
                                        <i
                                            id="merge-primary-email"
                                            className="material-icons ml-2"
                                        >
                                            help
                                        </i>
                                        <Tooltip
                                            placement="top"
                                            target="merge-primary-email"
                                        >
                                            This is the email address which will
                                            be used to fetch data for the
                                            customer
                                        </Tooltip>
                                    </span>
                                }
                                options={[
                                    {
                                        label: (
                                            <span>
                                                <SourceIcon
                                                    className="mr-2"
                                                    type={
                                                        TicketMessageSourceType.Email
                                                    }
                                                />
                                                {destinationCustomer.get(
                                                    'email',
                                                )}
                                            </span>
                                        ),
                                        value:
                                            destinationCustomer.get('email') ||
                                            '',
                                    },
                                    {
                                        label: (
                                            <span>
                                                <SourceIcon
                                                    className="mr-2"
                                                    type={
                                                        TicketMessageSourceType.Email
                                                    }
                                                />
                                                {sourceCustomer.get('email')}
                                            </span>
                                        ),
                                        value:
                                            sourceCustomer.get('email') || '',
                                    },
                                ]}
                                value={this.state.email}
                                onChange={(email: string) =>
                                    this.setState({ email })
                                }
                            />
                            <MultiSelectBinaryChoiceField
                                label="Contact info"
                                tooltip={
                                    <span>
                                        <i
                                            id="merge-contact-info"
                                            className="material-icons ml-2"
                                        >
                                            help
                                        </i>
                                        <Tooltip
                                            placement="top"
                                            target="merge-contact-info"
                                        >
                                            You can not deselect the contact
                                            info associated with the primary
                                            email
                                        </Tooltip>
                                    </span>
                                }
                                requiredValues={requiredChannelValues}
                                options={[
                                    this._generateChannelOptions(
                                        destinationCustomer,
                                    ),
                                    this._generateChannelOptions(
                                        sourceCustomer,
                                    ),
                                ]}
                                propertiesToCompare={['address', 'type']}
                                value={this.state.channels}
                                onChange={(channels: CustomerChannel[]) =>
                                    this.setState({ channels })
                                }
                            />
                            <BinaryChoiceField
                                label="Customer data"
                                options={[
                                    {
                                        label: (
                                            <JSONTree
                                                data={fromJS(baseCustomerData)}
                                            />
                                        ),
                                        value: baseCustomerData,
                                    },
                                    {
                                        label: (
                                            <JSONTree
                                                data={fromJS(mergeCustomerData)}
                                            />
                                        ),
                                        value: mergeCustomerData,
                                    },
                                ]}
                                value={_omit(this.state.data, ['_shopify'])}
                                onChange={(data: Record<string, unknown>) =>
                                    this.setState({ data })
                                }
                            />
                        </div>
                    </ModalBody>
                    <ModalActionsFooter>
                        <Button
                            intent="secondary"
                            className="mr-2"
                            onClick={this._toggle}
                        >
                            Cancel
                        </Button>

                        <ConfirmButton
                            type="submit"
                            isLoading={isLoading}
                            confirmationContent="This action is irreversible. Are you sure you want to merge these customers?"
                        >
                            Merge customers
                        </ConfirmButton>
                    </ModalActionsFooter>
                </Form>
            </Modal>
        )
    }
}
