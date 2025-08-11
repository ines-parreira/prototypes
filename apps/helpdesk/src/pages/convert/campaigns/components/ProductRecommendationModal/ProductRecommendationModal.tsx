import { Modal, ModalBody, ModalHeader } from 'reactstrap'

import { Badge } from '@gorgias/axiom'

import { useAppNode } from 'appNode'
import Button from 'pages/common/components/button/Button'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import { ProductRecommendationScenario } from 'pages/convert/campaigns/types/CampaignAttachment'
import { CampaignTrigger } from 'pages/convert/campaigns/types/CampaignTrigger'
import { getRecommendedTriggerForScenario } from 'pages/convert/campaigns/utils/geRecommendedTriggerForScenario'
import { assetsUrl } from 'utils'

import css from './ProductRecommendationModal.less'

const getScenarioContent = (scenario: ProductRecommendationScenario) => {
    switch (scenario) {
        case ProductRecommendationScenario.SimilarBought:
            return {
                title: "Recommends based on customers' last purchases",
                description: (
                    <>
                        <p>
                            Showcase similar products to what your customers
                            bought previously.
                        </p>
                        <p>
                            This recommendation is only valid for visitors who
                            have already placed an order. To use it, please add
                            the condition “
                            <b>Number of Orders Placed &gt; 0”</b> to this
                            campaign.
                        </p>
                    </>
                ),
                image: assetsUrl(
                    'img/campaigns/product-recommendations/number-of-orders-placed-trigger.png',
                ),
            }
        case ProductRecommendationScenario.OutOfStockAlternatives:
            return {
                title: 'Recommend Alternatives for Out of Stock Products',
                description: (
                    <>
                        <p>
                            Showcase alternative products when visitors are
                            browsing product pages where at least one active
                            variant is out of stock.
                        </p>
                        <p>
                            To use this feature, please add the condition “
                            <b>Out of Stock Product Pages</b>” to this campaign.
                        </p>
                    </>
                ),
                image: assetsUrl(
                    'img/campaigns/product-recommendations/out-of-stock-product-pages-trigger.png',
                ),
            }
        default:
            return {}
    }
}

type Props = {
    scenario: ProductRecommendationScenario
    isOpen: boolean
    onSubmit: (trigger: CampaignTrigger | undefined) => void
    onClose: () => void
    onExit: () => void
}

const ProductRecommendationModal = (props: Props) => {
    const appNode = useAppNode()
    const { scenario, isOpen, onSubmit, onClose, onExit } = props

    const { title, description, image } = getScenarioContent(scenario)
    if (!title || !description || !image) {
        return null
    }

    const onSubmitClick = () => {
        const trigger = getRecommendedTriggerForScenario(scenario)
        onSubmit(trigger)
    }

    const onCloseClick = () => {
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            toggle={onClose}
            onExit={onExit}
            autoFocus={true}
            backdrop="static"
            size="lg"
            zIndex={1561}
            container={appNode ?? undefined}
        >
            <ModalHeader toggle={onCloseClick}>{title}</ModalHeader>
            <ModalBody className={css.modalBody}>
                <>
                    <Badge type={'magenta'} className={css.badge}>
                        <i className="material-icons">auto_awesome</i>ai powered
                    </Badge>
                    {description}
                    <img src={image} alt={title} className={css.image} />
                </>
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={onCloseClick}>
                    Cancel
                </Button>

                <Button
                    color="primary"
                    isLoading={false}
                    onClick={onSubmitClick}
                >
                    Add Condition Automatically
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default ProductRecommendationModal
