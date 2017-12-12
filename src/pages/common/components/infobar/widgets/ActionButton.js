// @flow
import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import classnames from 'classnames'
import type {Map} from 'immutable'
import _omit from 'lodash/omit'
import _debounce from 'lodash/debounce'
import _isUndefined from 'lodash/isUndefined'

import {
    Button,
    Form,
    Popover,
    PopoverTitle,
    PopoverContent, Label,
} from 'reactstrap'

import type {OptionType, ParameterType} from './types'

import InputField from './../../../forms/InputField'
import SelectField from '../../../forms/SelectField'
import BooleanField from '../../../forms/BooleanField'

import {getActionByName} from '../../../../../config/actions'
import * as segmentTracker from '../../../../../store/middlewares/segmentTracker'

import * as infobarActions from '../../../../../state/infobar/actions'
import * as infobarSelectors from '../../../../../state/infobar/selectors'
import * as infobarUtils from '../../../../../state/infobar/utils'

import css from './ActionButton.less'


type Props = {
    options: Array<OptionType>,
    payload: {
        order_id?: string,
        customer_id?: string,
    },
    children: Object,
    tag: Object,
    tagOptions?: Object,
    tooltip?: string,
    title: Object,

    getPendingActionCallback: (string) => Map<*,*>,
    executeAction: (string, number, number, Object, callback: (Object) => void) => void,
}

type State = {
    popoverOpen: boolean,
    isLoading: boolean,
    actionName: string,
    parameters: Object,
    showSuccess: boolean,
    showError: boolean,
    actionId: ?string,
}

@connect((state) => {
    return {
        getPendingActionCallback: infobarSelectors.makeGetPendingActionCallbacks(state),
    }
}, {
    executeAction: infobarActions.executeAction,
})
// todo(@martin): remove this flow-fix-me when flow support decorators and props injection
// $FlowFixMe
export default class ActionButton extends React.Component<Props, State> {
    id: string = ''
    state = {
        popoverOpen: false,
        isLoading: false,
        actionName: '',
        parameters: {},
        showSuccess: false,
        showError: false,
        actionId: 'initialActionId'
    }

    static defaultProps = {
        tag: Button
    }

    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
        integrationId: PropTypes.number.isRequired,
        userId: PropTypes.number.isRequired,
    }

    componentDidMount() {
        const {options} = this.props

        const actionId = this._generateActionId(this.props, this.context, {actionName: this.props.options[0].value})
        this.setState({actionId})

        const defaultParameters = {}
        const parameters : ?Array<*> = options[0].parameters

        // Here we initialize the component's state with the default values of the action parameters.
        // This state will then be updated whenever input values are changed, and then sent to the server when
        // the user will confirm he wants to execute the action.
        if (parameters) {
            parameters.forEach((parameter) => {
                defaultParameters[parameter.name] = _isUndefined(parameter.defaultValue)
                    ? null
                    : parameter.defaultValue
            })
        }

        this.setState({
            actionName: options[0].value,
            parameters: defaultParameters
        })
    }

    /**
     * Everytime the action parameters are updated, update the actionId.
     */
    componentWillReceiveProps(nextProps: Props) {
        const actionId = this._generateActionId(nextProps, this.context, this.state)
        this.setState({
            isLoading: !!nextProps.getPendingActionCallback(actionId),
            actionId
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
    _generateActionId = (props: Props, context: Object, state: State | Object) => {
        const data = {
            action_name: state.actionName,
            user_id: context.userId,
            integration_id: context.integrationId,
            payload: {
                ...props.payload,
                ...state.parameters
            },
        }

        return infobarUtils.actionButtonHashForData(data)
    }

    _confirmAction = (event: Event) => {
        event.preventDefault()
        const actionConfig: Object = getActionByName(this.state.actionName)

        if (actionConfig) {
            segmentTracker.logEvent(segmentTracker.EVENTS.INFOBAR_ACTION_CLICKED, {
                type: this.context.integration.get('type'),
                name: actionConfig.label,
            })
        }

        const payload = {
            ...this.props.payload,
            ...this.state.parameters,
        }

        this.props.executeAction(
            this.state.actionName,
            this.context.integrationId,
            this.context.userId,
            payload,
            (response) => {
                if (response.status === 'error') {
                    this.setState({showError: true})
                    setTimeout(() => this.setState({showError: false}), 4000)
                    return
                }

                this.setState({showSuccess: true})
                setTimeout(() => this.setState({showSuccess: false}), 4000)
            })

        this._togglePopover()
    }

    // If we don't debounce, when clicking on the button to close the Popover, toggle is called two times (once
    // by the button's `onClick`, and once by the Popover's `onClickOutside`), resulting in the Popover not closing.
    // There's probably an eventPropagation thing we can tweak to fix this, but so far we couldn't find out how.
    _togglePopover = _debounce(() => {
        this.setState({
            popoverOpen: !this.state.popoverOpen
        })
    }, 100, {leading: true, trailing: false})

    _updateActionName = (actionName: string) => {
        const currentOption = this.props.options.find((option) => option.value === actionName)
        const parameters = {}

        if (currentOption && currentOption.parameters) {
            currentOption.parameters.forEach((parameter) => {
                parameters[parameter.name] = parameter.defaultValue || null
            })
        }

        this.setState({actionName, parameters})
    }

    _updateActionParameter = (name: string, value: string | number | boolean) => {
        const partialState = {}
        partialState[name] = value
        this.setState({
            parameters: {
                ...this.state.parameters,
                ...partialState
            }
        })
    }

    _renderActionParameters = () : Array<Object> | null => {
        const {options} = this.props
        const {actionName, parameters: actionParameters} = this.state

        let currentOption : ?OptionType = options.find((option) => option.value === actionName)

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
            }

            // we don't need the defaultValue as it's set in the state as current value of the parameter
            const inputAttributes : Object = _omit(parameter, ['defaultValue'])

            return (
                <InputTag
                    key={parameter.name}
                    value={actionParameters[parameter.name]}
                    {...inputAttributes}
                    onChange={(value: string | number | boolean) => {
                        this._updateActionParameter(parameter.name, value)
                    }}
                />
            )
        })
    }

    render() {
        const {
            options,
            children,
            tag: Tag,
            tooltip,
            title,
            tagOptions
        } = this.props

        const {actionName, popoverOpen, showSuccess, showError, isLoading, actionId} = this.state

        const multipleOptions = options.length > 1

        let buttonColor = 'secondary'

        if (showSuccess) {
            buttonColor = 'success'
        } else if (showError) {
            buttonColor = 'danger'
        }

        return (
            <Tag
                id={actionId}
                color={buttonColor}
                size="sm"
                className={classnames(css.button, 'action-button', {
                    'loading btn-loading': isLoading
                })}
                disabled={isLoading}
                onClick={this._togglePopover}
                {...tagOptions}
            >
                {children}
                <Popover
                    placement="bottom"
                    isOpen={popoverOpen}
                    target={actionId}
                    toggle={this._togglePopover}
                    tether={{
                        // Necessary to avoid the popover being displayed outside of the window.
                        // http://tether.io/#constraints
                        constraints: [
                            { to: 'scrollParent', attachment: 'together none', pin: true},
                            { to: 'window', attachment: 'together none', pin: true }
                        ]
                    }}
                >
                    <PopoverTitle>{title}</PopoverTitle>
                    <PopoverContent>
                        {
                            tooltip ? (
                                <p className={css.tooltip}>
                                    {tooltip}
                                </p>
                            ) : null
                        }
                        <Form onSubmit={this._confirmAction}>
                            {
                                multipleOptions ? [
                                    <Label key="label">
                                        Type
                                    </Label>,
                                    <SelectField
                                        key="input"
                                        style={{marginBottom: '1rem'}}
                                        onChange={this._updateActionName}
                                        value={actionName}
                                        options={options}
                                    />
                                ] : null
                            }
                            {
                                this._renderActionParameters()
                            }
                            <Button
                                color="success"
                                block
                            >
                                Confirm
                            </Button>
                        </Form>
                    </PopoverContent>
                </Popover>
            </Tag>
        )
    }
}
