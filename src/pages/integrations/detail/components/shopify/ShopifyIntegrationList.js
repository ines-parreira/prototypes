import React from 'react'
import PropTypes from 'prop-types'
import {Link} from 'react-router-dom'
import Lightbox from 'react-images'

import classnames from 'classnames'
import {Button} from 'reactstrap'

import IntegrationList from '../IntegrationList.tsx'
import ForwardIcon from '../ForwardIcon.tsx'
import history from '../../../../history.ts'

import Carousel from './../../../common/Carousel'

export default class ShopifyIntegrationList extends React.Component {
    static propTypes = {
        integrations: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
        redirectUri: PropTypes.string.isRequired,
        activate: PropTypes.func.isRequired,
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
            `${
                window.GORGIAS_ASSETS_URL || ''
            }/static/private/img/presentationals/shopify-carousel_1@0,25x.jpg`,
            `${
                window.GORGIAS_ASSETS_URL || ''
            }/static/private/img/presentationals/shopify-carousel_2@0,25x.jpg`,
            `${
                window.GORGIAS_ASSETS_URL || ''
            }/static/private/img/presentationals/shopify-carousel_3@0,25x.jpg`,
        ]

        const longTypeDescription = (
            <div>
                <p>
                    Shopify is an e-commerce platform used by 500,000+ stores.
                </p>

                <p>How Gorgias works with Shopify:</p>
                <ul>
                    <li>
                        See Shopify profiles, orders & shipping status next to
                        support tickets
                    </li>
                    <li>
                        Edit orders, issue refunds, etc. directly from support
                        conversations
                    </li>
                    <li>
                        Search customers by order number, shipping address...
                        and match anonymous chat tickets with existing Shopify
                        customers
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

                <h4>Your Shopify stores</h4>
            </div>
        )
        const isSubmitting = loading.get('updateIntegration')

        const integrationToItemDisplay = (integration) => {
            const active = !integration.get('deactivated_datetime')
            const isRowSubmitting = isSubmitting === integration.get('id')
            const editLink = `/app/settings/integrations/shopify/${integration.get(
                'id'
            )}`
            const activateIntegration = () => {
                const IntegrationName = integration.get('name')
                window.location.href = this.props.redirectUri.replace(
                    '{shop_name}',
                    IntegrationName
                )
            }
            return (
                <tr key={integration.get('id')}>
                    <td className="link-full-td">
                        <Link to={editLink}>
                            <div>
                                <b>{integration.get('name')}</b>
                            </div>
                        </Link>
                    </td>
                    <td className="smallest align-middle p-0">
                        <div>
                            {!active && (
                                <Button
                                    tag="a"
                                    color="success"
                                    onClick={activateIntegration}
                                    className={classnames({
                                        'btn-loading': isRowSubmitting,
                                    })}
                                >
                                    Reactivate
                                </Button>
                            )}
                        </div>
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
                integrations={integrations.filter(
                    (v) => v.get('type') === 'shopify'
                )}
                createIntegration={() =>
                    history.push('/app/settings/integrations/shopify/new')
                }
                createIntegrationButtonContent="Add Shopify"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}
