import React, {useState} from 'react'

import {CampaignVariant} from 'pages/convert/campaigns/types/CampaignVariant'

import Button from 'pages/common/components/button/Button'

import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import RadioButton from 'pages/common/components/RadioButton'

import {generateVariantName} from 'pages/convert/abVariants/utils/generateVariantName'

import css from './StopABTestModal.less'

type Props = {
    isOpen: boolean
    isLoading?: boolean
    controlVersionId: string
    variants: CampaignVariant[]
    onClose: () => void
    onSubmit: (variantId: string | null) => Promise<void>
}

const StopABTestModal: React.FC<Props> = (props) => {
    const {
        isOpen,
        isLoading = false,
        variants,
        controlVersionId,
        onClose,
        onSubmit,
    } = props

    const [selectedVariant, setSelectedVariant] = useState(controlVersionId)

    const onVariantClick = (value: any) => {
        setSelectedVariant(value)
    }

    const onSubmitClick = async () => {
        // if user selected `Control Version` send null
        await onSubmit(
            controlVersionId === selectedVariant ? null : selectedVariant
        )
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader title={'Stop A/B test'} />
            <ModalBody>
                <div>
                    <p className={css.description}>
                        Once a winning variant is chosen, this A/B test will
                        stop.
                    </p>
                    <div>
                        <h3>Please choose a winning variant</h3>
                        <div>
                            <RadioButton
                                onClick={() => onVariantClick(controlVersionId)}
                                label={'Control Variant'}
                                isSelected={
                                    controlVersionId === selectedVariant
                                }
                                value={controlVersionId}
                            />

                            {variants.map((variant, idx) => {
                                return (
                                    <RadioButton
                                        key={idx}
                                        className={css.radioButton}
                                        onClick={() =>
                                            onVariantClick(variant.id)
                                        }
                                        label={generateVariantName(idx)}
                                        isSelected={
                                            variant.id === selectedVariant
                                        }
                                        value={variant.id as string}
                                    />
                                )
                            })}
                        </div>
                    </div>
                </div>
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    intent="destructive"
                    isLoading={isLoading}
                    isDisabled={!selectedVariant}
                    onClick={onSubmitClick}
                >
                    Stop Test
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default StopABTestModal
