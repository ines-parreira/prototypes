import _memoize from 'lodash/memoize'
import React, {ReactNode} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map, List} from 'immutable'
import classnames from 'classnames'
import {
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap'

import {generateDefaultAction} from '../../../../../state/macro/utils'

import * as ticketTypes from '../../../../../state/ticket/constants'
import * as newMessageTypes from '../../../../../state/newMessage/constants'
import * as integrationsSelectors from '../../../../../state/integrations/selectors'
import {ACTION_TEMPLATES} from '../../../../../config'
import RichDropdown from '../../../../common/components/RichDropdown/RichDropdown.js'
import {OptionGroup} from '../../../../common/components/RichDropdown/types'
import InputField from '../../../../common/forms/InputField.js'
import {getSortedIntegrationActionsNames} from '../../utils.js'
import {Attachment, ActionTemplate} from '../../../../../types'
import {getActionTemplate, humanizeString} from '../../../../../utils'
import {RootState} from '../../../../../state/types.js'
import {IntegrationType} from '../../../../../models/integration/types'
import {IntentName} from '../../../../../models/intent/types'
import {MacroActionName} from '../../../../../models/macroAction/types'

import SetStatusAction from './actions/SetStatusAction.js'
import SetSubjectAction from './actions/SetSubjectAction.js'
import SetResponseTextAction from './actions/SetResponseTextAction.js'
import SetAssigneeAction from './actions/SetAssigneeAction.js'
import AddTagsAction from './actions/AddTagsAction.js'
import HttpAction from './actions/HttpAction.js'
import AddAttachmentsAction from './actions/AddAttachmentsAction.js'
import IntegrationAction from './actions/IntegrationAction.js'
import SnoozeTicketAction from './actions/SnoozeTicketAction'

import css from './MacroEdit.less'

type Intents = {[key: string]: string}

type OwnProps = {
    actions: List<any>
    agents: List<any>
    currentMacro: Map<any, any>
    intent: Maybe<IntentName>
    intents: Intents
    name: string
    setActions: (actions: List<any>) => void
    setIntent: (intent: Maybe<IntentName>) => void
    setName: (name: string) => void
}

//$TsFixMe waiting on config.js to be migrated
const typeSafeActionTemplates = ACTION_TEMPLATES as ActionTemplate[]

export class MacroEdit extends React.Component<
    OwnProps & ConnectedProps<typeof connector>
> {
    static defaultProps = {
        intents: (window.GORGIAS_CONSTANTS || {}).INTENTS,
    }

    _updateActionArguments = (index: number, args = fromJS({})) => {
        const actions = this.props.actions.setIn([index, 'arguments'], args)
        this.props.setActions(actions)
    }

    _updateActionTitle = (index: number, title: string) => {
        const actions = this.props.actions.setIn([index, 'title'], title)
        this.props.setActions(actions)
    }

    _addAction = (actionName: MacroActionName) => {
        const actions = this.props.actions.push(
            generateDefaultAction(actionName)
        )
        this.props.setActions(actions)
    }

    _deleteAction = (index: number) => {
        const actions = this.props.actions.delete(index)
        this.props.setActions(actions)
    }

    _addAttachment = (index: number, files: Attachment[]) => {
        const actions = this.props.actions.updateIn(
            [index, 'arguments', 'attachments'],
            (attachments: List<any>) =>
                attachments.concat(fromJS(files)) as List<any>
        )
        this.props.setActions(actions)
    }

    _deleteAttachment = (actionIndex: number, fileIndex: number) => {
        const actions = this.props.actions.updateIn(
            [actionIndex, 'arguments', 'attachments'],
            (attachments: List<any>) => attachments.delete(fileIndex)
        )
        this.props.setActions(actions)
    }

    getIntentOptionsFromGlobal = _memoize((intents: Intents): OptionGroup[] =>
        Object.values(
            Object.keys(intents).reduce(
                (acc: {[key: string]: OptionGroup}, intent) => {
                    const [intentCategory, intentName] = intent.split('/')
                    if (acc[intentCategory]) {
                        acc[intentCategory].options.push({
                            description: intents[intent],
                            key: intent,
                            label: humanizeString(intentName),
                        })
                    } else {
                        acc[intentCategory] = {
                            key: intentCategory,
                            label: intentCategory.toUpperCase(),
                            options: [
                                {
                                    description: intents[intent],
                                    key: intent,
                                    label: humanizeString(intentName),
                                },
                            ],
                        }
                    }
                    return acc
                },
                {}
            )
        )
    )

    renderNewActionMenu = () => {
        // front actions executed on client
        const ticketActions = typeSafeActionTemplates
            .filter((template) => template.execution === 'front')
            // remove actions that have already been used
            .filter(
                (action) =>
                    !this.props.actions.find(
                        (usedActions: Map<any, any>) =>
                            usedActions.get('name') === action.name
                    )
            )

        // external actions executed on server
        const externalActions = typeSafeActionTemplates.filter(
            (template) => template.execution === 'back'
        )
        // external actions without externalType, list of names
        const nonIntegrationActions = externalActions.filter(
            (v) => !v.integrationType
        )

        const hasActions = ticketActions.length > 0

        return (
            <DropdownMenu className={css.dropdown}>
                {hasActions && (
                    <DropdownItem header>TICKET ACTIONS</DropdownItem>
                )}
                {hasActions && <DropdownItem divider />}
                {ticketActions.map((action) => {
                    const actionName = action.name
                    return (
                        <DropdownItem
                            key={actionName}
                            type="button"
                            onClick={() => this._addAction(actionName)}
                        >
                            {action.title || humanizeString(actionName)}
                        </DropdownItem>
                    )
                })}
                {hasActions && <DropdownItem divider />}
                <DropdownItem header>EXTERNAL ACTIONS</DropdownItem>
                {nonIntegrationActions.map((action) => {
                    const actionName = action.name
                    return (
                        <DropdownItem
                            key={actionName}
                            type="button"
                            onClick={() => this._addAction(actionName)}
                        >
                            {action.title || humanizeString(actionName)}
                        </DropdownItem>
                    )
                })}
            </DropdownMenu>
        )
    }

    render() {
        const {
            currentMacro,
            hasIntegrationOfTypes,
            intent,
            intents,
            setIntent,
        } = this.props

        if (!currentMacro) {
            return null
        }

        if (currentMacro.isEmpty()) {
            return null
        }

        // external actions executed on server
        const externalActions = typeSafeActionTemplates.filter(
            (template) => template.execution === 'back'
        )
        // external actions with externalType grouped by externalType
        const integrationMenus: Map<
            any,
            any
        > = getSortedIntegrationActionsNames(
            externalActions.filter((v) => !!v.integrationType)
        )

        return (
            <form>
                <div className="mt-3 mb-3">
                    <div>
                        <div className={classnames('mb-2', css.title)}>
                            Macro name
                        </div>
                        <InputField
                            type="text"
                            name="name"
                            onChange={this.props.setName}
                            value={this.props.name}
                            required
                        />
                    </div>

                    <RichDropdown
                        options={this.getIntentOptionsFromGlobal(intents)}
                        onClick={(intent: string) =>
                            setIntent(intent as IntentName)
                        }
                        renderMenuItems={(menuItems: ReactNode) => (
                            <>
                                <DropdownItem
                                    onClick={() => setIntent(null)}
                                    type="button"
                                >
                                    <i className="icon material-icons">clear</i>
                                    {humanizeString('clear intent')}
                                </DropdownItem>
                                {menuItems}
                            </>
                        )}
                        value={
                            (intent &&
                                humanizeString(intent.replace('/', ' - '))) ||
                            'Choose intent'
                        }
                    >
                        <div className={classnames('mb-2', css.title)}>
                            Intent
                        </div>
                        <div className={css.description}>
                            Choose an intent to describe in which cases this
                            macro will be used.
                        </div>
                    </RichDropdown>

                    {this.props.actions.map(
                        (action: Map<any, any>, index: Maybe<number>) => {
                            if (index == null) {
                                return
                            }
                            let config

                            switch (action.get('name')) {
                                case ticketTypes.SET_STATUS:
                                    config = {
                                        title: 'Set status',
                                        content: (
                                            <SetStatusAction
                                                index={index}
                                                action={action}
                                                updateActionArgs={
                                                    this._updateActionArguments
                                                }
                                            />
                                        ),
                                    }
                                    break
                                case ticketTypes.ADD_TICKET_TAGS:
                                    config = {
                                        title: 'Add tags',
                                        content: (
                                            <AddTagsAction
                                                index={index}
                                                args={action.get('arguments')}
                                                updateActionArgs={
                                                    this._updateActionArguments
                                                }
                                            />
                                        ),
                                    }
                                    break
                                case newMessageTypes.SET_RESPONSE_TEXT:
                                    config = {
                                        title: 'Set response text',
                                        content: (
                                            <SetResponseTextAction
                                                index={index}
                                                action={action}
                                                updateActionArgs={
                                                    this._updateActionArguments
                                                }
                                            />
                                        ),
                                    }
                                    break
                                case ticketTypes.SET_AGENT:
                                    config = {
                                        title: 'Set user assignee',
                                        content: (
                                            <SetAssigneeAction
                                                index={index}
                                                action={action}
                                                agents={this.props.agents}
                                                updateActionArgs={
                                                    this._updateActionArguments
                                                }
                                                handleUsers={true}
                                            />
                                        ),
                                    }
                                    break
                                case ticketTypes.SET_TEAM:
                                    config = {
                                        title: 'Set team assignee',
                                        content: (
                                            <SetAssigneeAction
                                                index={index}
                                                action={action}
                                                agents={this.props.agents}
                                                updateActionArgs={
                                                    this._updateActionArguments
                                                }
                                                handleTeams={true}
                                            />
                                        ),
                                    }
                                    break
                                case ticketTypes.SET_SUBJECT:
                                    config = {
                                        title: 'Set ticket subject',
                                        content: (
                                            <SetSubjectAction
                                                index={index}
                                                action={action}
                                                updateActionArgs={
                                                    this._updateActionArguments
                                                }
                                            />
                                        ),
                                    }
                                    break
                                case ticketTypes.SNOOZE_TICKET:
                                    config = {
                                        title: 'Snooze for',
                                        content: (
                                            <SnoozeTicketAction
                                                index={index}
                                                action={action}
                                                updateActionArgs={
                                                    this._updateActionArguments
                                                }
                                            />
                                        ),
                                    }
                                    break
                                case 'http':
                                    config = {
                                        title: 'HTTP WebHook',
                                        content: (
                                            <HttpAction
                                                index={index}
                                                action={action}
                                                updateActionArgs={
                                                    this._updateActionArguments
                                                }
                                                updateActionTitle={
                                                    this._updateActionTitle
                                                }
                                            />
                                        ),
                                    }
                                    break
                                case newMessageTypes.ADD_ATTACHMENTS:
                                    config = {
                                        title: 'Add attachments',
                                        content: (
                                            <AddAttachmentsAction
                                                index={index}
                                                action={action}
                                                addAttachments={
                                                    this._addAttachment
                                                }
                                                removeAttachment={
                                                    this._deleteAttachment
                                                }
                                            />
                                        ),
                                    }
                                    break
                                default: {
                                    const integrationType =
                                        getActionTemplate(action.get('name'))
                                            ?.integrationType || ''
                                    config = {
                                        title: `Action ${integrationType.toUpperCase()}`,
                                        content: (
                                            <IntegrationAction
                                                index={index}
                                                action={action}
                                            />
                                        ),
                                    }
                                }
                            }

                            // the unique key is based on index of action + ID of macro
                            // so when we switch from a macro to the other, all previous macro fields are unmounted
                            // it's simpler to manage lifecycle of actions components then
                            const key = `${index}${
                                currentMacro.get('id') as string
                            }`

                            return (
                                <div key={key} className="mt-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className={css.title}>
                                            {config.title}
                                        </div>
                                        <i
                                            className="material-icons md-2 clickable"
                                            onClick={() =>
                                                this._deleteAction(index)
                                            }
                                        >
                                            close
                                        </i>
                                    </div>
                                    {config.content}
                                </div>
                            )
                        }
                    )}

                    <div className="mt-3">
                        <UncontrolledButtonDropdown className="mr-2">
                            <DropdownToggle color="primary" caret type="button">
                                Add action
                            </DropdownToggle>
                            {this.renderNewActionMenu()}
                        </UncontrolledButtonDropdown>

                        {integrationMenus
                            .map(
                                (
                                    actions: Map<any, any>,
                                    key: IntegrationType
                                ) => {
                                    if (!hasIntegrationOfTypes(key)) {
                                        return null
                                    }

                                    // remove actions that have already been used
                                    const filteredActions = actions.filter(
                                        (action) =>
                                            !this.props.actions.find(
                                                (usedActions: Map<any, any>) =>
                                                    usedActions.get('name') ===
                                                    action
                                            )
                                    )

                                    if (filteredActions.isEmpty()) {
                                        return null
                                    }

                                    return (
                                        <UncontrolledButtonDropdown
                                            key={key}
                                            className="mr-2"
                                        >
                                            <DropdownToggle
                                                color="secondary"
                                                caret
                                                type="button"
                                            >
                                                Add {humanizeString(key)} action
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                {filteredActions.map(
                                                    (actionName) => {
                                                        return (
                                                            <DropdownItem
                                                                key={actionName}
                                                                type="button"
                                                                onClick={() =>
                                                                    this._addAction(
                                                                        actionName
                                                                    )
                                                                }
                                                            >
                                                                {getActionTemplate(
                                                                    actionName
                                                                )?.title ||
                                                                    humanizeString(
                                                                        actionName
                                                                    )}
                                                            </DropdownItem>
                                                        )
                                                    }
                                                )}
                                            </DropdownMenu>
                                        </UncontrolledButtonDropdown>
                                    )
                                }
                            )
                            .toList()}
                    </div>
                </div>
            </form>
        )
    }
}

const connector = connect((state: RootState) => ({
    hasIntegrationOfTypes: integrationsSelectors.makeHasIntegrationOfTypes(
        state
    ),
}))

export default connector(MacroEdit)
