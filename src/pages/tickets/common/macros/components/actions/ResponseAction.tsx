import React, {useState, useRef, useCallback} from 'react'
import {
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap'
import {List, Map} from 'immutable'
import {EditorState} from 'draft-js'
import {useFlags} from 'launchdarkly-react-client-sdk'
import classnames from 'classnames'

import {FeatureFlagKey} from 'config/featureFlags'
import Button from 'pages/common/components/button/Button'
import Tip from 'pages/common/components/tip/Tip'
import {insertText} from 'utils'
import {attachEntitiesToVariables} from 'pages/common/draftjs/plugins/variables/utils'
import {getVariables} from 'config/ticket'
import {convertToHTML, getPlainText} from 'utils/editor'
import {IntegrationType} from 'models/integration/types'
import DEPRECATED_RichField from 'pages/common/forms/RichField/DEPRECATED_RichField'
import * as integrationsSelectors from 'state/integrations/selectors'
import {MacroActionName} from 'models/macroAction/types'
import useAppSelector from 'hooks/useAppSelector'

import MacroMessageActionsHeader, {
    MacroMessageActionsHeaderProps,
} from '../MacroMessageActionsHeader'
import MacroReplyActionControls, {
    onFieldChange,
} from '../MacroReplyActionControls'

type Props = {
    type:
        | typeof MacroActionName.SetResponseText
        | typeof MacroActionName.ForwardByEmail
    action: Map<string, any>
    actions?: List<any>
    index: number
    tabIndex?: number
    ignoredVariables?: string[]
    updateActionArgs: (index: number, args: Map<string, any>) => void
    toolbarOnTop?: boolean
    hideToolbar?: boolean
    convertAction?: MacroMessageActionsHeaderProps['onSelect']
    showReplyControls?: boolean
    className?: string
    replyControlsClassName?: string
}

type InsertEditorText = (text: string) => void

type ToolbarProps = Pick<Props, 'ignoredVariables'> & {
    insertEditorText: InsertEditorText
}

const ResponseActionToolbar: React.FC<ToolbarProps> = ({
    ignoredVariables,
    insertEditorText,
}) => {
    const hasIntegrationOfTypes = useAppSelector(
        integrationsSelectors.makeHasIntegrationOfTypes
    )

    const variables = getVariables(null)

    return (
        <div className="textarea-toolbar">
            {variables
                .filter(
                    (category) =>
                        !ignoredVariables ||
                        !ignoredVariables?.includes(category.type)
                )
                .map((category, index) => {
                    if (
                        category.integration &&
                        !hasIntegrationOfTypes(category.type as IntegrationType)
                    ) {
                        return null
                    }

                    return category.children ? (
                        <UncontrolledButtonDropdown key={index}>
                            <DropdownToggle
                                color="secondary"
                                caret
                                type="button"
                                className="dropdown-toggle btn-sm mr-2"
                            >
                                {category.name}
                            </DropdownToggle>
                            <DropdownMenu>
                                {category.children.map(
                                    (variable, indexVariable) => {
                                        return (
                                            <DropdownItem
                                                key={indexVariable}
                                                type="button"
                                                onClick={() => {
                                                    insertEditorText(
                                                        variable.value
                                                    )
                                                }}
                                            >
                                                {variable.name}
                                            </DropdownItem>
                                        )
                                    }
                                )}
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>
                    ) : (
                        <Button
                            fillStyle="ghost"
                            intent="secondary"
                            style={{color: 'inherit'}}
                            onClick={() => {
                                insertEditorText(category.value!)
                            }}
                            type="button"
                        >
                            {category.name}
                        </Button>
                    )
                })}
        </div>
    )
}

const ResponseAction: React.FC<Props> = ({
    type,
    action,
    actions,
    className,
    convertAction,
    hideToolbar,
    replyControlsClassName,
    showReplyControls,
    tabIndex,
    toolbarOnTop,
    index,
    ignoredVariables,
    updateActionArgs,
}) => {
    const richArea = useRef<DEPRECATED_RichField>(null)
    const [showCcTip, setShowCcTip] = useState(false)

    const {
        [FeatureFlagKey.MacroResponseTextCcBcc]: isMacroResponseCcBccEnabled,
        [FeatureFlagKey.MacroForwardByEmail]: isMacroForwardByEmailEnabled,
    } = useFlags()

    const insertEditorText = useCallback<InsertEditorText>((text) => {
        if (!richArea.current) {
            return
        }

        // insert text at selection
        let editorState = richArea.current.state.editorState
        editorState = insertText(editorState, text)
        // transform inserted variable in badge
        // we do it on insertion so we do not have focus/cursor position errors
        editorState = attachEntitiesToVariables(editorState, true)
        richArea.current.setEditorState(editorState)
    }, [])

    const _setField: onFieldChange = (field, value) => {
        const args: Map<any, any> = action.get('arguments')

        updateActionArgs(
            index,
            args.merge({
                [field]: value,
            })
        )
    }

    const _setResponseText = (editorState: EditorState) => {
        const args: Map<any, any> = action.get('arguments')
        const contentState = editorState.getCurrentContent()
        updateActionArgs(
            index,
            args.merge({
                body_text: getPlainText(contentState),
                body_html: convertToHTML(contentState),
            })
        )
    }

    const toolbar = !hideToolbar && (
        <ResponseActionToolbar
            ignoredVariables={ignoredVariables}
            insertEditorText={insertEditorText}
        />
    )

    const {to, cc, bcc} = (action.get('arguments') as Map<any, any>).toJS()

    const fields = {
        to: type === MacroActionName.SetResponseText ? undefined : to || '',
        cc,
        bcc,
    }

    const showConvertHeader = actions && convertAction

    return (
        <div className={classnames('field', className)}>
            {isMacroResponseCcBccEnabled || isMacroForwardByEmailEnabled ? (
                type === MacroActionName.SetResponseText &&
                !isMacroResponseCcBccEnabled ? (
                    showConvertHeader && (
                        <MacroMessageActionsHeader
                            actions={actions!}
                            type={MacroActionName.AddInternalNote}
                            onSelect={convertAction!}
                        >
                            <span className="font-weight-medium">
                                Response text
                            </span>
                        </MacroMessageActionsHeader>
                    )
                ) : (
                    <>
                        {type === MacroActionName.ForwardByEmail && (
                            <Tip
                                icon={true}
                                actionLabel="Got It"
                                storageKey="forward-by-email"
                                className="mb-2"
                            >
                                In some cases, forwarded messages may be visible
                                to the original sender.{' '}
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://docs.gorgias.com/en-US/macro-actions-81913"
                                >
                                    Learn more
                                </a>
                            </Tip>
                        )}
                        {type === MacroActionName.SetResponseText &&
                            (showCcTip || cc || bcc) && (
                                <Tip
                                    icon={true}
                                    actionLabel="Got It"
                                    storageKey="response-cc"
                                    className="mb-2"
                                >
                                    If a cc is applied and the original message
                                    channel is not email then the entire thread
                                    will be converted to email.
                                </Tip>
                            )}
                        {showConvertHeader && (
                            <MacroMessageActionsHeader
                                actions={actions!}
                                type={type}
                                onSelect={convertAction!}
                            >
                                <MacroReplyActionControls
                                    fields={fields}
                                    tabIndex={tabIndex}
                                    onChange={_setField}
                                    onShowCcBcc={() => setShowCcTip(true)}
                                    showCcBccTooltip
                                    className={replyControlsClassName}
                                />
                            </MacroMessageActionsHeader>
                        )}
                        {!showConvertHeader && showReplyControls && (
                            <MacroReplyActionControls
                                fields={fields}
                                tabIndex={tabIndex}
                                onChange={_setField}
                                className={replyControlsClassName}
                            />
                        )}
                    </>
                )
            ) : null}
            {toolbarOnTop && toolbar}
            <DEPRECATED_RichField
                ref={richArea}
                value={{
                    text: action.getIn(['arguments', 'body_text'], ''),
                    html: action.getIn(['arguments', 'body_html'], ''),
                }}
                onChange={_setResponseText}
                spellCheck
                productCardsEnabled={false}
                placeholder="Type {{ for variables }}"
            />
            {!toolbarOnTop && toolbar}
        </div>
    )
}

export default ResponseAction
