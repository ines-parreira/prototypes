import React, { useCallback, useEffect, useState } from 'react'

import { ListGroup, ListGroupItem } from 'reactstrap'
import { ulid } from 'ulidx'

import { AttachmentEnum } from 'common/types'
import { useModalManager } from 'hooks/useModalManager'
import ProductRecommendationModal from 'pages/convert/campaigns/components/ProductRecommendationModal/ProductRecommendationModal'
import { SCENARIO_CONFIG } from 'pages/convert/campaigns/constants/productRecommendationScenarios'
import { useCampaignDetailsContext } from 'pages/convert/campaigns/hooks/useCampaignDetailsContext'
import {
    ProductRecommendationAttachment,
    ProductRecommendationScenario,
} from 'pages/convert/campaigns/types/CampaignAttachment'
import { CampaignTrigger } from 'pages/convert/campaigns/types/CampaignTrigger'
import { areTriggersEqual } from 'pages/convert/campaigns/utils/areTriggersEqual'
import { getRecommendedTriggerForScenario } from 'pages/convert/campaigns/utils/geRecommendedTriggerForScenario'

import css from './ProductRecommendationScenarioPicker.less'

const createAttachment = (
    scenario: ProductRecommendationScenario,
): ProductRecommendationAttachment =>
    ({
        content_type: AttachmentEnum.ProductRecommendation,
        name: SCENARIO_CONFIG[scenario].title,
        extra: {
            id: ulid(),
            scenario,
            description: SCENARIO_CONFIG[scenario].description,
        },
    }) as ProductRecommendationAttachment

type Props = {
    onClick: (attachment: ProductRecommendationAttachment) => void
}

const ProductRecommendationScenarioPicker = ({ onClick }: Props) => {
    useEffect(() => {
        // a very hackish way that forces the popover element in the parent tree to re-paint itself at the correct location
        window.dispatchEvent(new Event('resize'))
    }, [])

    const { triggers, addTrigger } = useCampaignDetailsContext()
    const triggerRecommendationModal = useModalManager(
        'TRIGGER_RECOMMENDATION',
        {
            autoDestroy: false,
        },
    )
    const [selectedScenario, setSelectedScenario] =
        useState<ProductRecommendationScenario>(
            ProductRecommendationScenario.SimilarSeen,
        )

    const isTriggerAlreadyAdded = useCallback(
        (trigger: CampaignTrigger | undefined) =>
            trigger &&
            Object.values(triggers).some((t) => areTriggersEqual(t, trigger)),
        [triggers],
    )

    const handleScenarioClick = useCallback(
        (scenario: ProductRecommendationScenario) => {
            setSelectedScenario(scenario)
            const isModalRequired = SCENARIO_CONFIG[scenario].requiresModal
            const recommendedTrigger =
                getRecommendedTriggerForScenario(scenario)

            if (isModalRequired && !isTriggerAlreadyAdded(recommendedTrigger)) {
                triggerRecommendationModal.openModal()
            } else {
                onClick(createAttachment(scenario))
            }
        },
        [onClick, triggerRecommendationModal, isTriggerAlreadyAdded],
    )

    const onModalSubmit = useCallback(
        (trigger: CampaignTrigger | undefined) =>
            !!trigger && addTrigger(trigger.type, trigger),
        [addTrigger],
    )

    const onModalExit = useCallback(() => {
        onClick(createAttachment(selectedScenario))
    }, [onClick, selectedScenario])

    return (
        <>
            <ListGroup flush>
                {Object.values(ProductRecommendationScenario).map(
                    (scenario) => (
                        <ListGroupItem
                            key={scenario}
                            tag="button"
                            action
                            onClick={(event) => {
                                event.preventDefault()
                                handleScenarioClick(scenario)
                            }}
                        >
                            <div className={css.scenarioTitle}>
                                {SCENARIO_CONFIG[scenario].title}
                            </div>
                            <div className={css.scenarioDescription}>
                                {SCENARIO_CONFIG[scenario].description}
                            </div>
                        </ListGroupItem>
                    ),
                )}
            </ListGroup>
            <ProductRecommendationModal
                isOpen={triggerRecommendationModal.isOpen()}
                onClose={triggerRecommendationModal.closeModal}
                onExit={onModalExit}
                onSubmit={onModalSubmit}
                scenario={selectedScenario}
            />
        </>
    )
}

export default ProductRecommendationScenarioPicker
