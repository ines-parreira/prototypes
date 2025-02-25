import React, { useState } from 'react'

import arrow from 'assets/img/icons/arrow.svg'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './Video.less'

type Props = {
    videoURL?: string
    previewURL?: string
    youtubeId?: string
    youtubePreviewIndex?: string
    legend: string
}

export default function Video({
    videoURL,
    previewURL,
    youtubeId = '',
    youtubePreviewIndex = '0',
    legend,
}: Props) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleIsOpen = () => setIsOpen((prev) => !prev)

    if (!videoURL && !youtubeId) {
        return null
    }

    const url =
        videoURL || `https://www.youtube.com/embed/${youtubeId}?autoplay=1`
    const preview =
        previewURL ||
        `https://img.youtube.com/vi/${youtubeId}/${youtubePreviewIndex}.jpg`

    return (
        <>
            <div className={css.preview} onClick={toggleIsOpen}>
                <div className={css.screenshotWrapper}>
                    <div className={css.screenshot}>
                        <img alt="video preview" src={preview} />
                        <div className={css.playIcon}>
                            <img src={arrow} alt="play" width="11" />
                        </div>
                    </div>
                </div>
                <div className={css.title}>{legend}</div>
            </div>
            <Modal isOpen={isOpen} onClose={toggleIsOpen} size="huge">
                <ModalHeader title={legend} />
                <ModalBody className={css.modalBody}>
                    {isOpen && (
                        <iframe
                            className={css.iframe}
                            title={legend}
                            src={url}
                            allowFullScreen
                            allow="autoplay"
                        />
                    )}
                </ModalBody>
            </Modal>
        </>
    )
}
