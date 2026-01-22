import type { ComponentProps } from 'react'
import { useCallback } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import classnames from 'classnames'
import type { List } from 'immutable'
import { fromJS, Map } from 'immutable'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledButtonDropdown,
} from 'reactstrap'

import type { Macro } from '@gorgias/helpdesk-queries'

import { ACTION_TEMPLATES, ActionTemplateExecution } from 'config'
import useAppSelector from 'hooks/useAppSelector'
import type { IntegrationType } from 'models/integration/types'
import { MacroActionName } from 'models/macroAction/types'
import type { Attachment } from 'models/ticket/types'
import InputField from 'pages/common/forms/input/InputField'
import { getSortedIntegrationActionsNames } from 'pages/tickets/common/utils'
import { makeHasIntegrationOfTypes } from 'state/integrations/selectors'
import { generateDefaultAction } from 'state/macro/utils'
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
    container?: ComponentProps<typeof DropdownMenu>['container']
}

export const MacroEdit = ({
    actions,
    className,
    currentMacro,
    name,
    language,
    setActions,
    setName,
    setLanguage,
}: Props) => {
    const hasIntegrationOfTypes = useAppSelector(makeHasIntegrationOfTypes)
    const isMacroForwardByEmailEnabled = useFlag(
        FeatureFlagKey.MacroForwardByEmail,
    )

    const extractText = useCallback(() => {
        const action: Map<any, any> = actions?.find(
            (action: Map<any, any>) =>
                action.get('name') === MacroActionName.SetResponseText,
        )
        return action
            ? (action.getIn(['arguments', 'body_text']) as string)
            : ''
    }, [actions])

    const updateActionArguments = useCallback(
        (index: number, args = fromJS({})) => {
            const updatedActions = actions?.setIn([index, 'arguments'], args)
            setActions(updatedActions)
        },
        [actions, setActions],
    )

    const updateActionTitle = useCallback(
        (index: number, title: string) => {
            const updatedActions = actions?.setIn([index, 'title'], title)
            setActions(updatedActions)
        },
        [actions, setActions],
    )

    const addAction = useCallback(
        (actionName: MacroActionName) => {
            const updatedActions = actions?.push(
                fromJS(generateDefaultAction(actionName)),
            )
            setActions(updatedActions)
        },
        [actions, setActions],
    )

    const deleteAction = useCallback(
        (index: number) => {
            const updatedActions = actions?.delete(index)
            setActions(updatedActions)
        },
        [actions, setActions],
    )

    const replaceAction = useCallback(
        (index: number, actionName: MacroActionName) => {
            const replyActions = [
                MacroActionName.SetResponseText,
                MacroActionName.ForwardByEmail,
                MacroActionName.AddInternalNote,
            ]

            const currentAction = actions?.get(index) as Map<any, any>
            let newAction = generateDefaultAction(actionName)!

            if (
                [currentAction.get('name'), actionName].every((action) =>
                    replyActions.includes(action),
                )
            ) {
                let args = (
                    currentAction.get('arguments') as Map<any, any>
                ).delete('to')

                if (
                    currentAction.get('name') ===
                    MacroActionName.AddInternalNote
                ) {
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

            const updatedActions = actions?.set(index, fromJS(newAction))
            setActions(updatedActions)
        },
        [actions, setActions],
    )

    const addAttachment = useCallback(
        (index: number, files: Attachment[]) => {
            const updatedActions = actions?.updateIn(
                [index, 'arguments', 'attachments'],
                (attachments: List<any>) => attachments.concat(fromJS(files)),
            )
            setActions(updatedActions)
        },
        [actions, setActions],
    )

    const deleteAttachment = useCallback(
        (actionIndex: number, fileIndex: number) => {
            const updatedActions = actions?.updateIn(
                [actionIndex, 'arguments', 'attachments'],
                (attachments: List<any>) => attachments.delete(fileIndex),
            )
            setActions(updatedActions)
        },
        [actions, setActions],
    )

    const renderNewActionMenu = useCallback(
        ({
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
                // except for SetCustomFieldValue and SetCustomerCustomFieldValue which are allowed multiple times
                .filter(
                    (action) =>
                        action.name === MacroActionName.SetCustomFieldValue ||
                        action.name ===
                            MacroActionName.SetCustomerCustomFieldValue ||
                        !actions?.find(
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
                                onClick={() => addAction(actionName)}
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
                                onClick={() => addAction(actionName)}
                            >
                                {action.title || humanizeString(actionName)}
                            </DropdownItem>
                        )
                    })}
                </DropdownMenu>
            )
        },
        [actions, addAction],
    )

    const renderAction = useCallback(
        (action: Maybe<Map<any, any>>, index: Maybe<number>) => {
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
                                updateActionArgs={updateActionArguments}
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
                                updateActionArgs={updateActionArguments}
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
                                updateActionArgs={updateActionArguments}
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
                                actions={actions}
                                updateActionArgs={updateActionArguments}
                                convertAction={(type) =>
                                    replaceAction(index, type)
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
                                actions={actions}
                                updateActionArgs={updateActionArguments}
                                convertAction={(type) =>
                                    replaceAction(index, type)
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
                                actions={actions}
                                updateActionArgs={updateActionArguments}
                                convertAction={(type) =>
                                    replaceAction(index, type)
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
                                updateActionArgs={updateActionArguments}
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
                                updateActionArgs={updateActionArguments}
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
                                updateActionArgs={updateActionArguments}
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
                                updateActionArgs={updateActionArguments}
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
                                updateActionArgs={updateActionArguments}
                                updateActionTitle={updateActionTitle}
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
                                addAttachments={addAttachment}
                                removeAttachment={deleteAttachment}
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
                                actions={actions}
                                updateActionArgs={updateActionArguments}
                            />
                        ),
                    }
                    break
                case MacroActionName.SetCustomerCustomFieldValue:
                    config = {
                        title: 'Set customer field',
                        content: (
                            <SetCustomFieldValueAction
                                index={index}
                                action={action}
                                actions={actions}
                                updateActionArgs={updateActionArguments}
                                objectType="Customer"
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
                                updateActionArgs={updateActionArguments}
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
                            <IntegrationAction index={index} action={action} />
                        ),
                    }
                }
            }
            // the unique key is based on index of action + ID of macro
            // so when we switch from a macro to the other, all previous macro fields are unmounted
            // it's simpler to manage lifecycle of actions components then
            const key = `${index}${currentMacro?.id}`

            return (
                <div key={key} className="mt-3">
                    <div className="mb-2">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className={css.title}>{config.title}</div>
                            <i
                                className="material-icons md-2 clickable"
                                onClick={() => deleteAction(index)}
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
        },
        [
            actions,
            currentMacro,
            updateActionArguments,
            updateActionTitle,
            addAttachment,
            deleteAttachment,
            replaceAction,
            deleteAction,
        ],
    )

    if (!currentMacro || !Object.keys(currentMacro).length) return null

    // external actions with externalType grouped by externalType
    const integrationMenus: Map<any, any> = getSortedIntegrationActionsNames(
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
                            onChange={setName}
                            value={name}
                            hasError={!name}
                            label="Macro name"
                            isRequired
                            className="mb-0"
                        />
                        <span className="text-muted form-text">
                            Name that all agents will see while searching for
                            it.
                        </span>
                    </div>
                    <div className="flex-grow-1">
                        <div className={classnames('mb-2', css.title)}>
                            Language
                        </div>
                        <MacroEditLanguage
                            key={currentMacro.id} //Force remount on macro change
                            language={language}
                            setLanguage={setLanguage}
                            text={extractText()}
                        />
                        <span className="text-muted form-text">
                            Language in which this macro is written.
                        </span>
                    </div>
                </div>
                {actions
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
                        return renderAction(action, action?.get('idx'))
                    })
                    .toArray()}
                <div className="mt-3">
                    <UncontrolledButtonDropdown className="mr-2">
                        <DropdownToggle color="secondary" caret type="button">
                            Add action
                        </DropdownToggle>
                        {renderNewActionMenu({
                            isMacroForwardByEmailEnabled,
                        })}
                    </UncontrolledButtonDropdown>

                    {integrationMenus
                        .map(
                            (
                                integrationMenusActions: Map<any, any>,
                                key: IntegrationType,
                            ) => {
                                if (!hasIntegrationOfTypes(key)) {
                                    return null
                                }

                                // remove actions that have already been used
                                const filteredActions =
                                    integrationMenusActions?.filter(
                                        (action) =>
                                            !actions?.find(
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
                                                                addAction(
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
