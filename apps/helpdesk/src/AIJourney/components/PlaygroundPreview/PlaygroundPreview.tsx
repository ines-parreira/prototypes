import { useEffect, useRef } from 'react'

import { highlightFakeLinks } from 'AIJourney/utils/highlightFakeLinks/highlightFakeLinks'

import { GeneratingMessage } from '../GeneratingMessage/GeneratingMessage'
import { PlaygroundPreviewHeader } from '../PlaygroundPreviewHeader/PlaygroundPreviewHeader'

import css from './PlaygroundPreview.less'

type PlaygroundPreviewProps = {
    content?: string[]
    isGeneratingMessages: boolean
}

export const PlaygroundPreview = ({
    content,
    isGeneratingMessages = false,
}: PlaygroundPreviewProps) => {
    const previewBodyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (previewBodyRef.current) {
            previewBodyRef.current.scrollTop =
                previewBodyRef.current.scrollHeight
        }
    }, [content])

    return (
        <div className={css.previewContainer}>
            <PlaygroundPreviewHeader />
            <div className={css.previewBody} ref={previewBodyRef}>
                {!isGeneratingMessages &&
                    (!content || content.length === 0) && (
                        <div className={css.messageBubble}>
                            <i
                                className="material-icons-outlined"
                                style={{ marginRight: '6px' }}
                            >
                                auto_awesome
                            </i>
                            AI agent ready to preview messages
                        </div>
                    )}
                {content?.map((message, index) => (
                    <div className={css.followUpMessage} key={index}>
                        <span>
                            {index === 0
                                ? 'Today'
                                : `${index * 24} hours later`}
                        </span>
                        <div className={css.messageBubble}>
                            {highlightFakeLinks(message, css.fakeLink)}
                        </div>
                    </div>
                ))}
                {isGeneratingMessages && <GeneratingMessage />}
            </div>
        </div>
    )
}
