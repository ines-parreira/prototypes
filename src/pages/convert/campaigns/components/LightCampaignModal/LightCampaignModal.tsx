import React, { useState } from 'react'

import { Modal, ModalBody, ModalHeader } from 'reactstrap'

import { useAppNode } from 'appNode'
import Button from 'pages/common/components/button/Button'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import CheckBox from 'pages/common/forms/CheckBox'
import { LightCampaignModalType } from 'pages/convert/campaigns/types/enums/LightCampaignModalType'
import { CONVERT_PRODUCT_LINK } from 'pages/convert/common/constants'

import css from './LightCampaignModal.less'

type Props = {
    modalType: LightCampaignModalType
    isOpen: boolean
    isDismissed: boolean
    setIsDismissed: (isDismissed: boolean) => void
    isSubmitting: boolean
    onSubmit: (() => void) | undefined
    onClose: () => void
}

const LightCampaignModal = (props: Props) => {
    const appNode = useAppNode()
    const {
        modalType,
        isOpen,
        isDismissed,
        setIsDismissed,
        isSubmitting,
        onSubmit,
        onClose,
    } = props

    const [isDismissedChecked, setIsDismissedChecked] = useState(isDismissed)

    const title =
        modalType === LightCampaignModalType.DeactivateCampaign
            ? 'Deactivate campaign'
            : 'Delete campaign'

    const onLearnClick = () => {
        window.open(CONVERT_PRODUCT_LINK, '_blank', 'noopener')
    }

    const onDismissClick = () => {
        setIsDismissedChecked(
            (prevIsDismissedChecked) => !prevIsDismissedChecked,
        )
    }

    const onSubmitClick = () => {
        if (isDismissedChecked) {
            setIsDismissed(isDismissedChecked)
        }
        onSubmit && onSubmit()
    }

    const onCloseClick = () => {
        if (isDismissedChecked) {
            setIsDismissed(isDismissedChecked)
        }
        onClose()
    }

    return (
        <Modal
            isOpen={!isDismissed && isOpen}
            toggle={onClose}
            autoFocus={true}
            backdrop="static"
            size="lg"
            zIndex={1561}
            container={appNode ?? undefined}
        >
            <ModalHeader toggle={onCloseClick}>{title}</ModalHeader>
            <ModalBody>
                <>
                    <p>
                        {`We've updated our campaign policies. `}
                        <b>
                            With your current plan, you can now have up to 3
                            active campaigns.
                        </b>{' '}
                        Any active campaigns created before this update will
                        still be displayed to your customers. Here is what you
                        need to know:
                    </p>
                    <ul>
                        <li>You currently have 3 or more active campaigns.</li>
                        <li>
                            If you want to activate this campaign again after
                            deactivating it, you must deactivate other campaigns
                            to stay within the threshold.
                        </li>
                    </ul>
                    <h2>Discover Convert</h2>
                    <p>
                        {`To create and activate an unlimited number of campaigns,
                        it's time to upgrade! Subscribe to Convert and enjoy
                        the freedom to run as many campaigns as you need, with
                        personalized targeting conditions, product
                        recommendations, and more.`}
                    </p>
                    <CheckBox
                        isChecked={isDismissedChecked}
                        onChange={onDismissClick}
                        className={css.lightModalCheckbox}
                    >
                        <b>{`Don't show this message again`}</b>
                    </CheckBox>
                </>
            </ModalBody>
            <ModalActionsFooter className={css.lightModalFooter}>
                <Button intent="secondary" onClick={onCloseClick}>
                    Cancel
                </Button>

                <Button intent="secondary" onClick={onLearnClick}>
                    Learn About Convert
                </Button>

                <Button
                    color="primary"
                    isLoading={isSubmitting}
                    onClick={onSubmitClick}
                >
                    {title}
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default LightCampaignModal
