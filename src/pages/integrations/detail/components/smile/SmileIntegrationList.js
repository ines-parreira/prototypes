// @flow
import React from 'react'
import {List, type Map} from 'immutable'
import {Link} from 'react-router-dom'
import {connect} from 'react-redux'
import Lightbox from 'react-images'

import Carousel from '../../../common/Carousel'
import ToggleButton from '../../../../common/components/ToggleButton'
import IntegrationList from '../IntegrationList'
import ForwardIcon from '../ForwardIcon'
import * as integrationsActions from '../../../../../state/integrations/actions.ts'

type Props = {
    integrations: List,
    redirectUri: string,

    loading: Object,
    activate: (number) => Promise<*>,
    deactivate: (number) => Promise<*>,
}

type State = {
    isLightboxOpen: boolean,
    currentImage: number,
}

@connect(null, {
    activate: integrationsActions.activateIntegration,
    deactivate: integrationsActions.deactivateIntegration,
})
export default class SmileIntegrationList extends React.Component<
    Props,
    State
> {
    state: State = {
        isLightboxOpen: false,
        currentImage: 0,
    }

    _toggleLightbox = (selectedImageId: ?number) => {
        this.setState({
            isLightboxOpen: !this.state.isLightboxOpen,
            currentImage: selectedImageId || 0,
        })
    }

    _gotoImage = (index: number) => {
        this.setState({currentImage: index})
    }

    _onLogin = () => {
        window.location = this.props.redirectUri
    }

    render() {
        const {integrations, loading} = this.props
        const smileIntegrations = integrations.filter(
            (v) => v.get('type') === 'smile'
        )

        const imagesUrl = [
            `${
                window.GORGIAS_ASSETS_URL || ''
            }/static/private/img/presentationals/smile-carousel_1.jpg`,
            `${
                window.GORGIAS_ASSETS_URL || ''
            }/static/private/img/presentationals/smile-carousel_2.jpg`,
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

                <h4>Your Smile integrations</h4>
            </div>
        )

        const integrationToItemDisplay = (integration: Map<*, *>) => {
            const toggleIntegration = (value: boolean): Promise<*> => {
                const integrationId = integration.get('id')
                return value
                    ? this.props.activate(integrationId)
                    : this.props.deactivate(integrationId)
            }

            const isDisabled = integration.get('deactivated_datetime')
            const editLink = `/app/settings/integrations/smile/${integration.get(
                'id'
            )}`

            return (
                <tr key={integration.get('id')}>
                    <td className="link-full-td">
                        <Link to={editLink}>
                            <div>
                                <b>{integration.get('name')}</b>
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
                createIntegration={this._onLogin}
                createIntegrationButtonContent="Add Smile account"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}
