import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import {connect} from 'react-redux'
import Lightbox from 'react-images'

import ToggleButton from '../../../../common/components/ToggleButton'
import Carousel from './../../../common/Carousel'
import IntegrationList from '../IntegrationList'
import ForwardIcon from '../ForwardIcon'
import * as integrationsActions from '../../../../../state/integrations/actions'

@connect(null, {
    activate: integrationsActions.activateIntegration,
    deactivate: integrationsActions.deactivateIntegration,
})
export default class ShopifyIntegrationList extends React.Component {
    static propTypes = {
        integrations: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
        activate: PropTypes.func.isRequired,
        deactivate: PropTypes.func.isRequired,
    }

    state = {
        isLightboxOpen: false,
        currentImage: 0,
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

        const imagesUrl = [
            `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/presentationals/shopify-carousel_1@0,25x.jpg`,
            `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/presentationals/shopify-carousel_2@0,25x.jpg`,
            `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/presentationals/shopify-carousel_3@0,25x.jpg`
        ]

        const longTypeDescription = (
            <div>
                <p>Shopify is an e-commerce platform used by 500,000+ stores.</p>

                <p>How Gorgias works with Shopify:</p>
                <ul>
                    <li>
                        See Shopify profiles, orders & shipping status next to support tickets
                    </li>
                    <li>
                        Edit orders, issue refunds, etc. directly from support conversations
                    </li>
                    <li>
                        Search customers by order number, shipping address... and match anonymous chat tickets with
                        existing Shopify customers
                    </li>
                </ul>

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

                <h4>Your Shopify stores</h4>
            </div>
        )

        const integrationToItemDisplay = (int) => {
            const toggleIntegration = (value) => {
                const integrationId = int.get('id')
                return value ? this.props.activate(integrationId) : this.props.deactivate(integrationId)
            }

            const isDisabled = int.get('deactivated_datetime')
            const editLink = `/app/settings/integrations/shopify/${int.get('id')}`

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
                integrationType="shopify"
                integrations={integrations.filter((v) => v.get('type') === 'shopify')}
                createIntegration={() => browserHistory.push('/app/settings/integrations/shopify/new')}
                createIntegrationButtonText="Add Shopify"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}
