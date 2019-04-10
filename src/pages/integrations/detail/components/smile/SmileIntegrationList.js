import React from 'react'
import {List} from 'immutable'
import {Link, browserHistory} from 'react-router'
import {connect} from 'react-redux'
import Lightbox from 'react-images'

import {
    Alert
} from 'reactstrap'

import ToggleButton from '../../../../common/components/ToggleButton'
import IntegrationList from '../IntegrationList'
import ForwardIcon from '../ForwardIcon'
import * as integrationsActions from '../../../../../state/integrations/actions'

import Carousel from './../../../common/Carousel'



type Props = {
    integrations: List,
    shopifyIntegrations: List,

    loading: Object,
    activate: typeof integrationsActions.activateIntegration,
    deactivate: typeof integrationsActions.deactivateIntegration,
}

type State = {
    isLightboxOpen: boolean,
    currentImage: Number,
}

@connect(null, {
    activate: integrationsActions.activateIntegration,
    deactivate: integrationsActions.deactivateIntegration,
})
export default class SmileIntegrationList extends React.Component<Props, State> {

    state = {
        isLightboxOpen: false,
        currentImage: 0,
    }

    _shouldHideCreateButton = () => {
        return !this.props.shopifyIntegrations.size
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
        const {integrations, loading} = this.props
        const smileIntegrations = integrations.filter((v) => v.get('type') === 'smile')

        const imagesUrl = [
            `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/presentationals/smile-carousel_1.jpg`,
            `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/presentationals/smile-carousel_2.jpg`
        ]

        const longTypeDescription = (
            <div>
                {
                    this._shouldHideCreateButton() && (!smileIntegrations.size ? (
                        <Alert color="danger">
                            You need to have at least one Shopify integration to add Smile integrations.
                        </Alert>
                    ) : (
                        <Alert color="info">
                                All your Shopify integrations have a Smile integration connected.
                        </Alert>
                    )
                    )
                }

                <p>Smile is a reward program app for online businesses.</p>

                <p>Here's what you can do with the Smile integration:</p>
                <ul>
                    <li>Display Smile customer profile next to tickets</li>
                    <li>Insert point balance of referral url in macros</li>
                    <li>Triage tickets based on VIP tier</li>
                </ul>

                <p>For each customer, the following Smile data is available in Gorgias: point balance, referral url, VIP tier, state.</p>

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

                <h4>Your Smile integrations</h4>
            </div>
        )

        const integrationToItemDisplay = (int) => {
            const toggleIntegration = (value) => {
                const integrationId = int.get('id')
                return value ? this.props.activate(integrationId) : this.props.deactivate(integrationId)
            }

            const isDisabled = int.get('deactivated_datetime')
            const editLink = `/app/settings/integrations/smile/${int.get('id')}`

            return (
                <tr key={int.get('id')}>
                    <td className="link-full-td">
                        <Link to={editLink}>
                            <div>
                                <b>{int.get('name')}</b>
                            </div>
                        </Link>
                    </td>
                    <td className="smallest align-middle">
                        <ToggleButton
                            value={!isDisabled}
                            onChange={toggleIntegration}
                        />
                    </td>
                    <td className="smallest align-middle">
                        <ForwardIcon href={editLink} />
                    </td>
                </tr>
            )
        }

        return (
            <IntegrationList
                longTypeDescription={longTypeDescription}
                integrationType="smile"
                integrations={smileIntegrations}
                createIntegration={() => browserHistory.push('/app/settings/integrations/smile/new')}
                createIntegrationButtonContent="Add Smile"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
                createIntegrationButtonHidden={this._shouldHideCreateButton()}
            />
        )
    }
}
