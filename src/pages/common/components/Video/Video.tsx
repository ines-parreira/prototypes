import React from 'react'

import {useToggle} from 'react-use'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import arrow from 'assets/img/icons/arrow.svg'

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
                <div>
                    <div className={css.screenshotWrapper}>
                        <div className={css.screenshot}>
                            <img
                                alt="video preview"
                                src={`https://img.youtube.com/vi/${videoId}/${previewIndex}.jpg`}
                            />
                            <div className={css.playIcon}>
                                <img src={arrow} alt="play" width="11" />
                            </div>
                        </div>
                    </div>
                    <div className={css.title}>{legend}</div>
                </div>
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
