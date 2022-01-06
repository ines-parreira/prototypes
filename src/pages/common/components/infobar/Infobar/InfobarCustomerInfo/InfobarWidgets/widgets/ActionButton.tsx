import React, {
    Component,
    ComponentType,
    ReactNode,
    ComponentProps,
    FormEvent,
} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import _isUndefined from 'lodash/isUndefined'
import _omit from 'lodash/omit'
import _uniqueId from 'lodash/uniqueId'
import _noop from 'lodash/noop'
import {
    Button,
    Form,
    Label,
    Popover,
    PopoverBody,
    PopoverHeader,
} from 'reactstrap'

import SelectField from '../../../../../../forms/SelectField/SelectField'
import BooleanField from '../../../../../../forms/BooleanField.js'
import InputField from '../../../../../../forms/InputField.js'

import {executeAction} from '../../../../../../../../state/infobar/actions'
import {getPendingActionCallbacks} from '../../../../../../../../state/infobar/selectors'
import {actionButtonHashForData} from '../../../../../../../../state/infobar/utils'
import {RootState} from '../../../../../../../../state/types'
import Tooltip from '../../../../../Tooltip'
import {CustomerContext, CustomerContextType} from '../../InfobarCustomerInfo'

import {IntegrationContext, IntegrationContextType} from './IntegrationContext'

import css from './ActionButton.less'
import {InfobarModalProps, Option, Parameter} from './types'

type ActionButtonContextType = {
    actionError: string | null
}
export const ActionButtonContext = React.createContext<ActionButtonContextType>(
    {
        actionError: null,
    }
)

type Props = {
    options: Array<Option>
    payload: {
        order_id?: string
        customer_id?: string
    }
    children: ReactNode
    tag: ComponentType<ComponentProps<typeof Button>>
    modal?: ComponentType<InfobarModalProps>
    modalData?: Record<string, unknown>
    tagOptions?: Record<string, unknown>
    popover?: string
    title: ReactNode
    actionError: ActionButtonContextType['actionError']
    customerId: CustomerContextType['customerId']
    integrationId: IntegrationContextType['integrationId']
    setModalOpen?: (param: boolean) => void
} & ConnectedProps<typeof connector>

type State = {
    isUiOpen: boolean
    isLoading: boolean
    actionName: string
    parameters: Record<string, unknown>
    actionId: string | null
}

export class ActionButtonContainer extends Component<Props, State> {
    id = ''
    state = {
        isUiOpen: false,
        isLoading: false,
        actionName: '',
        parameters: {},
        actionId: 'initialActionId',
    }

    static defaultProps: Pick<Props, 'tag'> = {
        tag: Button,
    }

    constructor(props: Props) {
        super(props)
        this.id = _uniqueId('action-button-')
    }

    componentDidMount() {
        const {options} = this.props

        const actionId = this.generateActionId(this.props, {
            actionName: this.props.options[0].value,
        } as any)
        this.setState({actionId})

        const defaultParameters: Record<string, unknown> = {}
        const parameters = options[0].parameters

        // Here we initialize the component's state with the default values of the action parameters.
        // This state will then be updated whenever input values are changed, and then sent to the server when
        // the user will confirm he wants to execute the action.
        if (parameters) {
            parameters.forEach((parameter) => {
                defaultParameters[parameter.name] = _isUndefined(
                    parameter.defaultValue
                )
                    ? null
                    : parameter.defaultValue
            })
        }

        this.setState({
            actionName: options[0].value,
            parameters: defaultParameters,
        })
    }

    /**
     * Everytime the action parameters are updated, update the actionId.
     */
    componentWillReceiveProps(nextProps: Props) {
        const actionId = this.generateActionId(nextProps, this.state)
        this.setState({
            isLoading: !!nextProps.getPendingActionCallback(actionId),
            actionId,
        })
    }

    /**
     * Generate a unique actionId to identify this action with its parameters. Useful to retrieve the current state
     * of the action once it has been sent to the server, and to identify in a unique fashion the target of the popover,
     * displayed to customize the action's parameters.
     */
    generateActionId = (props: Props, state: State) => {
        const data = {
            action_name: state.actionName,
            // TODO(customers-migration): update `user_id` when we update our REST API
            user_id: props.customerId?.toString(),
            integration_id: props.integrationId,
            payload: {
                ...props.payload,
                ...state.parameters,
            },
        }

        return actionButtonHashForData(data as any)
    }

    confirmAction = (event: FormEvent | null = null) => {
        if (event) {
            event.preventDefault()
        }
        const payload = {
            ...this.props.payload,
            ...this.state.parameters,
        }

        this.props.executeAction({
            actionName: this.state.actionName,
            integrationId: this.props.integrationId!,
            customerId: this.props.customerId?.toString(),
            payload: payload as any,
        })

        this.toggleUi()
    }

    toggleUi = () => {
        if (this.props.setModalOpen) {
            this.props.setModalOpen(!this.state.isUiOpen)
        }
        this.setState({
            isUiOpen: !this.state.isUiOpen,
        })
    }

    updateActionName = (actionName: string | number) => {
        const currentOption = this.props.options.find(
            (option) => option.value === actionName
        )
        const parameters: Record<string, unknown> = {}

        if (currentOption && currentOption.parameters) {
            currentOption.parameters.forEach((parameter) => {
                parameters[parameter.name] = parameter.defaultValue || null
            })
        }

        this.setState({actionName: actionName.toString(), parameters})
    }

    updateActionParameter = (
        name: string,
        value: string | number | boolean | Record<string, unknown>,
        callback: () => void = _noop
    ) => {
        this.setState(
            {
                parameters: {
                    ...this.state.parameters,
                    [name]: value,
                },
            },
            callback
        )
    }

    updateActionParameters = (
        values: Array<{
            name: string
            value: string | number | boolean | Record<string, unknown>
        }>,
        callback: () => void = _noop
    ) => {
        const {parameters} = this.state

        values.forEach(({name, value}) => {
            ;(parameters as Record<string, unknown>)[name] = value
        })

        this.setState({parameters}, callback)
    }

    renderActionParameters = () => {
        const {options} = this.props
        const {actionName, parameters: actionParameters} = this.state

        let currentOption = options.find(
            (option) => option.value === actionName
        )

        if (!currentOption) {
            currentOption = options[0]
        }

        if (!currentOption || !currentOption.parameters) {
            return null
        }

        return currentOption.parameters.map((parameter: Parameter) => {
            let InputTag: ComponentType<any> = InputField

            if (parameter.type === 'checkbox') {
                InputTag = BooleanField
            } else if (parameter.type === 'select') {
                InputTag = SelectField
            }

            // we don't need the defaultValue as it's set in the state as current value of the parameter
            const inputAttributes: Record<string, unknown> = _omit(parameter, [
                'defaultValue',
            ])

            return (
                <InputTag
                    key={parameter.name}
                    className="mb-2"
                    value={
                        (actionParameters as Record<string, unknown>)[
                            parameter.name
                        ]
                    }
                    {...inputAttributes}
                    onChange={(value: string | number | boolean) => {
                        this.updateActionParameter(parameter.name, value)
                    }}
                />
            )
        })
    }

    renderModal(Modal: ComponentType<InfobarModalProps>) {
        const {title, modalData} = this.props
        const {isUiOpen} = this.state
        return (
            <Modal
                header={title}
                isOpen={isUiOpen}
                onChange={this.updateActionParameter}
                onBulkChange={this.updateActionParameters}
                onSubmit={this.confirmAction}
                onClose={this.toggleUi}
                data={modalData}
            />
        )
    }

    renderPopover() {
        const {options, popover, title} = this.props
        const {actionName, isUiOpen} = this.state
        const multipleOptions = options.length > 1

        return (
            <Popover
                placement="bottom"
                isOpen={isUiOpen}
                target={this.id}
                toggle={this.toggleUi}
                tether={{
                    // Necessary to avoid the popover being displayed outside of the window.
                    // http://tether.io/#constraints
                    constraints: [
                        {
                            to: 'scrollParent',
                            attachment: 'together none',
                            pin: true,
                        },
                        {to: 'window', attachment: 'together none', pin: true},
                    ],
                }}
                trigger="legacy"
            >
                <PopoverHeader>{title}</PopoverHeader>
                <PopoverBody>
                    {popover ? <p className={css.popover}>{popover}</p> : null}
                    <Form onSubmit={this.confirmAction}>
                        {multipleOptions
                            ? [
                                  <Label key="label">Type</Label>,
                                  <SelectField
                                      key="input"
                                      style={{marginBottom: '1rem'}}
                                      onChange={this.updateActionName}
                                      value={actionName}
                                      options={options.map(
                                          (option: Option) => ({
                                              value: option.value,
                                              label: option.label,
                                          })
                                      )}
                                  />,
                              ]
                            : null}
                        {this.renderActionParameters()}
                        <Button color="success" block>
                            Confirm
                        </Button>
                    </Form>
                </PopoverBody>
            </Popover>
        )
    }

    render() {
        const {children, tag: Tag, tagOptions, modal, actionError} = this.props
        const {isLoading} = this.state
        const hasError = !!actionError
        const tooltipTargetID = `${this.id}-tooltip-target`
        return (
            <>
                <Tag
                    id={this.id}
                    color="secondary"
                    size="sm"
                    className={classnames(css.button, 'action-button')}
                    disabled={isLoading || hasError}
                    onClick={this.toggleUi}
                    {...tagOptions}
                >
                    <span
                        id={tooltipTargetID}
                        style={{
                            position: 'absolute',
                            height: '100%',
                            width: '100%',
                            top: '0',
                            left: '0',
                        }}
                    />
                    {children}
                </Tag>
                {modal ? this.renderModal(modal) : this.renderPopover()}
                {hasError && (
                    <Tooltip placement="top" target={tooltipTargetID}>
                        {actionError}
                    </Tooltip>
                )}
            </>
        )
    }
}

export const withActionButtonContext = (Component: any) => {
    return (props: any) => {
        const {actionError} = React.useContext(ActionButtonContext)
        const {customerId} = React.useContext(CustomerContext)
        const {integrationId} = React.useContext(IntegrationContext)

        return (
            <Component
                actionError={actionError}
                customerId={customerId}
                integrationId={integrationId}
                {...props}
            />
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        getPendingActionCallback: getPendingActionCallbacks(state),
    }),
    {
        executeAction,
    }
)

export default connector(withActionButtonContext(ActionButtonContainer))
