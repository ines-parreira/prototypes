import React, {
    KeyboardEvent,
    RefObject,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react'
import {connect, ConnectedProps} from 'react-redux'

import {EditorState} from 'draft-js'
import ReactPlayer from 'react-player'

import {
    insertLink,
    insertText,
    canAddVideoPlayer,
    fixVideoUrlForReactPlayer,
} from 'utils'
import Button from 'pages/common/components/button/Button'
import Popover from 'pages/common/draftjs/plugins/toolbar/components/ButtonPopover'
import TextInput from 'pages/common/forms/input/TextInput'
import {UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_VIDEOS} from 'config/integrations/shopify'

import {
    logEvent,
    SegmentEvent,
} from '../../../../../../store/middlewares/segmentTracker'
import {RootState} from '../../../../../../state/types'
import {
    getNewMessageChannel,
    isNewMessagePublic,
} from '../../../../../../state/newMessage/selectors'
import {getCurrentAccountState} from '../../../../../../state/currentAccount/selectors'
import {EditorStateGetter, EditorStateSetter} from '../types'
import {addVideo} from '../../utils'
import css from './AddVideo.less'

type OwnProps = {
    getEditorState: EditorStateGetter
    setEditorState: EditorStateSetter
}

export function AddVideo({
    getEditorState,
    setEditorState,
    ticket,
    newMessageChannel,
    isNewMessagePublic,
    currentAccount,
}: ConnectedProps<typeof connector> & OwnProps) {
    const [isOpen, setOpen] = useState(false)
    const [url, setUrl] = useState('')
    const textInputRef: RefObject<HTMLInputElement> = useRef(null)

    const handlePopoverOpen = useCallback(() => {
        setOpen(true)
        logEvent(SegmentEvent.InsertVideoOpen, {
            account_id: currentAccount?.get('domain'),
            channel: newMessageChannel,
            ticket: ticket?.get('id') || 'new',
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setOpen])

    const handlePopoverClose = useCallback(() => {
        setOpen(false)
    }, [setOpen])

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

    const _addVideo = useCallback(
        () => {
            const editorState = getEditorState()

            const urlFixed = fixVideoUrlForReactPlayer(url)
            let newEditorState
            if (
                canAddVideoPlayer(newMessageChannel, isNewMessagePublic) &&
                ReactPlayer.canPlay(urlFixed)
            ) {
                newEditorState = addVideo(editorState, urlFixed)
            } else {
                if (
                    !UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_VIDEOS.includes(
                        newMessageChannel
                    )
                ) {
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

            logEvent(SegmentEvent.InsertVideoAdded, {
                account_id: currentAccount?.get('domain'),
                channel: newMessageChannel,
                ticket: ticket?.get('id') || 'new',
            })
            setOpen(false)
            setUrl('')
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            url,
            getEditorState,
            setEditorState,
            setOpen,
            newMessageChannel,
            isNewMessagePublic,
        ]
    )

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
            id="insert_video"
            name="Insert video"
            isOpen={isOpen}
            onOpen={handlePopoverOpen}
            onClose={handlePopoverClose}
            className={css.popover}
        >
            <div>
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

const connector = connect((state: RootState) => ({
    currentAccount: getCurrentAccountState(state),
    ticket: state.ticket,
    newMessageChannel: getNewMessageChannel(state),
    isNewMessagePublic: isNewMessagePublic(state),
}))
export default connector(AddVideo)
