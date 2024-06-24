import React, {useEffect, useState} from 'react'
import {Map} from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationById} from 'state/integrations/selectors'

import Tag from 'pages/common/components/Tag/Tag'
import {CampaignTemplate} from 'pages/convert/campaigns/templates/types'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'

import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'

import SimpleCampaignEditor from 'pages/convert/onboarding/components/SimpleCampaignEditor/SimpleCampaignEditor'

import css from './ConvertSimplifiedEditorModal.less'

type Props = {
    isOpen: boolean
    template: CampaignTemplate
    integration: Map<any, any>
    estimatedRevenue: any
    onClose: () => void
}

const ConvertSimplifiedEditorModal: React.FC<Props> = (props) => {
    const {isOpen, onClose, template, estimatedRevenue, integration} = props

    const [campaign, setCampaign] = useState<Campaign>()

    const storeIntegration = useAppSelector(
        getIntegrationById(integration.getIn(['meta', 'shop_integration_id']))
    )

    useEffect(() => {
        template
            .getConfiguration(storeIntegration, integration)
            .then((draftCampaign) => {
                setCampaign(draftCampaign as Campaign)
            })
            .catch((e) => {
                console.error(e)
            })
    }, [template, storeIntegration, integration, setCampaign])

    const onSubmit = () => {
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={close} size="huge">
            <ModalBody className={css.modalBody}>
                <div className={css.modalContainer}>
                    <div className={css.leftSide}>
                        <div className={css.labelContainer}>
                            <Tag color="orange" text={template.label} />
                            <Tag
                                className={css.estimationLabel}
                                color="green"
                                leadIcon={
                                    <i className="material-icons">
                                        monetization_on
                                    </i>
                                }
                                text={`Generates ${estimatedRevenue} on average`}
                            />
                        </div>

                        <h2 className={css.templateTitle}>{template.name}</h2>
                        <div>{template.description}</div>

                        <div className="">
                            <SimpleCampaignEditor campaign={campaign} />
                        </div>

                        <div className={css.section}>
                            <div className={css.disclaimer}>
                                <span>
                                    You can further customize this campaign
                                    after finishing the setup.
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={css.rightSide}>preview</div>
                </div>
            </ModalBody>
            <ModalFooter>
                <div className={css.footer}>
                    <Button
                        onClick={onClose}
                        intent="secondary"
                        className={css.forceLeft}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onSubmit()}
                        className={css.marginRight}
                        fillStyle="ghost"
                        intent="primary"
                    >
                        Save
                    </Button>
                    <Button onClick={() => onSubmit()}>Save & Publish</Button>
                </div>
            </ModalFooter>
        </Modal>
    )
}

export default ConvertSimplifiedEditorModal
