import React, { useEffect, useMemo, useState } from 'react'

import { useHistory, useLocation } from 'react-router-dom'

import { Button, Heading, Text } from '@gorgias/axiom'

import { extractShopNameFromUrl } from 'pages/aiAgent/components/ShoppingAssistant/utils/extractShopNameFromUrl'
import { extractShopTypeFromUrl } from 'pages/aiAgent/components/ShoppingAssistant/utils/extractShopTypeFromUrl'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'

import { usePostOnboardingNudges } from '../../hooks/usePostOnboardingNudges'
import { POST_ONBOARDING_NUDGES_METADATA } from './constants'

import css from './PostOnboardingUserNudges.less'

interface PostOnboardingUserNudgesProps {}

export const PostOnboardingUserNudges: React.FC<
    PostOnboardingUserNudgesProps
> = () => {
    const location = useLocation()
    const history = useHistory()

    const shopName = extractShopNameFromUrl(location.pathname) || ''
    const shopType = extractShopTypeFromUrl(location.pathname) || ''

    const {
        shouldDisplayTrainNudge,
        shouldDisplayDeployNudge,
        dismissTrainNudge,
        dismissDeployNudge,
        isLoading,
    } = usePostOnboardingNudges(shopName, shopType)

    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (
            !isLoading &&
            (shouldDisplayTrainNudge || shouldDisplayDeployNudge)
        ) {
            setIsOpen(true)
        }
    }, [
        isLoading,
        shouldDisplayTrainNudge,
        shouldDisplayDeployNudge,
        location.pathname,
    ])

    const { nudgeMetadata, dismissNudge } = useMemo(() => {
        const meta = shouldDisplayTrainNudge
            ? POST_ONBOARDING_NUDGES_METADATA.TRAIN
            : POST_ONBOARDING_NUDGES_METADATA.DEPLOY
        const dismiss = shouldDisplayTrainNudge
            ? dismissTrainNudge
            : dismissDeployNudge
        return { nudgeMetadata: meta, dismissNudge: dismiss }
    }, [shouldDisplayTrainNudge, dismissTrainNudge, dismissDeployNudge])

    const handleClose = async () => {
        await dismissNudge()

        setIsOpen(false)
    }

    const handlePrimaryAction = async () => {
        await dismissNudge()

        setIsOpen(false)

        const pathname = nudgeMetadata.primaryActionPath(shopType, shopName)
        history.push({
            pathname,
            state: { openTab: nudgeMetadata.stepName.toLowerCase() },
        })
    }

    if (isLoading || (!shouldDisplayTrainNudge && !shouldDisplayDeployNudge)) {
        return null
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            classNameDialog={css.modal}
            preventCloseClickOutside
        >
            <div className={css.modalImage}>
                <img src={nudgeMetadata.image} alt={nudgeMetadata.title} />
            </div>
            <ModalBody className={css.modalBody}>
                <Heading size="md">{nudgeMetadata.title}</Heading>
                <Text size="md" variant="regular">
                    {nudgeMetadata.description}
                </Text>
            </ModalBody>
            <ModalFooter className={css.modalFooter}>
                <Button
                    intent="primary"
                    fillStyle="fill"
                    onClick={handlePrimaryAction}
                >
                    {nudgeMetadata.primaryActionLabel}
                </Button>
                <Button
                    intent="secondary"
                    fillStyle="ghost"
                    onClick={handleClose}
                >
                    {nudgeMetadata.secondaryActionLabel}
                </Button>
            </ModalFooter>
        </Modal>
    )
}
