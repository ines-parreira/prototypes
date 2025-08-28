import React, { Component, ComponentClass, ComponentProps } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import classnames from 'classnames'
import { fromJS, List, Map } from 'immutable'
import { LDFlagSet } from 'launchdarkly-js-client-sdk'
import { withLDConsumer } from 'launchdarkly-react-client-sdk'
import { connect, ConnectedProps } from 'react-redux'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledButtonDropdown,
} from 'reactstrap'

import { Macro } from '@gorgias/helpdesk-queries'

import { ACTION_TEMPLATES, ActionTemplateExecution } from 'config'
import { IntegrationType } from 'models/integration/types'
import { MacroActionName } from 'models/macroAction/types'
import { Attachment } from 'models/ticket/types'
import InputField from 'pages/common/forms/input/InputField'
import { getSortedIntegrationActionsNames } from 'pages/tickets/common/utils'
import * as integrationsSelectors from 'state/integrations/selectors'
import { generateDefaultAction } from 'state/macro/utils'
import { RootState } from 'state/types'
import { getActionTemplate, humanizeString } from 'utils'

import AddAttachmentsAction from './actions/AddAttachmentsAction'
import AddInternalNoteAction from './actions/AddInternalNoteAction'
import AddTagsAction from './actions/AddTagsAction'
import HttpAction from './actions/HttpAction'
import IntegrationAction from './actions/IntegrationAction'
import ResponseAction from './actions/ResponseAction'
import SetAssigneeAction from './actions/SetAssigneeAction'
import SetCustomFieldValueAction from './actions/SetCustomFieldValueAction'
import SetPriorityAction from './actions/SetPriorityAction'
import SetStatusAction from './actions/SetStatusAction'
import SetSubjectAction from './actions/SetSubjectAction'
import SnoozeTicketAction from './actions/SnoozeTicketAction'
import MacroEditLanguage from './MacroEditLanguage'

import css from './MacroEdit.less'

type Props = {
    actions: List<any> | null
    agents: List<any>
    className?: string
    currentMacro?: Macro
    name: string
    language: string | null
    setActions: (actions?: List<any> | null) => void
    setName: (name: string) => void
    setLanguage: (language: string | null) => void
    flags: LDFlagSet
    container?: ComponentProps<typeof DropdownMenu>['container']
} & ConnectedProps<typeof connector>

export class MacroEdit extends Component<Props> {
    _extractText = () => {
        const action: Map<any, any> = this.props.actions?.find(
            (action: Map<any, any>) =>
                action.get('name') === MacroActionName.SetResponseText,
        )
        return action
            ? (action.getIn(['arguments', 'body_text']) as string)
            : ''
    }

    _updateActionArguments = (index: number, args = fromJS({})) => {
        const actions = this.props.actions?.setIn([index, 'arguments'], args)
        this.props.setActions(actions)
    }

    _updateActionTitle = (index: number, title: string) => {
        const actions = this.props.actions?.setIn([index, 'title'], title)
        this.props.setActions(actions)
    }

    _addAction = (actionName: MacroActionName) => {
        const actions = this.props.actions?.push(
            fromJS(generateDefaultAction(actionName)),
        )
        this.props.setActions(actions)
    }

    _deleteAction = (index: number) => {
        const actions = this.props.actions?.delete(index)
        this.props.setActions(actions)
    }

    _replaceAction = (index: number, actionName: MacroActionName) => {
        const replyActions = [
            MacroActionName.SetResponseText,
            MacroActionName.ForwardByEmail,
            MacroActionName.AddInternalNote,
        ]

        const currentAction = this.props.actions?.get(index) as Map<any, any>
        let newAction = generateDefaultAction(actionName)!

        if (
            [currentAction.get('name'), actionName].every((action) =>
                replyActions.includes(action),
            )
        ) {
            let args = (currentAction.get('arguments') as Map<any, any>).delete(
                'to',
            )

            if (currentAction.get('name') === MacroActionName.AddInternalNote) {
                args = Map({
                    body_text: args.get('body_text'),
                    body_html: args.get('body_html'),
                })
            }

            newAction = {
                ...newAction,
                arguments: args,
            }
        }

        const actions = this.props.actions?.set(index, fromJS(newAction))
        this.props.setActions(actions)
    }

    _addAttachment = (index: number, files: Attachment[]) => {
        const actions = this.props.actions?.updateIn(
            [index, 'arguments', 'attachments'],
            (attachments: List<any>) => attachments.concat(fromJS(files)),
        )
        this.props.setActions(actions)
    }

    _deleteAttachment = (actionIndex: number, fileIndex: number) => {
        const actions = this.props.actions?.updateIn(
            [actionIndex, 'arguments', 'attachments'],
            (attachments: List<any>) => attachments.delete(fileIndex),
        )
        this.props.setActions(actions)
    }

    renderNewActionMenu = ({
        isMacroForwardByEmailEnabled,
    }: {
        isMacroForwardByEmailEnabled: boolean
    }) => {
        const ticketActions = ACTION_TEMPLATES.filter(
            (template) =>
                template.execution !== ActionTemplateExecution.External,
        )
            .filter(
                ({ name }) =>
                    isMacroForwardByEmailEnabled ||
                    name !== MacroActionName.ForwardByEmail,
            )
            // remove actions that have already been used
            // except for SetCustomFieldValue which is allowed multiple times
            .filter(
                (action) =>
                    action.name === MacroActionName.SetCustomFieldValue ||
                    !this.props.actions?.find(
                        (usedActions: Map<any, any>) =>
                            usedActions.get('name') === action.name,
                    ),
            )

        const nonIntegrationActions = ACTION_TEMPLATES.filter(
            ({ execution, integrationType }) =>
                execution === ActionTemplateExecution.External &&
                !integrationType,
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

    renderAction = (action: Maybe<Map<any, any>>, index: Maybe<number>) => {
        if (index == null || action == null) return
        let config

        switch (action.get('name') as MacroActionName) {
            case MacroActionName.SetStatus:
                config = {
                    title: 'Set status',
                    content: (
                        <SetStatusAction
                            index={index}
                            action={action}
                            updateActionArgs={this._updateActionArguments}
                        />
                    ),
                }
                break
            case MacroActionName.AddTags:
                config = {
                    title: 'Add tags to ticket',
                    description:
                        'These tags will both be added to the ticket and help you better search for your macros.',
                    content: (
                        <AddTagsAction
                            index={index}
                            args={action.get('arguments')}
                            updateActionArgs={this._updateActionArguments}
                        />
                    ),
                }
                break
            case MacroActionName.RemoveTags:
                config = {
                    title: 'Remove tags from ticket',
                    content: (
                        <AddTagsAction
                            index={index}
                            args={action.get('arguments')}
                            updateActionArgs={this._updateActionArguments}
                        />
                    ),
                }
                break
            case MacroActionName.SetResponseText:
                config = {
                    title: 'Response text',
                    content: (
                        <ResponseAction
                            type={MacroActionName.SetResponseText}
                            index={index}
                            action={action}
                            actions={this.props.actions}
                            updateActionArgs={this._updateActionArguments}
                            convertAction={(type) =>
                                this._replaceAction(index, type)
                            }
                        />
                    ),
                }
                break
            case MacroActionName.ForwardByEmail:
                config = {
                    title: 'Forward by email',
                    content: (
                        <ResponseAction
                            type={MacroActionName.ForwardByEmail}
                            index={index}
                            action={action}
                            actions={this.props.actions}
                            updateActionArgs={this._updateActionArguments}
                            convertAction={(type) =>
                                this._replaceAction(index, type)
                            }
                        />
                    ),
                }
                break
            case MacroActionName.AddInternalNote:
                config = {
                    title: 'Internal note',
                    content: (
                        <AddInternalNoteAction
                            index={index}
                            action={action}
                            actions={this.props.actions}
                            updateActionArgs={this._updateActionArguments}
                            convertAction={(type) =>
                                this._replaceAction(index, type)
                            }
                        />
                    ),
                }
                break
            case MacroActionName.SetAssignee:
                config = {
                    title: 'Set user assignee',
                    content: (
                        <SetAssigneeAction
                            index={index}
                            action={action}
                            updateActionArgs={this._updateActionArguments}
                            handleUsers={true}
                        />
                    ),
                }
                break
            case MacroActionName.SetTeamAssignee:
                config = {
                    title: 'Set team assignee',
                    content: (
                        <SetAssigneeAction
                            index={index}
                            action={action}
                            updateActionArgs={this._updateActionArguments}
                            handleTeams={true}
                        />
                    ),
                }
                break
            case MacroActionName.SetSubject:
                config = {
                    title: 'Set ticket subject',
                    content: (
                        <SetSubjectAction
                            index={index}
                            action={action}
                            updateActionArgs={this._updateActionArguments}
                        />
                    ),
                }
                break
            case MacroActionName.SnoozeTicket:
                config = {
                    title: 'Snooze for',
                    content: (
                        <SnoozeTicketAction
                            index={index}
                            action={action}
                            updateActionArgs={this._updateActionArguments}
                        />
                    ),
                }
                break
            case MacroActionName.Http:
                config = {
                    title: 'HTTP WebHook',
                    content: (
                        <HttpAction
                            index={index}
                            action={action}
                            updateActionArgs={this._updateActionArguments}
                            updateActionTitle={this._updateActionTitle}
                        />
                    ),
                }
                break
            case MacroActionName.AddAttachments:
                config = {
                    title: 'Add attachments',
                    content: (
                        <AddAttachmentsAction
                            index={index}
                            action={action}
                            addAttachments={this._addAttachment}
                            removeAttachment={this._deleteAttachment}
                        />
                    ),
                }
                break
            case MacroActionName.ExcludeFromAutoMerge:
                config = {
                    title: 'Exclude ticket from Auto-Merge',
                    content: null,
                }
                break
            case MacroActionName.ExcludeFromCSAT:
                config = {
                    title: 'Exclude ticket from CSAT',
                    content: null,
                }
                break
            case MacroActionName.SetCustomFieldValue:
                config = {
                    title: 'Set ticket field',
                    content: (
                        <SetCustomFieldValueAction
                            index={index}
                            action={action}
                            actions={this.props.actions}
                            updateActionArgs={this._updateActionArguments}
                        />
                    ),
                }
                break
            case MacroActionName.SetPriority:
                config = {
                    title: 'Set priority',
                    content: (
                        <SetPriorityAction
                            index={index}
                            action={action}
                            updateActionArgs={this._updateActionArguments}
                        />
                    ),
                }
                break
            default: {
                const integrationType =
                    getActionTemplate(action.get('name'))?.integrationType || ''
                config = {
                    title: `Action ${integrationType.toUpperCase()}`,
                    content: (
                        <IntegrationAction index={index} action={action} />
                    ),
                }
            }
        }
        // the unique key is based on index of action + ID of macro
        // so when we switch from a macro to the other, all previous macro fields are unmounted
        // it's simpler to manage lifecycle of actions components then
        const key = `${index}${this.props.currentMacro?.id}`

        return (
            <div key={key} className="mt-3">
                <div className="mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className={css.title}>{config.title}</div>
                        <i
                            className="material-icons md-2 clickable"
                            onClick={() => this._deleteAction(index)}
                        >
                            close
                        </i>
                    </div>
                    {config.description && (
                        <span className="text-muted form-text mb-2">
                            {config.description}
                        </span>
                    )}
                </div>
                {config.content}
            </div>
        )
    }

    render() {
        const { className, currentMacro, flags, hasIntegrationOfTypes } =
            this.props

        const isMacroForwardByEmailEnabled =
            !!flags[FeatureFlagKey.MacroForwardByEmail]

        if (!currentMacro || !Object.keys(currentMacro).length) return null

        // external actions with externalType grouped by externalType
        const integrationMenus: Map<any, any> =
            getSortedIntegrationActionsNames(
                ACTION_TEMPLATES.filter(
                    ({ execution, integrationType }) =>
                        execution === ActionTemplateExecution.External &&
                        !!integrationType,
                ),
            )

        return (
            <form>
                <div className={classnames(css.wrapper, className)}>
                    <div className="d-flex">
                        <div className="flex-grow-1 mr-4">
                            <InputField
                                type="text"
                                name="name"
                                onChange={this.props.setName}
                                value={this.props.name}
                                hasError={!this.props.name}
                                label="Macro name"
                                isRequired
                                className="mb-0"
                            />
                            <span className="text-muted form-text">
                                Name that all agents will see while searching
                                for it.
                            </span>
                        </div>
                        <div className="flex-grow-1">
                            <div className={classnames('mb-2', css.title)}>
                                Language
                            </div>
                            <MacroEditLanguage
                                key={currentMacro.id} //Force remount on macro change
                                language={this.props.language}
                                setLanguage={this.props.setLanguage}
                                text={this._extractText()}
                            />
                            <span className="text-muted form-text">
                                Language in which this macro is written.
                            </span>
                        </div>
                    </div>
                    {this.props.actions
                        ?.filter(
                            (action: Map<any, any>) =>
                                isMacroForwardByEmailEnabled ||
                                action.get('name') !==
                                    MacroActionName.ForwardByEmail,
                        )
                        .map(
                            (action: Map<any, any>, index) =>
                                action.set('idx', index), // Store the initial index for action updates
                        )
                        .map((action?: Map<any, any>) => {
                            return this.renderAction(action, action?.get('idx'))
                        })
                        .toArray()}
                    <div className="mt-3">
                        <UncontrolledButtonDropdown className="mr-2">
                            <DropdownToggle
                                color="secondary"
                                caret
                                type="button"
                            >
                                Add action
                            </DropdownToggle>
                            {this.renderNewActionMenu({
                                isMacroForwardByEmailEnabled,
                            })}
                        </UncontrolledButtonDropdown>

                        {integrationMenus
                            .map(
                                (
                                    actions: Map<any, any>,
                                    key: IntegrationType,
                                ) => {
                                    if (!hasIntegrationOfTypes(key)) {
                                        return null
                                    }

                                    // remove actions that have already been used
                                    const filteredActions = actions?.filter(
                                        (action) =>
                                            !this.props.actions?.find(
                                                (usedActions: Map<any, any>) =>
                                                    usedActions.get('name') ===
                                                    action,
                                            ),
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
                                                {filteredActions
                                                    .toArray()
                                                    .map((actionName) => {
                                                        return (
                                                            <DropdownItem
                                                                key={actionName}
                                                                type="button"
                                                                onClick={() =>
                                                                    this._addAction(
                                                                        actionName,
                                                                    )
                                                                }
                                                            >
                                                                {getActionTemplate(
                                                                    actionName,
                                                                )?.title ||
                                                                    humanizeString(
                                                                        actionName,
                                                                    )}
                                                            </DropdownItem>
                                                        )
                                                    })}
                                            </DropdownMenu>
                                        </UncontrolledButtonDropdown>
                                    )
                                },
                            )
                            .toArray()}
                    </div>
                </div>
            </form>
        )
    }
}

const connector = connect((state: RootState) => ({
    hasIntegrationOfTypes:
        integrationsSelectors.makeHasIntegrationOfTypes(state),
}))

export default connector(
    withLDConsumer()(
        MacroEdit as unknown as ComponentClass<Omit<Props, 'flags'>>,
    ),
)
