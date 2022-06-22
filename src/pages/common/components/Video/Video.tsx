import React from 'react'
import classnames from 'classnames'

import DEPRECATED_Modal from '../DEPRECATED_Modal'

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
                <DEPRECATED_Modal
                    isOpen={isOpen}
                    onClose={this._toggleModal}
                    className={css.modal}
                    bodyClassName={css.modalBody}
                    header={legend}
                    dismissible
                >
                    <iframe
                        className={css.iframe}
                        title="rule-video"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                        frameBorder="0"
                        allowFullScreen
                    />
                </DEPRECATED_Modal>
            </div>
        )
    }
}
