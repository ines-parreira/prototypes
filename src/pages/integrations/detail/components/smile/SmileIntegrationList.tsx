import React, {Component} from 'react'
import {List, Map} from 'immutable'
import {Link} from 'react-router-dom'
import Lightbox from 'react-images'

import Button from 'pages/common/components/button/Button'
import {IntegrationType} from '../../../../../models/integration/types'
import Carousel from '../../../common/Carousel'
import IntegrationList from '../IntegrationList'
import ForwardIcon from '../ForwardIcon'

type Props = {
    integrations: List<Map<any, any>>
    redirectUri: string
    loading: Map<any, any>
}

type State = {
    isLightboxOpen: boolean
    currentImage: number
}

export default class SmileIntegrationList extends Component<Props, State> {
    state: State = {
        isLightboxOpen: false,
        currentImage: 0,
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

    _onLogin = () => {
        window.location.href = this.props.redirectUri
    }

    render() {
        const {integrations, loading, redirectUri} = this.props
        const smileIntegrations = integrations.filter(
            (v) => v!.get('type') === IntegrationType.Smile
        ) as List<Map<any, any>>
        const imagesUrl = [
            `${
                window.GORGIAS_ASSETS_URL || ''
            }/static/private/js/assets/img/presentationals/smile-carousel_1.jpg`,
            `${
                window.GORGIAS_ASSETS_URL || ''
            }/static/private/js/assets/img/presentationals/smile-carousel_2.jpg`,
        ]

        const longTypeDescription = (
            <div>
                <p>Smile is a reward program app for online businesses.</p>

                <p>Here's what you can do with the Smile integration:</p>
                <ul>
                    <li>Display Smile customer profile next to tickets</li>
                    <li>Insert point balance of referral url in macros</li>
                    <li>Triage tickets based on VIP tier</li>
                </ul>

                <p>
                    For each customer, the following Smile data is available in
                    Gorgias: point balance, referral url, VIP tier, state.
                </p>

                <Carousel
                    imagesUrl={imagesUrl}
                    // $TsFixMe remove type when Carousel is migrated
                    onImageClick={({index}: {index: number}) =>
                        this._toggleLightbox(index)
                    }
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

                <h4>Your Smile integrations</h4>
            </div>
        )

        const integrationToItemDisplay = (integration: Map<any, any>) => {
            const editLink = `/app/settings/integrations/smile/${
                integration.get('id') as number
            }`
            const isSubmitting = loading.get('updateIntegration')
            const isDisabled = integration.get('deactivated_datetime')
            return (
                <tr key={integration.get('id')}>
                    <td className="link-full-td">
                        <Link to={editLink}>
                            <div>
                                <b>{integration.get('name')}</b>
                            </div>
                        </Link>
                    </td>
                    {isDisabled ? (
                        <td className="smallest align-middle">
                            <a
                                href={isSubmitting ? '#' : redirectUri}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button isDisabled={isSubmitting}>
                                    Reconnect
                                </Button>
                            </a>
                        </td>
                    ) : null}
                    <td className="smallest align-middle">
                        <ForwardIcon href={editLink} />
                    </td>
                </tr>
            )
        }

        return (
            <IntegrationList
                longTypeDescription={longTypeDescription}
                integrationType={IntegrationType.Smile}
                integrations={smileIntegrations}
                createIntegration={this._onLogin}
                createIntegrationButtonContent="Add Smile account"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}
