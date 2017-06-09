import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import {connect} from 'react-redux'
import Slider from 'react-slick'

import ToggleCheckbox from '../../../../common/forms/ToggleCheckbox'
import IntegrationList from '../IntegrationList'
import * as integrationsActions from '../../../../../state/integrations/actions'

import css from './ShopifyIntegrationList.less'

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

    render() {
        const {integrations, loading} = this.props

        const sliderSettings = {
            dots: true,
            slidesToShow: 2,
            arrows: false,
            autoplay: true,
            autoplaySpeed: 3000
        }

        const imagesUrl = [
            `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/presentationals/shopify-carousel_1@0,25x.jpg`,
            `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/presentationals/shopify-carousel_2@0,25x.jpg`,
            `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/presentationals/shopify-carousel_3@0,25x.jpg`
        ]

        const longTypeDescription = (
            <div>
                <p>Shopify is an e-commerce platform used by 300,000+ stores.</p>

                <div className={css.carouselContainer}>
                    <Slider {...sliderSettings}>
                        {
                            imagesUrl.map((url, idx) => (
                                <div key={idx} className={css.carouselContent}>
                                    <a href={url} target="_blank">
                                        <img src={url}/>
                                    </a>
                                </div>
                            ))
                        }
                    </Slider>
                </div>

                <h4>How Gorgias works with Shopify</h4>
                <ul>
                    <li>
                        See Shopify profiles, orders & shipping status next to support tickets
                    </li>
                    <li>
                        Edit orders, issue refunds, etc. directly from support conversations
                    </li>
                    <li>
                        Search users by order number, shipping address... and match anonymous chat tickets with
                        existing Shopify customers
                    </li>
                </ul>

                <h4>Your Shopify stores</h4>
            </div>
        )

        const integrationToItemDisplay = (int) => {
            const toggleIntegration = (value) => {
                const integrationId = int.get('id')
                return value ? this.props.activate(integrationId) : this.props.deactivate(integrationId)
            }

            const isDisabled = int.get('deactivated_datetime')
            const editLink = `/app/integrations/shopify/${int.get('id')}`

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
                        <ToggleCheckbox
                            input={{
                                onChange: toggleIntegration,
                                value: !isDisabled,
                            }}
                        />
                    </td>
                </tr>
            )
        }

        return (
            <IntegrationList
                longTypeDescription={longTypeDescription}
                integrationType="shopify"
                integrations={integrations.filter((v) => v.get('type') === 'shopify')}
                createIntegration={() => browserHistory.push('/app/integrations/shopify/new')}
                createIntegrationButtonText="Add Shopify"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}
