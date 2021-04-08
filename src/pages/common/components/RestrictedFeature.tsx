import React, {ReactNode, Component} from 'react'

import {Alert} from 'reactstrap'
import Lightbox from 'react-images'

import Carousel from './../../integrations/common/Carousel.js'

type Props = {
    imagesURL: string[]
    info: string
    alertMsg: ReactNode
}

type State = {
    isLightboxOpen: boolean
    currentImage: number
}

export default class RestrictedFeature extends Component<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = {
            isLightboxOpen: false,
            currentImage: 0,
        }
    }

    _toggleLightbox = (selectedImageId?: number) => {
        this.setState({
            isLightboxOpen: !this.state.isLightboxOpen,
            currentImage: selectedImageId || 0,
        })
    }

    _gotoImage = (index: number) => {
        this.setState({currentImage: index})
    }

    render() {
        const {imagesURL, info, alertMsg} = this.props

        return (
            <div className="col mt-2">
                <Alert color="danger">{alertMsg}</Alert>
                <p>{info}</p>
                <Carousel
                    imagesUrl={imagesURL}
                    onImageClick={({index}: {index: number}) =>
                        this._toggleLightbox(index)
                    }
                />
                <Lightbox
                    images={imagesURL.map((imageURL: string) => {
                        return {
                            src: imageURL,
                        }
                    })}
                    isOpen={this.state.isLightboxOpen}
                    onClose={() => this._toggleLightbox()}
                    currentImage={this.state.currentImage}
                    onClickPrev={() =>
                        this._gotoImage(this.state.currentImage - 1)
                    }
                    onClickNext={() =>
                        this._gotoImage(this.state.currentImage + 1)
                    }
                    onClickThumbnail={this._gotoImage}
                    showThumbnails
                    backdropClosesModal
                />
            </div>
        )
    }
}
