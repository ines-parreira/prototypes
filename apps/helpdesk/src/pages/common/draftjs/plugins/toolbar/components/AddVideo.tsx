import type { KeyboardEvent, RefObject } from 'react'
import React, { useCallback, useMemo, useRef, useState } from 'react'

import { EditorState } from 'draft-js'
import ReactPlayer from 'react-player'

import { LegacyButton as Button } from '@gorgias/axiom'

import Popover from 'pages/common/draftjs/plugins/toolbar/components/ButtonPopover'
import TextInput from 'pages/common/forms/input/TextInput'
import { fixVideoUrlForReactPlayer, insertLink, insertText } from 'utils'

import { addVideo } from '../../utils'
import { useToolbarContext } from '../ToolbarContext'
import type { ActionInjectedProps } from '../types'

import css from './AddVideo.less'

type Props = ActionInjectedProps

const AddVideo = ({ getEditorState, setEditorState, isDisabled }: Props) => {
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
        } catch {
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

        const selection = newEditorState
            .getSelection()
            .merge({ hasFocus: true })
        newEditorState = EditorState.forceSelection(newEditorState, selection)
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
            isDisabled={isDisabled}
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
