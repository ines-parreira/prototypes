import React, {
    KeyboardEvent,
    RefObject,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react'
import {EditorState} from 'draft-js'
import ReactPlayer from 'react-player'

import {fixVideoUrlForReactPlayer, insertLink, insertText} from 'utils'
import Button from 'pages/common/components/button/Button'
import Popover from 'pages/common/draftjs/plugins/toolbar/components/ButtonPopover'
import TextInput from 'pages/common/forms/input/TextInput'

import {ActionInjectedProps} from '../types'
import {useToolbarContext} from '../ToolbarContext'
import {addVideo} from '../../utils'

import css from './AddVideo.less'

type Props = ActionInjectedProps

const AddVideo = ({getEditorState, setEditorState}: Props) => {
    const {
        canAddVideoPlayer,
        canAddVideoLink,
        onInsertVideoOpen,
        onInsertVideoAdded,
    } = useToolbarContext()
    const [isOpen, setOpen] = useState(false)
    const [url, setUrl] = useState('')
    const textInputRef: RefObject<HTMLInputElement> = useRef(null)

    const handlePopoverOpen = useCallback(() => {
        setOpen(true)

        onInsertVideoOpen()
    }, [onInsertVideoOpen])

    const handlePopoverClose = useCallback(() => {
        setOpen(false)
    }, [])

    const isValidUrl = useMemo(() => {
        let _url
        try {
            _url = new URL(url)
        } catch (_) {
            return false
        }
        return _url.protocol === 'http:' || _url.protocol === 'https:'
    }, [url])

    const reactPlayerCanPlay = useMemo(() => {
        return ReactPlayer.canPlay(url)
    }, [url])

    const _addVideo = useCallback(() => {
        const editorState = getEditorState()

        const urlFixed = fixVideoUrlForReactPlayer(url)
        let newEditorState
        if (canAddVideoPlayer && ReactPlayer.canPlay(urlFixed)) {
            newEditorState = addVideo(editorState, urlFixed)
        } else {
            if (canAddVideoLink) {
                newEditorState = insertLink(editorState, url)
            } else {
                newEditorState = insertText(editorState, url)
            }
        }

        newEditorState = EditorState.forceSelection(
            newEditorState,
            newEditorState.getSelection()
        )
        setEditorState(newEditorState)

        onInsertVideoAdded()
        setOpen(false)
        setUrl('')
    }, [
        url,
        getEditorState,
        setEditorState,
        canAddVideoPlayer,
        canAddVideoLink,
        onInsertVideoAdded,
    ])

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()

            if (isValidUrl) {
                _addVideo()
            }
        }

        if (e.key === 'Escape') {
            e.preventDefault()
            setOpen(false)
        }
    }

    return (
        <Popover
            icon="video_library"
            name="Insert video"
            isOpen={isOpen}
            onOpen={handlePopoverOpen}
            onClose={handlePopoverClose}
            className={css.popover}
        >
            <div className={css.container}>
                <h4 className={css.title}>Video URL</h4>
                <div className={css.inputDiv}>
                    <TextInput
                        className={css.input}
                        hasError={!reactPlayerCanPlay}
                        ref={textInputRef}
                        placeholder="External video URL"
                        onChange={setUrl}
                        value={url}
                        onKeyDown={onKeyDown}
                        autoFocus
                    />
                    {isValidUrl && !reactPlayerCanPlay && (
                        <p className={css.unsupportedWarning}>
                            This provider is not supported or link is not valid.
                        </p>
                    )}
                </div>
                <div className={css.buttons}>
                    <Button isDisabled={!isValidUrl} onClick={_addVideo}>
                        Insert Video
                    </Button>
                    <Button
                        className="ml-2"
                        intent="secondary"
                        onClick={handlePopoverClose}
                    >
                        Cancel
                    </Button>
                    <a
                        className={css.helpLink}
                        href="https://docs.gorgias.com/en-US/gorgias-chat---video-171049"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        See supported providers
                    </a>
                </div>
            </div>
        </Popover>
    )
}

export default AddVideo
