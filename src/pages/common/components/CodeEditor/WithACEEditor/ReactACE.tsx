import React, {useEffect, useRef, useState} from 'react'

import withACEEditor from './withACEEditor'
import {EditorProps} from './types'

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

const acceptedErrors = [
    'Unexpected end of file in the tag name.',
    'Expected closing tag.',
]

const ReactAce = ({
    ace,
    name,
    width,
    height,
    value,
    ...props
}: EditorProps & {ace: any}) => {
    const editorRef = useRef<HTMLDivElement>(null)
    const [editor, setEditor] = useState<any | null>(null)

    // Init the editor object
    useEffect(() => {
        if (editorRef && editorRef.current) {
            setEditor(ace.edit(editorRef.current))
        }
    }, [ace, editorRef])

    // Apply the props to the editor object
    useEffect(() => {
        if (!editor) {
            return
        }
        const {
            mode = '',
            theme = '',
            fontSize = 12,
            defaultValue = '',
            cursorStart = 1,
            showGutter = true,
            wrapEnabled = false,
            showPrintMargin = true,
            showLineNumbers = true,
            tabSize = 2,
            onBeforeLoad,
        } = props

        if (onBeforeLoad) {
            onBeforeLoad(ace)
        }

        props.editorProps &&
            Object.keys(props.editorProps).forEach((editorPropKey) => {
                editor[editorPropKey] = props.editorProps[editorPropKey]
            })

        const session = editor.getSession()

        mode && session.setMode(`ace/mode/${mode}`)
        theme && editor.setTheme(`ace/theme/${theme}`)
        fontSize && editor.setFontSize(fontSize)
        editor.setValue(
            defaultValue === undefined ? value : defaultValue,
            cursorStart
        )
        editor.renderer.setShowGutter(showGutter)
        editor.$blockScrolling = Infinity
        session.setUseWrapMode(wrapEnabled)

        // Enable only errors for closing tags
        session.on('changeAnnotation', () => {
            session.$annotations = session.$annotations?.filter(
                (annotation: any) =>
                    acceptedErrors.reduce(
                        (acc, cur) =>
                            acc ||
                            (annotation.type === 'error' &&
                                new RegExp(cur, 'gi').test(annotation.text)),
                        false
                    )
            )
            editor.$onChangeAnnotation()
        })
        editor.setShowPrintMargin(showPrintMargin)
        editor.on('focus', (event: Event) => {
            if (props.onFocus) {
                props.onFocus(event)
            }
        })
        editor.on('blur', (event: Event) => {
            if (props.onBlur) {
                props.onBlur(event)
            }
        })
        editor.on('copy', (text: string) => {
            if (props.onCopy) {
                props.onCopy(text)
            }
        })
        editor.on('paste', (text: string) => {
            if (props.onPaste) {
                props.onPaste(text)
            }
        })
        editor.on('change', onChange)
        editor.session.on('changeScrollTop', () => {
            if (props.onScroll) {
                props.onScroll(editor)
            }
        })
        editor.setOption('showLineNumbers', showLineNumbers)
        editor.setOption('tabSize', tabSize)

        if (props.focus) {
            editor.focus()
        }

        if (props.onLoad) {
            props.onLoad(editor)
        }
    }, [editor])

    // Handle the value changes
    useEffect(() => {
        if (editor && editor.getValue() !== value && value !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            editor.on('change', () => {})
            editor.setValue(value)
            editor.on('change', onChange)
        }
    }, [editor, value])

    const onChange = () => {
        if (props.onChange) {
            const value = editor.getValue()
            props.onChange(value)
        }
    }

    return <div ref={editorRef} id={name} style={{width, height}}></div>
}

export default withACEEditor(ReactAce)
