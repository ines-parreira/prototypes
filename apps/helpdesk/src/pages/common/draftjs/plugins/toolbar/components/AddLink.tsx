import React, { Component, ContextType, KeyboardEvent, useEffect } from 'react'

import { EditorState, Modifier } from 'draft-js'
import ReactPlayer from 'react-player'
import { connect, ConnectedProps } from 'react-redux'

import { Button, Label } from '@gorgias/axiom'

import TextInputWithVariables from 'pages/automate/workflows/editor/visualBuilder/components/variables/TextInputWithVariables'
import { WorkflowVariableList } from 'pages/automate/workflows/models/variables.types'
import TabNavigator from 'pages/common/components/TabNavigator/TabNavigator'
import {
    addVideo,
    linkifyWithTemplate,
    removeLink,
} from 'pages/common/draftjs/plugins/utils'
import CheckBox from 'pages/common/forms/CheckBox'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import { useCampaignFormContext } from 'pages/convert/campaigns/hooks/useCampaignFormContext'
import { UtmConfiguration } from 'pages/convert/campaigns/types/CampaignFormConfiguration'
import { attachUtmToUrl } from 'pages/convert/campaigns/utils/attachUtmParams'
import { closest } from 'services/shortcutManager/utils'
import { linkEditionEnded, linkEditionStarted } from 'state/ui/editor/actions'
import {
    focusToTheEndOfContent,
    getEntitySelectionState,
    getSelectedEntityKey,
    getSelectedText,
} from 'utils/editor'
import { linkify } from 'utils/linkify'

import {
    ToolbarContext,
    ToolbarContextType,
    withToolbarContext,
} from '../ToolbarContext'
import { ActionInjectedProps, ActionName } from '../types'
import { getTooltipTourConfiguration } from '../utils'
import AddUtm from './AddUtm'
import Popover from './ButtonPopover'

import css from './AddLink.less'

const tabs = [
    { value: 'url', label: 'URL' },
    { value: 'utm', label: 'UTM' },
]

const CampaignFormContextInterceptor = (props: {
    appliedUtmUpdatedCallback: (
        appliedUtmQueryString: string,
        appliedUtmEnabled: boolean,
    ) => void
}) => {
    const { utmConfiguration } = useCampaignFormContext()
    const { appliedUtmEnabled, appliedUtmQueryString } =
        utmConfiguration as UtmConfiguration
    const { appliedUtmUpdatedCallback } = props
    useEffect(() => {
        appliedUtmUpdatedCallback(appliedUtmQueryString, appliedUtmEnabled)
    }, [appliedUtmEnabled, appliedUtmQueryString, appliedUtmUpdatedCallback])

    return <></>
}

const doesUrlStartWithTemplate = (url: string) => /^{{(.*?)}}/g.test(url)

type Props = {
    entityKey?: string
    url: string
    onUrlChange: (url: string) => void
    text: string
    onTextChange: (text: string) => void
    target: string
    onTargetChange: (target: string) => void
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
    getWorkflowVariables?: () => WorkflowVariableList
} & ActionInjectedProps &
    Pick<
        ToolbarContextType,
        'canAddVideoPlayer' | 'onInsertVideoAddedFromInsertLink'
    > &
    ConnectedProps<typeof connector>

export class AddLinkContainer extends Component<Props> {
    static contextType = ToolbarContext
    context!: ContextType<typeof ToolbarContext>
    workflowVariables: WorkflowVariableList | undefined

    constructor(props: Props) {
        super(props)

        this.workflowVariables = this.props.getWorkflowVariables?.()
    }

    state = {
        activeTab: tabs[0].value,
        appliedUtmQueryString: '',
        appliedUtmEnabled: false,
    }

    componentDidUpdate(prevProps: Props) {
        const { isOpen, linkEditionEnded, linkEditionStarted } = this.props

        if (!prevProps.isOpen && isOpen) {
            linkEditionStarted()
        } else if (prevProps.isOpen && !isOpen) {
            linkEditionEnded()
        }
    }

    _getUtmAppliedState = (
        appliedUtmQueryString: string,
        appliedUtmEnabled: boolean,
    ) => {
        if (
            this.state &&
            (appliedUtmQueryString !== this.state.appliedUtmQueryString ||
                appliedUtmEnabled !== this.state.appliedUtmEnabled)
        ) {
            this.setState({
                appliedUtmQueryString: appliedUtmQueryString,
                appliedUtmEnabled: appliedUtmEnabled,
            })
        }
    }

    _updateUrlWithConfiguredUtm = (url: string) => {
        if (!this.context.canAddUtm) return url
        const { appliedUtmQueryString, appliedUtmEnabled } = this.state
        return attachUtmToUrl(
            url,
            '',
            this.context.canAddUtm,
            appliedUtmEnabled,
            appliedUtmQueryString,
        )
    }

    _isValid = (): boolean =>
        !!(
            this.props.text.trim() &&
            this.props.url.trim() &&
            (doesUrlStartWithTemplate(this.props.url) ||
                linkify.test(this.props.url))
        )

    _getSelectedLinkEntityKey = (): Maybe<string> => {
        const editorState = this.props.getEditorState()
        const contentState = editorState.getCurrentContent()
        const selection = editorState.getSelection()
        const entityKey = getSelectedEntityKey(contentState, selection)

        if (
            !entityKey ||
            contentState.getEntity(entityKey).getType() !== 'link'
        ) {
            return
        }

        return entityKey
    }

    _onPopoverOpen = () => {
        const editorState = this.props.getEditorState()
        const contentState = editorState.getCurrentContent()
        const selection = editorState.getSelection()
        const entityKey = this._getSelectedLinkEntityKey()

        if (entityKey) {
            // if already a link, remove it
            this.props.setEditorState(removeLink(entityKey, editorState))
            return
        }

        this.props.onTextChange(getSelectedText(contentState, selection))
        this.props.onOpen()
    }

    _onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            this._submit()
        }

        if (e.key === 'Escape') {
            e.preventDefault()
            this.props.onClose()
        }
    }

    _submit = () => {
        if (!this._isValid()) {
            return
        }
        const newEditorState: EditorState | null = this.props.entityKey
            ? this._updateLink()
            : this._insertLink()

        if (newEditorState && !this.props.entityKey) {
            // Do not append a video if we are in `Update Link` mode.
            this._insertExtraVideoIfApplicable(newEditorState)
        }

        this.props.onClose()
    }

    _updateLink = (): EditorState | null => {
        let editorState = this.props.getEditorState()
        let contentState = editorState.getCurrentContent()
        const { url, text, entityKey } = this.props

        if (!entityKey) {
            return null
        }

        // Use linkify to add protocol to the url
        const preParsedUrl = linkifyWithTemplate(url)
        const parsedUrl = this._updateUrlWithConfiguredUtm(preParsedUrl)

        // Update url
        contentState = contentState.replaceEntityData(entityKey, {
            url: parsedUrl,
            target: this.props.target,
            ...(doesUrlStartWithTemplate(parsedUrl)
                ? { templatedUrl: parsedUrl }
                : {}),
        })
        editorState = EditorState.push(
            editorState,
            contentState,
            'apply-entity',
        )

        // Update text
        const selection = getEntitySelectionState(contentState, entityKey)
        if (selection) {
            contentState = Modifier.replaceText(
                contentState,
                selection,
                text,
                undefined,
                entityKey,
            )
            editorState = EditorState.push(
                editorState,
                contentState,
                'change-block-data',
            )
        }

        // Force selection workaround to trigger re-render of decorators
        // https://github.com/facebook/draft-js/issues/1047
        this.props.setEditorState(
            EditorState.forceSelection(editorState, editorState.getSelection()),
        )

        return editorState
    }

    _insertLink = (): EditorState | null => {
        const { url, text } = this.props
        // Use linkify to add protocol to the url
        const preParsedUrl = linkifyWithTemplate(url)
        const parsedUrl = this._updateUrlWithConfiguredUtm(preParsedUrl)

        let editorState = this.props.getEditorState()
        const selection = editorState.getSelection()

        let contentState = editorState
            .getCurrentContent()
            .createEntity('link', 'MUTABLE', {
                url: parsedUrl,
                target: this.props.target,
                ...(doesUrlStartWithTemplate(parsedUrl)
                    ? { templatedUrl: parsedUrl }
                    : {}),
            })
        const entityKey = contentState.getLastCreatedEntityKey()

        contentState = Modifier.replaceText(
            contentState,
            selection,
            text,
            undefined,
            entityKey,
        )
        editorState = EditorState.push(
            editorState,
            contentState,
            'apply-entity',
        )
        editorState = EditorState.forceSelection(
            editorState,
            editorState.getSelection(),
        ) // Focus the editor

        this.props.setEditorState(editorState)

        return editorState
    }

    _insertExtraVideoIfApplicable = (editorState: EditorState) => {
        const { url, onInsertVideoAddedFromInsertLink, setEditorState } =
            this.props

        if (!this.props.canAddVideoPlayer || !ReactPlayer.canPlay(url)) {
            return
        }

        let newEditorState = focusToTheEndOfContent(editorState)
        newEditorState = addVideo(newEditorState, url)

        newEditorState = EditorState.forceSelection(
            newEditorState,
            newEditorState.getSelection(),
        )
        setEditorState(newEditorState)

        onInsertVideoAddedFromInsertLink()
    }

    _flowVariablesDisablePopoverToggle = (
        e: React.MouseEvent<any, globalThis.MouseEvent>,
    ) => {
        if (!this.workflowVariables?.length) return false
        if (
            'target' in e &&
            (closest(e.target as Element, `[id^="floating-ui-"]`) ||
                !document.contains(e.target as Element))
        ) {
            return true
        }
        return false
    }

    navigateToFirstTab = () => {
        this.setState({ activeTab: tabs[0].value })
    }
    onAddUtmApply = () => {
        this.navigateToFirstTab()
    }

    render() {
        const { toolbarTour } = this.context
        const tour = getTooltipTourConfiguration(ActionName.Link, toolbarTour)

        return (
            <Popover
                icon="link"
                name="Insert link"
                tour={tour}
                isOpen={this.props.isOpen}
                isDisabled={this.props.isDisabled}
                onOpen={this._onPopoverOpen}
                onClose={this.props.onClose}
                toggleGuard={this._flowVariablesDisablePopoverToggle}
            >
                {this.context.canAddUtm && (
                    <>
                        <TabNavigator
                            activeTab={this.state.activeTab}
                            onTabChange={(value: string) =>
                                this.setState({ activeTab: value })
                            }
                            tabs={tabs}
                        />
                        <CampaignFormContextInterceptor
                            appliedUtmUpdatedCallback={this._getUtmAppliedState}
                        />
                    </>
                )}
                {this.state.activeTab === 'url' || !this.context.canAddUtm ? (
                    <div className={css.wrapper} onKeyDown={this._onKeyDown}>
                        <DEPRECATED_InputField
                            className={css.field}
                            label="Link text"
                            placeholder="Ex. Help Center Article"
                            onChange={this.props.onTextChange}
                            value={this.props.text}
                            autoFocus={!this.props.text}
                        />

                        {this.workflowVariables ? (
                            <>
                                <div className={css.variableInputField}>
                                    <Label>URL</Label>
                                    <TextInputWithVariables
                                        variables={this.workflowVariables}
                                        placeholder="https://help.domain.com"
                                        value={this.props.url}
                                        onChange={this.props.onUrlChange}
                                    />
                                </div>
                                <div className={css.variableInputField}>
                                    <CheckBox
                                        isChecked={
                                            this.props.target === '_blank'
                                        }
                                        onChange={(nextValue) => {
                                            this.props.onTargetChange(
                                                nextValue ? '_blank' : '_self',
                                            )
                                        }}
                                    >
                                        Open in a new tab
                                    </CheckBox>
                                </div>
                            </>
                        ) : (
                            <DEPRECATED_InputField
                                className={css.field}
                                label="URL"
                                placeholder="https://help.domain.com/article"
                                onChange={this.props.onUrlChange}
                                value={this.props.url}
                                autoFocus={!!this.props.text}
                            />
                        )}
                        <Button
                            isDisabled={!this._isValid()}
                            onClick={this._submit}
                        >
                            {this.props.entityKey
                                ? 'Update Link'
                                : 'Insert Link'}
                        </Button>
                    </div>
                ) : (
                    <AddUtm
                        {...this.context}
                        onKeyDown={this._onKeyDown}
                        onApply={this.onAddUtmApply}
                    />
                )}
            </Popover>
        )
    }
}

const connector = connect(null, {
    linkEditionStarted,
    linkEditionEnded,
})

export default connector(withToolbarContext(AddLinkContainer))
