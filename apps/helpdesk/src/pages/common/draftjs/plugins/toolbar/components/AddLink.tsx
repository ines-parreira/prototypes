import type { ContextType, KeyboardEvent, RefObject } from 'react'
import type React from 'react'
import {
    Component,
    createRef,
    useCallback,
    useEffect,
    useLayoutEffect,
} from 'react'

import type { Placement } from '@floating-ui/react'
import {
    autoUpdate,
    flip,
    FloatingFocusManager,
    FloatingPortal,
    offset as offsetMiddleware,
    shift,
    useDismiss,
    useFloating,
    useInteractions,
} from '@floating-ui/react'
import { EditorState, Modifier, SelectionState } from 'draft-js'
import ReactPlayer from 'react-player'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'

import { Button, LegacyLabel as Label } from '@gorgias/axiom'

import { useAppNode } from 'appNode'
import TextInputWithVariables from 'pages/automate/workflows/editor/visualBuilder/components/variables/TextInputWithVariables'
import type { WorkflowVariableList } from 'pages/automate/workflows/models/variables.types'
import { ModalContext } from 'pages/common/components/modal/Modal'
import TabNavigator from 'pages/common/components/TabNavigator/TabNavigator'
import {
    addVideo,
    linkifyWithTemplate,
    removeLink,
} from 'pages/common/draftjs/plugins/utils'
import CheckBox from 'pages/common/forms/CheckBox'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import { useCampaignFormContext } from 'pages/convert/campaigns/hooks/useCampaignFormContext'
import type { UtmConfiguration } from 'pages/convert/campaigns/types/CampaignFormConfiguration'
import { attachUtmToUrl } from 'pages/convert/campaigns/utils/attachUtmParams'
import { linkEditionEnded, linkEditionStarted } from 'state/ui/editor/actions'
import {
    focusToTheEndOfContent,
    getEntitySelectionState,
    getSelectedEntityKey,
    getSelectedText,
} from 'utils/editor'
import { linkify } from 'utils/linkify'

import type { ToolbarContextType } from '../ToolbarContext'
import { ToolbarContext, withToolbarContext } from '../ToolbarContext'
import type { ActionInjectedProps } from '../types'
import { ActionName } from '../types'
import { getTooltipTourConfiguration } from '../utils'
import AddUtm from './AddUtm'
import ToolbarButton from './Button'
import TourTooltip from './TourTooltip'

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

type FloatingPopoverProps = {
    children: React.ReactNode
    className?: string
    isOpen: boolean
    onClose: () => void
    placement?: Placement
    root?: HTMLElement | null
    target: RefObject<HTMLElement | null>
    toggleRef?: RefObject<HTMLElement | null>
}

function FloatingPopover({
    children,
    className,
    isOpen,
    onClose,
    placement = 'bottom',
    root,
    target,
    toggleRef,
}: FloatingPopoverProps) {
    const appNode = useAppNode()
    const portalRoot = root ?? appNode ?? undefined

    const { x, y, refs, strategy, context } = useFloating({
        open: isOpen,
        onOpenChange: (open) => {
            if (!open) onClose()
        },
        placement,
        middleware: [offsetMiddleware(4), flip(), shift()],
        whileElementsMounted: autoUpdate,
    })

    const dismiss = useDismiss(context, {
        outsidePress: (event) => {
            const clickTarget = event.target as Element
            const floatingEl = refs.floating.current
            const isInsideFloating = floatingEl?.contains(clickTarget) ?? false
            if (isInsideFloating) return false
            if (toggleRef?.current?.contains(clickTarget)) return false
            if (clickTarget.closest?.('[id^="floating-ui-"]')) return false
            return true
        },
    })
    const { getFloatingProps } = useInteractions([dismiss])

    const currentTarget = target.current
    useLayoutEffect(() => {
        refs.setReference(currentTarget)
    }, [currentTarget, refs])

    // The side panel (React Aria) marks all elements outside its DOM subtree as `inert`,
    // which blocks pointer/focus events on our floating portal. React Aria's ariaHideOutside
    // checks for `data-react-aria-top-layer` and keeps those elements visible/interactive.
    // We set this attribute on the portal container so React Aria treats it as a top-layer overlay.
    const setFloatingRef = useCallback(
        (node: HTMLElement | null) => {
            refs.setFloating(node)

            if (!node) return

            const portalEl = node.closest(
                '[data-floating-ui-portal]',
            ) as HTMLElement | null

            if (portalEl) {
                portalEl.setAttribute('data-react-aria-top-layer', 'true')

                if (portalEl.hasAttribute('inert')) {
                    portalEl.removeAttribute('inert')
                    portalEl.removeAttribute('data-floating-ui-inert')
                }
            }
        },
        [refs],
    )

    if (!isOpen) return null

    const floatingProps = getFloatingProps()

    return (
        <FloatingPortal root={portalRoot}>
            <FloatingFocusManager
                context={context}
                modal={false}
                initialFocus={-1}
                closeOnFocusOut={false}
            >
                <div
                    ref={setFloatingRef}
                    {...floatingProps}
                    onPointerDownCapture={(e) => {
                        ;(
                            floatingProps as Record<string, any>
                        ).onPointerDownCapture?.(e)
                    }}
                    onPointerDown={(e) => {
                        // Stop native event from reaching the side panel's dismiss handler.
                        // React 18 captures events at the root in the capture phase,
                        // so all React handlers still work normally.
                        e.nativeEvent.stopPropagation()
                    }}
                    className={className}
                    style={{
                        position: strategy,
                        left: x ?? '',
                        top: y ?? '',
                        zIndex: 2000,
                    }}
                >
                    {children}
                </div>
            </FloatingFocusManager>
        </FloatingPortal>
    )
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
    linkSelectionRect?: DOMRect
} & ActionInjectedProps &
    Pick<
        ToolbarContextType,
        'canAddVideoPlayer' | 'onInsertVideoAddedFromInsertLink'
    > &
    ConnectedProps<typeof connector>

export class AddLinkContainer extends Component<Props> {
    static contextType = ToolbarContext
    declare context: ContextType<typeof ToolbarContext>
    workflowVariables: WorkflowVariableList | undefined
    anchorRef = createRef<HTMLSpanElement>()
    buttonRef = createRef<HTMLButtonElement>()
    wrapperRef = createRef<HTMLDivElement>()

    constructor(props: Props) {
        super(props)

        this.workflowVariables = this.props.getWorkflowVariables?.()
    }

    state = {
        activeTab: tabs[0].value,
        appliedUtmQueryString: '',
        appliedUtmEnabled: false,
        anchorStyle: {} as React.CSSProperties,
    }

    componentDidUpdate(prevProps: Props) {
        const {
            isOpen,
            linkEditionEnded,
            linkEditionStarted,
            linkSelectionRect,
        } = this.props

        if (!prevProps.isOpen && isOpen) {
            linkEditionStarted()
            if (linkSelectionRect) {
                this.setState({
                    anchorStyle: {
                        position: 'fixed' as const,
                        top: linkSelectionRect.bottom,
                        left:
                            linkSelectionRect.left +
                            linkSelectionRect.width / 2,
                        width: 0,
                        height: 0,
                        pointerEvents: 'none' as const,
                    },
                })
            }
            this._focusInputWithoutScroll()
        } else if (prevProps.isOpen && !isOpen) {
            this._removeHighlight()
            this.setState({ anchorStyle: {} })
            linkEditionEnded()
        }
    }

    _focusInputWithoutScroll = () => {
        requestAnimationFrame(() => {
            const wrapper = this.wrapperRef.current
            if (!wrapper) return
            const inputs = wrapper.querySelectorAll('input')
            const targetInput = this.props.text ? inputs[1] : inputs[0]
            targetInput?.focus({ preventScroll: true })
        })
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

    _onPopoverOpen = (capturePosition = true) => {
        const editorState = this.props.getEditorState()
        const contentState = editorState.getCurrentContent()
        const selection = editorState.getSelection()
        const entityKey = this._getSelectedLinkEntityKey()

        if (entityKey) {
            this.props.setEditorState(removeLink(entityKey, editorState))
            return
        }

        if (capturePosition) {
            try {
                const nativeSelection = window.getSelection()
                if (nativeSelection && nativeSelection.rangeCount > 0) {
                    const range = nativeSelection.getRangeAt(0)
                    const rect = range.getBoundingClientRect()
                    if (rect.width > 0) {
                        this.setState({
                            anchorStyle: {
                                position: 'fixed',
                                top: rect.bottom,
                                left: rect.left + rect.width / 2,
                                width: 0,
                                height: 0,
                                pointerEvents: 'none',
                            },
                        })
                    }
                }
            } catch {
                // getBoundingClientRect may not be available in all environments
            }
        }

        this._applyHighlight(editorState)
        this.props.onTextChange(getSelectedText(contentState, selection))
        this.props.onOpen()
    }

    _applyHighlight = (editorState: EditorState) => {
        const selection = editorState.getSelection()
        if (selection.isCollapsed()) return

        const contentState = Modifier.applyInlineStyle(
            editorState.getCurrentContent(),
            selection,
            'LINK_HIGHLIGHT',
        )
        this.props.setEditorState(
            EditorState.push(editorState, contentState, 'change-inline-style'),
        )
    }

    _removeHighlight = () => {
        const editorState = this.props.getEditorState()
        const contentState = editorState.getCurrentContent()
        let newContentState = contentState

        contentState.getBlockMap().forEach((block) => {
            if (!block) return
            const blockKey = block.getKey()
            block.findStyleRanges(
                (character) => character.hasStyle('LINK_HIGHLIGHT'),
                (start, end) => {
                    const blockSelection = editorState.getSelection().merge({
                        anchorKey: blockKey,
                        anchorOffset: start,
                        focusKey: blockKey,
                        focusOffset: end,
                    }) as ReturnType<typeof editorState.getSelection>
                    newContentState = Modifier.removeInlineStyle(
                        newContentState,
                        blockSelection,
                        'LINK_HIGHLIGHT',
                    )
                },
            )
        })

        if (newContentState !== contentState) {
            this.props.setEditorState(
                EditorState.push(
                    editorState,
                    newContentState,
                    'change-inline-style',
                ),
            )
        }
    }

    _getHighlightSelection = (): SelectionState | null => {
        const editorState = this.props.getEditorState()
        const contentState = editorState.getCurrentContent()
        let anchorKey: string | null = null
        let anchorOffset = 0
        let focusKey: string | null = null
        let focusOffset = 0

        contentState.getBlockMap().forEach((block) => {
            if (!block) return
            const blockKey = block.getKey()
            block.findStyleRanges(
                (character) => character.hasStyle('LINK_HIGHLIGHT'),
                (start, end) => {
                    if (anchorKey === null) {
                        anchorKey = blockKey
                        anchorOffset = start
                    }
                    focusKey = blockKey
                    focusOffset = end
                },
            )
        })

        if (anchorKey === null || focusKey === null) return null

        return SelectionState.createEmpty(anchorKey).merge({
            anchorKey,
            anchorOffset,
            focusKey,
            focusOffset,
        }) as SelectionState
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
        const focusedSelection = editorState
            .getSelection()
            .merge({ hasFocus: true })
        this.props.setEditorState(
            EditorState.forceSelection(editorState, focusedSelection),
        )

        return editorState
    }

    _insertLink = (): EditorState | null => {
        const { url, text } = this.props
        // Use linkify to add protocol to the url
        const preParsedUrl = linkifyWithTemplate(url)
        const parsedUrl = this._updateUrlWithConfiguredUtm(preParsedUrl)

        let editorState = this.props.getEditorState()
        const selection =
            this._getHighlightSelection() ?? editorState.getSelection()

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
        const focusedSelection = editorState
            .getSelection()
            .merge({ hasFocus: true })
        editorState = EditorState.forceSelection(editorState, focusedSelection) // Focus the editor

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

        const videoSelection = newEditorState
            .getSelection()
            .merge({ hasFocus: true })
        newEditorState = EditorState.forceSelection(
            newEditorState,
            videoSelection,
        )
        setEditorState(newEditorState)

        onInsertVideoAddedFromInsertLink()
    }

    navigateToFirstTab = () => {
        this.setState({ activeTab: tabs[0].value })
    }
    onAddUtmApply = () => {
        this.navigateToFirstTab()
    }

    _handleToggle = () => {
        if (this.props.isOpen) {
            this.props.onClose()
        } else {
            this._onPopoverOpen(false)
        }
    }

    _hasAnchorPosition = () => {
        const { anchorStyle } = this.state
        return anchorStyle.top !== undefined
    }

    render() {
        const { toolbarTour } = this.context
        const tour = getTooltipTourConfiguration(ActionName.Link, toolbarTour)

        let effectiveAnchorStyle = this.state.anchorStyle
        if (
            this.props.isOpen &&
            this.props.linkSelectionRect &&
            !this._hasAnchorPosition()
        ) {
            effectiveAnchorStyle = {
                position: 'fixed' as const,
                top: this.props.linkSelectionRect.bottom,
                left:
                    this.props.linkSelectionRect.left +
                    this.props.linkSelectionRect.width / 2,
                width: 0,
                height: 0,
                pointerEvents: 'none' as const,
            }
        }
        const hasAnchor = (effectiveAnchorStyle as any).top !== undefined
        const popoverTarget = hasAnchor ? this.anchorRef : this.buttonRef
        const buttonElement = tour ? (
            <TourTooltip isOpen={!!tour.text} text={tour.text}>
                <ToolbarButton
                    ref={this.buttonRef}
                    name="Insert link"
                    isActive={false}
                    isDisabled={!!this.props.isDisabled}
                    icon="link"
                    onToggle={this._handleToggle}
                />
            </TourTooltip>
        ) : (
            <ToolbarButton
                ref={this.buttonRef}
                name="Insert link"
                isActive={false}
                isDisabled={!!this.props.isDisabled}
                icon="link"
                onToggle={this._handleToggle}
            />
        )

        return (
            <>
                {buttonElement}
                <span
                    ref={this.anchorRef}
                    style={effectiveAnchorStyle}
                    aria-hidden
                />
                <ModalContext.Consumer>
                    {(context) => (
                        <FloatingPopover
                            key={
                                hasAnchor ? 'selection-anchor' : 'button-anchor'
                            }
                            isOpen={this.props.isOpen}
                            onClose={this.props.onClose}
                            target={popoverTarget}
                            toggleRef={this.buttonRef}
                            className={css.popover}
                            root={context.ref?.current}
                            placement="bottom"
                        >
                            {this.context.canAddUtm && (
                                <>
                                    <TabNavigator
                                        activeTab={this.state.activeTab}
                                        onTabChange={(value: string) =>
                                            this.setState({
                                                activeTab: value,
                                            })
                                        }
                                        tabs={tabs}
                                    />
                                    <CampaignFormContextInterceptor
                                        appliedUtmUpdatedCallback={
                                            this._getUtmAppliedState
                                        }
                                    />
                                </>
                            )}
                            {this.state.activeTab === 'url' ||
                            !this.context.canAddUtm ? (
                                <div
                                    ref={this.wrapperRef}
                                    className={css.wrapper}
                                    onKeyDown={this._onKeyDown}
                                >
                                    <DEPRECATED_InputField
                                        className={css.field}
                                        label="Link text"
                                        placeholder="Ex. Help Center Article"
                                        onChange={this.props.onTextChange}
                                        value={this.props.text}
                                    />

                                    {this.workflowVariables ? (
                                        <>
                                            <div
                                                className={
                                                    css.variableInputField
                                                }
                                            >
                                                <Label>URL</Label>
                                                <TextInputWithVariables
                                                    variables={
                                                        this.workflowVariables
                                                    }
                                                    placeholder="https://help.domain.com"
                                                    value={this.props.url}
                                                    onChange={
                                                        this.props.onUrlChange
                                                    }
                                                />
                                            </div>
                                            <div
                                                className={
                                                    css.variableInputField
                                                }
                                            >
                                                <CheckBox
                                                    isChecked={
                                                        this.props.target ===
                                                        '_blank'
                                                    }
                                                    onChange={(nextValue) => {
                                                        this.props.onTargetChange(
                                                            nextValue
                                                                ? '_blank'
                                                                : '_self',
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
                        </FloatingPopover>
                    )}
                </ModalContext.Consumer>
            </>
        )
    }
}

const connector = connect(null, {
    linkEditionStarted,
    linkEditionEnded,
})

export default connector(withToolbarContext(AddLinkContainer))
