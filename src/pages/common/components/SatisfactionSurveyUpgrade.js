import React from 'react'

import {Alert} from 'reactstrap'
import Lightbox from 'react-images'
import {Link} from 'react-router'

import Carousel from './../../integrations/common/Carousel'


export default class SatisfactionSurveyUpgrade extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isLightboxOpen: false,
            currentImage: 0,
        }
    }

    _toggleLightbox = (selectedImageId) => {
        this.setState({
            isLightboxOpen: !this.state.isLightboxOpen,
            currentImage: selectedImageId || 0,
        })
    }

    _gotoImage = (index) => {
        this.setState({currentImage: index})
    }

    render() {
        const imagesUrl = [
            `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/presentationals/satisfaction-survey-stats.png`,
            `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/presentationals/satisfaction-survey-ticket-details.png`
        ]

        return <div className="col mt-2">
            <Alert color="danger">
                This feature is only available for Pro and above plans.{' '}
                <Link to="/app/settings/billing/plans">Upgrade here.</Link>
            </Alert>

            <p>
                Keep track of the performance of your support team by sending a satisfaction survey after a ticket is
                closed.
            </p>

            <Carousel
                imagesUrl={imagesUrl}
                onImageClick={({index}) => this._toggleLightbox(index)}
            />

            <Lightbox
                images={imagesUrl.map((imageUrl) => {
                    return {
                        src: imageUrl,
                    }
                })}
                isOpen={this.state.isLightboxOpen}
                onClose={() => this._toggleLightbox()}
                currentImage={this.state.currentImage}
                onClickPrev={() => this._gotoImage(this.state.currentImage - 1)}
                onClickNext={() => this._gotoImage(this.state.currentImage + 1)}
                onClickThumbnail={this._gotoImage}
                showThumbnails
                backdropClosesModal
            />
        </div>
    }
}
