import React, {
    KeyboardEvent,
    RefObject,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react'
import {connect, ConnectedProps} from 'react-redux'

import Button from 'pages/common/components/button/Button'
import Popover from 'pages/common/draftjs/plugins/toolbar/components/ButtonPopover'

import TextInput from 'pages/common/forms/input/TextInput'

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

    const addVideo = useCallback(
        () => {
            // TODO. Implement me.

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
                addVideo()
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
                <TextInput
                    className={css.input}
                    ref={textInputRef}
                    placeholder="External video URL"
                    onChange={setUrl}
                    value={url}
                    onKeyDown={onKeyDown}
                    autoFocus
                />
                <div className={css.buttons}>
                    <Button isDisabled={!isValidUrl} onClick={addVideo}>
                        Insert Video
                    </Button>
                    <Button
                        className="ml-2"
                        intent="secondary"
                        onClick={handlePopoverClose}
                    >
                        Cancel
                    </Button>
                    <a className={css.helpLink} href="#">
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
