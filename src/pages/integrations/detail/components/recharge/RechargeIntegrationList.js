// @flow
import React from 'react'
import type {List} from 'immutable'
import {Link} from 'react-router-dom'
import {Button, Alert} from 'reactstrap'
import {connect} from 'react-redux'
import Lightbox from 'react-images'

import IntegrationList from '../IntegrationList'
import ForwardIcon from '../ForwardIcon.tsx'
import * as integrationsActions from '../../../../../state/integrations/actions.ts'
import * as integrationsSelectors from '../../../../../state/integrations/selectors.ts'
import history from '../../../../history.ts'

import Carousel from './../../../common/Carousel'

type Props = {
    integrations: List,
    shopifyIntegrations: List,
    loading: Object,

    activate: typeof integrationsActions.activateIntegration,

    redirectUri: string,
}

type State = {
    isLightboxOpen: boolean,
    currentImage: number,
}

@connect(
    (state) => {
        return {
            redirectUri: integrationsSelectors.getRedirectUri('recharge')(
                state
            ),
        }
    },
    {
        activate: integrationsActions.activateIntegration,
    }
)
export default class RechargeIntegrationList extends React.Component<
    Props,
    State
> {
    state = {
        isLightboxOpen: false,
        currentImage: 0,
    }

    _shouldHideCreateButton = () => {
        return !this.props.shopifyIntegrations.size
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
        const {integrations, loading, redirectUri} = this.props
        const rechargeIntegrations = integrations.filter(
            (v) => v.get('type') === 'recharge'
        )

        const imagesUrl = [
            `${
                window.GORGIAS_ASSETS_URL || ''
            }/static/private/img/presentationals/recharge-carousel_1.jpg`,
            `${
                window.GORGIAS_ASSETS_URL || ''
            }/static/private/img/presentationals/recharge-carousel_2.jpg`,
        ]

        const longTypeDescription = (
            <div>
                {this._shouldHideCreateButton() &&
                    (!rechargeIntegrations.size ? (
                        <Alert color="danger">
                            You need to have at least one Shopify integration to
                            add Recharge integrations.
                        </Alert>
                    ) : (
                        <Alert color="info">
                            All your Shopify integrations have a Recharge
                            integration connected.
                        </Alert>
                    ))}

                <p>Recharge is a recurring payment app for Shopify.</p>

                <p>How Gorgias works with Recharge:</p>
                <ul>
                    <li>
                        Display Recharge subscriptions next to support tickets
                    </li>
                    <li>Edit subscriptions in one click</li>
                    <li>
                        When a customer asks to edit their subscription, send
                        them an auto-response with the link to manage the
                        subscription
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

                <h4>Your Recharge stores</h4>
            </div>
        )

        const integrationToItemDisplay = (int) => {
            const editLink = `/app/settings/integrations/recharge/${int.get(
                'id'
            )}`
            const shopifyShopName = int.getIn(['meta', 'store_name'])
            const reactivateUrl = redirectUri
                .concat('?store_name=')
                .concat(shopifyShopName)
            const isDisabled = int.get('deactivated_datetime')
            const isSubmitting = loading.get('updateIntegration')
            return (
                <tr key={int.get('id')}>
                    <td className="link-full-td">
                        <Link to={editLink}>
                            <div>
                                <b>{int.get('name')}</b>
                            </div>
                        </Link>
                    </td>
                    {isDisabled ? (
                        <td className="smallest align-middle">
                            <Button
                                color="success"
                                href={reactivateUrl}
                                disabled={isSubmitting}
                            >
                                Reconnect
                            </Button>
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
                integrationType="recharge"
                integrations={rechargeIntegrations}
                createIntegration={() =>
                    history.push('/app/settings/integrations/recharge/new')
                }
                createIntegrationButtonContent="Add Recharge"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
                createIntegrationButtonHidden={this._shouldHideCreateButton()}
            />
        )
    }
}
