import type { ReactNode } from 'react'

import type { EditorState } from 'draft-js'

export enum ActionName {
    Translate = 'TRANSLATE',
    Bold = 'BOLD',
    Italic = 'ITALIC',
    Underline = 'UNDERLINE',
    Link = 'LINK',
    Image = 'IMAGE',
    Video = 'VIDEO',
    Emoji = 'EMOJI',
    ProductPicker = 'PRODUCTPICKER',
    DiscountCodePicker = 'DISCOUNTCODE',
    WorkflowVariable = 'WORKFLOWVARIABLE',
    ContactCaptureForm = 'CONTACT_CAPTURE_FORM',
    GuidanceVariable = 'GUIDANCEVARIABLE',
    GuidanceAction = 'GUIDANCEACTION',
    BulletedList = 'BULLETEDLIST',
    OrderedList = 'ORDEREDLIST',
    Heading = 'HEADING',
    FindReplace = 'FINDREPLACE',
}

export type EditorStateSetter = (editorState: EditorState) => any

export type EditorStateGetter = () => EditorState

export type ActionInjectedProps = {
    getEditorState: EditorStateGetter
    setEditorState: EditorStateSetter
    isDisabled?: boolean
}

export type Config = {
    imageDecorator?: (node: ReactNode) => ReactNode
    theme?: any
    getDisplayedActions: () => ActionName[] | null | undefined
    onLinkEdit: (
        entityKey: string,
        text: string,
        url: string,
        target: string,
    ) => void
    onLinkCreate: (text: string, selectionRect?: DOMRect) => void
}

export type TooltipTourConfigurationType = {
    tooltipContent: string
}
