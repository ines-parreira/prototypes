import React, {useState} from 'react'
import {Button} from 'reactstrap'
import {EditorState} from 'draft-js'

import InputField from '../../../../../../common/forms/InputField.js'
import {isUrl} from '../../../../../../../utils'
import {addVideo, getSrc} from '../utils'

import {HelpCenterEditorToolbarPopoverButton} from './HelpCenterEditorToolbarPopoverButton'

type Props = {
    onChange: (editorState: EditorState) => void
    editorState: EditorState
}
export const CustomVideoButton = ({
    onChange,
    editorState,
}: Props): JSX.Element => {
    const [expanded, setExpanded] = useState(false)
    const [src, setSrc] = useState('')
    const [width, setWidth] = useState(500)
    const [height, setHeight] = useState(281)

    const isDisabledButton = !src || !isUrl(src)

    const addUrl = () => {
        const embeddedSrc = getSrc({src}) || ''
        onChange(addVideo(editorState, {src: embeddedSrc, width, height}))
        setExpanded(false)
        setSrc('')
    }
    return (
        <HelpCenterEditorToolbarPopoverButton
            icon="movie"
            tooltip="Video"
            isOpen={expanded}
            onOpen={() => setExpanded(true)}
            onClose={() => setExpanded(false)}
        >
            <>
                <InputField
                    label="URL"
                    placeholder="https://www.youtube.com/watch?v=0tg499ofPQ4"
                    onChange={(newValue: string) => setSrc(newValue)}
                    value={src}
                    autoFocus={src}
                />
                <InputField
                    label="Width"
                    placeholder="500"
                    onChange={(newValue: number) => setWidth(newValue)}
                    value={width}
                />
                <InputField
                    label="Height"
                    placeholder="281"
                    onChange={(newValue: number) => setHeight(newValue)}
                    value={height}
                />
                <Button
                    color="primary"
                    disabled={isDisabledButton}
                    onClick={addUrl}
                >
                    Insert Link
                </Button>
            </>
        </HelpCenterEditorToolbarPopoverButton>
    )
}
