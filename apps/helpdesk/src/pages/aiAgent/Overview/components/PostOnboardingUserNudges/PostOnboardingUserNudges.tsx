import type React from 'react'
import { useEffect, useMemo, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useHistory, useLocation } from 'react-router-dom'

import {
    Box,
    Button,
    Heading,
    Modal,
    OverlayContent,
    OverlayFooter,
    Text,
} from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { extractShopTypeFromUrl } from 'pages/aiAgent/components/ShoppingAssistant/utils/extractShopTypeFromUrl'
import { extractShopNameFromUrl } from 'pages/aiAgent/utils/extractShopNameFromUrl'
import { getCurrentUser } from 'state/currentUser/selectors'

import { usePostOnboardingNudges } from '../../hooks/usePostOnboardingNudges'
import { POST_ONBOARDING_NUDGES_METADATA } from './constants'

import css from './PostOnboardingUserNudges.less'

interface PostOnboardingUserNudgesProps {}

export const PostOnboardingUserNudges: React.FC<
    PostOnboardingUserNudgesProps
> = () => {
    const user = useAppSelector(getCurrentUser)
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

            logEvent(SegmentEvent.PostOnboardingTaskUserNudgeViewed, {
                shop_name: shopName,
                shop_type: shopType,
                user_id: user.get('id'),
                type: shouldDisplayTrainNudge ? 'TRAIN' : 'DEPLOY',
            })
        }
    }, [
        isLoading,
        shouldDisplayTrainNudge,
        shouldDisplayDeployNudge,
        location.pathname,
        shopName,
        shopType,
        user,
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
            onOpenChange={async (open) => {
                if (!open) {
                    await handleClose()
                }
            }}
            isDismissable={false}
            size="sm"
            aria-label={nudgeMetadata.title}
        >
            <OverlayContent>
                <Box flexDirection="column" gap="md">
                    <div className={css.modalImage}>
                        <img
                            src={nudgeMetadata.image}
                            alt={nudgeMetadata.title}
                        />
                    </div>
                    <Heading size="md">{nudgeMetadata.title}</Heading>
                    <Text size="md">{nudgeMetadata.description}</Text>
                </Box>
            </OverlayContent>
            <OverlayFooter>
                <Box gap="xs">
                    <Button variant="primary" onClick={handlePrimaryAction}>
                        {nudgeMetadata.primaryActionLabel}
                    </Button>
                    <Button variant="tertiary" onClick={handleClose}>
                        {nudgeMetadata.secondaryActionLabel}
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
