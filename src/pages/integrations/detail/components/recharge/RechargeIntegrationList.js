import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import {connect} from 'react-redux'
import Lightbox from 'react-images'

import ToggleButton from '../../../../common/components/ToggleButton'
import Carousel from './../../../common/Carousel'
import IntegrationList from '../IntegrationList'
import * as integrationsActions from '../../../../../state/integrations/actions'
import * as integrationsSelectors from '../../../../../state/integrations/selectors'

import {
    Alert
} from 'reactstrap'

@connect((state) => {
    return {
        redirectUri: integrationsSelectors.getRedirectUri('recharge')(state)
    }
}, {
    activate: integrationsActions.activateIntegration,
    deactivate: integrationsActions.deactivateIntegration,
})
export default class RechargeIntegrationList extends React.Component {
    static propTypes = {
        integrations: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
        activate: PropTypes.func.isRequired,
        deactivate: PropTypes.func.isRequired,
        redirectUri: PropTypes.string.isRequired
    }

    state = {
        isLightboxOpen: false,
        currentImage: 0,
    }

    _shouldHideCreateButton = () => {
        return !this.props.integrations.filter((integration) => integration.get('type') === 'shopify').size
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
            `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/presentationals/recharge-carousel_1.jpg`,
            `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/presentationals/recharge-carousel_2.jpg`
        ]

        const longTypeDescription = (
            <div>
                {
                    this._shouldHideCreateButton() && (
                        <Alert color="danger">
                            You need to have at least one Shopify integration to add Recharge integrations.
                        </Alert>
                    )
                }

                <p>Recharge is a recurring payment app for Shopify.</p>

                <p>How Gorgias works with Recharge:</p>
                <ul>
                    <li>
                        Display Recharge subscriptions next to support tickets
                    </li>
                    <li>
                        Edit subscriptions in one click
                    </li>
                    <li>
                        When a customer asks to edit their subscription, send them an auto-response with the link to
                        manage the subscription
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

                <h4>Your Recharge stores</h4>
            </div>
        )

        const integrationToItemDisplay = (int) => {
            const toggleIntegration = (value) => {
                const integrationId = int.get('id')
                return value ? this.props.activate(integrationId) : this.props.deactivate(integrationId)
            }

            const isDisabled = int.get('deactivated_datetime')
            const editLink = `/app/integrations/recharge/${int.get('id')}`

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
                </tr>
            )
        }

        return (
            <IntegrationList
                longTypeDescription={longTypeDescription}
                integrationType="recharge"
                integrations={integrations.filter((v) => v.get('type') === 'recharge')}
                createIntegration={() => browserHistory.push('/app/integrations/recharge/new')}
                createIntegrationButtonText="Add Recharge"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
                createIntegrationButtonHidden={this._shouldHideCreateButton()}
            />
        )
    }
}
