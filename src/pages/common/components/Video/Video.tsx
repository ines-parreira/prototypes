import React from 'react'
import classnames from 'classnames'

import {useToggle} from 'react-use'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './Video.less'

type Props = {
    videoId: string
    videoPreviewIndex?: string
    legend: string
}

export default function Video({videoId, videoPreviewIndex, legend}: Props) {
    const [isOpen, toggleIsOpen] = useToggle(false)

    const previewIndex = videoPreviewIndex || 0

    return (
        <div>
            <div className={css.preview} onClick={toggleIsOpen}>
                <div className={css.screenshot}>
                    <img
                        alt="video preview"
                        src={`https://img.youtube.com/vi/${videoId}/${previewIndex}.jpg`}
                    />
                    <i className={classnames('material-icons', css.playIcon)}>
                        play_circle_filled_white
                    </i>
                    <div className={css.iconBackground} />
                </div>
                <div className={css.title}>{legend}</div>
            </div>
            <Modal isOpen={isOpen} onClose={toggleIsOpen} size="huge">
                <ModalHeader title={legend} />
                <ModalBody className={css.modalBody}>
                    {isOpen && (
                        <iframe
                            className={css.iframe}
                            title="rule-video"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            frameBorder="0"
                            allowFullScreen
                            allow="autoplay"
                        />
                    )}
                </ModalBody>
            </Modal>
        </div>
    )
}
