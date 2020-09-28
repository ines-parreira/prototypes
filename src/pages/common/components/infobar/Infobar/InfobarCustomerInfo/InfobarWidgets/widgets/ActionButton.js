// @flow

import React, {type ComponentType, type Node} from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import classnames from 'classnames'
import type {Map} from 'immutable'
import _debounce from 'lodash/debounce'
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

import SelectField from '../../../../../../forms/SelectField'
import BooleanField from '../../../../../../forms/BooleanField'
import InputField from '../../../../../../forms/InputField'

import {getActionByName} from '../../../../../../../../config/actions.ts'
import * as segmentTracker from '../../../../../../../../store/middlewares/segmentTracker'
import * as infobarActions from '../../../../../../../../state/infobar/actions.ts'
import * as infobarSelectors from '../../../../../../../../state/infobar/selectors.ts'
import * as infobarUtils from '../../../../../../../../state/infobar/utils.ts'

import css from './ActionButton.less'
import type {InfobarModalProps, OptionType, ParameterType} from './types'

type Props = {
    options: Array<OptionType>,
    payload: {
        order_id?: string,
        customer_id?: string,
    },
    children: Node,
    tag: Object,
    modal?: ComponentType<InfobarModalProps>,
    modalData?: Object,
    tagOptions?: Object,
    popover?: string,
    title: Node,

    getPendingActionCallback: (string) => Map<*, *>,
    executeAction: (
        string,
        number,
        number,
        Object,
        callback?: () => void
    ) => void,
}

type State = {
    isUiOpen: boolean,
    isLoading: boolean,
    actionName: string,
    parameters: Object,
    actionId: ?string,
}

@connect(
    (state) => ({
        getPendingActionCallback: infobarSelectors.makeGetPendingActionCallbacks(
            state
        ),
    }),
    {
        executeAction: infobarActions.executeAction,
    }
)
// todo(@martin): remove this flow-fix-me when flow support decorators and props injection
// $FlowFixMe
export default class ActionButton extends React.Component<Props, State> {
    id: string = ''
    state = {
        isUiOpen: false,
        isLoading: false,
        actionName: '',
        parameters: {},
        actionId: 'initialActionId',
    }

    static defaultProps = {
        tag: Button,
    }

    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
        integrationId: PropTypes.number.isRequired,
        customerId: PropTypes.number.isRequired,
    }

    constructor(props: Props) {
        super(props)
        this.id = _uniqueId('action-button-')
    }

    componentDidMount() {
        const {options} = this.props

        const actionId = this._generateActionId(this.props, this.context, {
            actionName: this.props.options[0].value,
        })
        this.setState({actionId})

        const defaultParameters = {}
        const parameters: ?Array<*> = options[0].parameters

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
        const actionId = this._generateActionId(
            nextProps,
            this.context,
            this.state
        )
        this.setState({
            isLoading: !!nextProps.getPendingActionCallback(actionId),
            actionId,
        })
    }

    /**
     * Generate a unique actionId to identify this action with its parameters. Useful to retrieve the current state
     * of the action once it has been sent to the server, and to identify in a unique fashion the target of the popover,
     * displayed to customize the action's parameters.
     *
     * @param props: the properties object of the component
     * @param context: the context object of the component
     * @param state: the state object of the component
     * @returns {string}: the unique id
     * @private
     */
    _generateActionId = (
        props: Props,
        context: Object,
        state: State | Object
    ) => {
        const data = {
            action_name: state.actionName,
            // TODO(customers-migration): update `user_id` when we update our REST API
            user_id: context.customerId,
            integration_id: context.integrationId,
            payload: {
                ...props.payload,
                ...state.parameters,
            },
        }

        return infobarUtils.actionButtonHashForData(data)
    }

    _confirmAction = (event: ?Event = null) => {
        if (event) {
            event.preventDefault()
        }

        const actionConfig: ?Object = getActionByName(this.state.actionName)

        if (actionConfig) {
            segmentTracker.logEvent(
                segmentTracker.EVENTS.INFOBAR_ACTION_CLICKED,
                {
                    type: this.context.integration.get('type'),
                    name: actionConfig.label,
                }
            )
        }

        const payload = {
            ...this.props.payload,
            ...this.state.parameters,
        }

        this.props.executeAction(
            this.state.actionName,
            this.context.integrationId,
            this.context.customerId,
            payload
        )

        this._toggleUi()
    }

    // If we don't debounce, when clicking on the button to close the Popover, toggle is called two times (once
    // by the button's `onClick`, and once by the Popover's `onClickOutside`), resulting in the Popover not closing.
    // There's probably an eventPropagation thing we can tweak to fix this, but so far we couldn't find out how.
    _toggleUi = _debounce(
        () => {
            this.setState({
                isUiOpen: !this.state.isUiOpen,
            })
        },
        100,
        {leading: true, trailing: false}
    )

    _updateActionName = (actionName: string | number) => {
        const currentOption = this.props.options.find(
            (option) => option.value === actionName
        )
        const parameters = {}

        if (currentOption && currentOption.parameters) {
            currentOption.parameters.forEach((parameter) => {
                parameters[parameter.name] = parameter.defaultValue || null
            })
        }

        this.setState({actionName: actionName.toString(), parameters})
    }

    _updateActionParameter = (
        name: string,
        value: string | number | boolean | Object,
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

    _updateActionParameters = (
        values: Array<{
            name: string,
            value: string | number | boolean | Object,
        }>,
        callback: () => void = _noop
    ) => {
        const {parameters} = this.state

        values.forEach(({name, value}) => {
            parameters[name] = value
        })

        this.setState({parameters}, callback)
    }

    _renderActionParameters = (): Array<Object> | null => {
        const {options} = this.props
        const {actionName, parameters: actionParameters} = this.state

        let currentOption: ?OptionType = options.find(
            (option) => option.value === actionName
        )

        if (!currentOption) {
            currentOption = options[0]
        }

        if (!currentOption || !currentOption.parameters) {
            return null
        }

        return currentOption.parameters.map((parameter: ParameterType) => {
            let InputTag: Object = InputField

            if (parameter.type === 'checkbox') {
                InputTag = BooleanField
            } else if (parameter.type === 'select') {
                InputTag = SelectField
            }

            // we don't need the defaultValue as it's set in the state as current value of the parameter
            const inputAttributes: Object = _omit(parameter, ['defaultValue'])

            return (
                <InputTag
                    key={parameter.name}
                    className="mb-2"
                    value={actionParameters[parameter.name]}
                    {...inputAttributes}
                    onChange={(value: string | number | boolean) => {
                        this._updateActionParameter(parameter.name, value)
                    }}
                />
            )
        })
    }

    _renderModal(Modal: ComponentType<InfobarModalProps>) {
        const {title, modalData} = this.props
        const {isUiOpen} = this.state

        return (
            <Modal
                header={title}
                isOpen={isUiOpen}
                onOpen={this._updateActionName}
                onChange={this._updateActionParameter}
                onBulkChange={this._updateActionParameters}
                onSubmit={this._confirmAction}
                onClose={this._toggleUi}
                data={modalData}
            />
        )
    }

    _renderPopover() {
        const {options, popover, title} = this.props
        const {actionName, isUiOpen} = this.state
        const multipleOptions = options.length > 1

        return (
            <Popover
                placement="bottom"
                isOpen={isUiOpen}
                target={this.id}
                toggle={this._toggleUi}
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
            >
                <PopoverHeader>{title}</PopoverHeader>
                <PopoverBody>
                    {popover ? <p className={css.popover}>{popover}</p> : null}
                    <Form onSubmit={this._confirmAction}>
                        {multipleOptions
                            ? [
                                  <Label key="label">Type</Label>,
                                  <SelectField
                                      key="input"
                                      style={{marginBottom: '1rem'}}
                                      onChange={this._updateActionName}
                                      value={actionName}
                                      options={options.map(
                                          (option: OptionType) => ({
                                              value: option.value,
                                              label: option.label,
                                          })
                                      )}
                                  />,
                              ]
                            : null}
                        {this._renderActionParameters()}
                        <Button color="success" block>
                            Confirm
                        </Button>
                    </Form>
                </PopoverBody>
            </Popover>
        )
    }

    render() {
        const {children, tag: Tag, tagOptions, modal} = this.props
        const {isLoading} = this.state

        return (
            <>
                <Tag
                    id={this.id}
                    color="secondary"
                    size="sm"
                    className={classnames(css.button, 'action-button')}
                    disabled={isLoading}
                    onClick={this._toggleUi}
                    {...tagOptions}
                >
                    {children}
                    {modal ? this._renderModal(modal) : this._renderPopover()}
                </Tag>
            </>
        )
    }
}
