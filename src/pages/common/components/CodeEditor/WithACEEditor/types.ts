export type WindowWithACE = Window & typeof globalThis & {ace: any}

export type EditorProps = {
    mode?: string
    focus?: boolean
    theme?: string
    name?: string
    className?: string
    height?: string
    width?: string
    fontSize?: number | string
    showGutter?: boolean
    onChange?: (value: string, event?: any) => void
    onCopy?: (value: string) => void
    onPaste?: (value: string) => void
    onFocus?: (event: any, editor?: any) => void
    onBlur?: (event: any, editor?: any) => void
    onScroll?: (editor: any) => void
    value?: string
    defaultValue?: string
    onLoad?: (editor: any) => void
    onBeforeLoad?: (ace: any) => void
    minLines?: number
    maxLines?: number
    readOnly?: boolean
    highlightActiveLine?: boolean
    tabSize?: number
    showPrintMargin?: boolean
    showLineNumbers?: boolean
    cursorStart?: number
    editorProps?: any
    setOptions?: any
    annotations?: any[]
    markers?: any[]
    keyboardHandler?: string
    wrapEnabled?: boolean
    commands?: any[]
}
