import React from 'react'
import classnames from 'classnames'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './Video.less'

type Props = {
    videoId: string
    videoPreviewIndex?: string
    legend: string
}

type State = {
    isOpen: boolean
}

export default class Video extends React.Component<Props, State> {
    state = {
        isOpen: false,
    }

    _toggleModal = () => {
        this.setState({
            isOpen: !this.state.isOpen,
        })
    }

    render() {
        const {videoId, videoPreviewIndex, legend} = this.props
        const {isOpen} = this.state

        const previewIndex = videoPreviewIndex || 0

        return (
            <div>
                <div className={css.preview} onClick={this._toggleModal}>
                    <div className={css.screenshot}>
                        <img
                            alt="video preview"
                            src={`https://img.youtube.com/vi/${videoId}/${previewIndex}.jpg`}
                        />
                        <i
                            className={classnames(
                                'material-icons',
                                css.playIcon
                            )}
                        >
                            play_circle_filled_white
                        </i>
                        <div className={css.iconBackground} />
                    </div>
                    <div className={css.title}>{legend}</div>
                </div>
                <Modal isOpen={isOpen} onClose={this._toggleModal} size="huge">
                    <ModalHeader title={legend} />
                    <ModalBody className={css.modalBody}>
                        <iframe
                            className={css.iframe}
                            title="rule-video"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            frameBorder="0"
                            allowFullScreen
                        />
                    </ModalBody>
                </Modal>
            </div>
        )
    }
}
