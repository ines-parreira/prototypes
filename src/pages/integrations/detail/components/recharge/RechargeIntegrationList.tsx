import React from 'react'
import {List, Map} from 'immutable'
import {Link} from 'react-router-dom'
import {Button, Alert} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import Lightbox from 'react-images'

import {getRedirectUri} from '../../../../../state/integrations/selectors'
import {IntegrationType} from '../../../../../models/integration/types'
import {RootState} from '../../../../../state/types'

import history from '../../../../history'
import Carousel from '../../../common/Carousel'
import IntegrationList from '../IntegrationList'
import ForwardIcon from '../ForwardIcon'

type Props = {
    integrations: List<Map<any, any>>
    shopifyIntegrations: List<any>
    loading: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    isLightboxOpen: boolean
    currentImage: number
}

export class RechargeIntegrationList extends React.Component<Props, State> {
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
            (v) => v!.get('type') === IntegrationType.Recharge
        ) as List<Map<any, any>>

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

                <h4>Your Recharge stores</h4>
            </div>
        )

        const integrationToItemDisplay = (int: Map<any, any>) => {
            const editLink = `/app/settings/integrations/recharge/${
                int.get('id') as number
            }`
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
                integrationType={IntegrationType.Recharge}
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

const connector = connect((state: RootState) => {
    return {
        redirectUri: getRedirectUri(IntegrationType.Recharge)(state),
    }
})

export default connector(RechargeIntegrationList)
