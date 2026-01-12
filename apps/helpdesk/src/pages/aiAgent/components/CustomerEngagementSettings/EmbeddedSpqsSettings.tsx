import { useCallback, useState } from 'react'

import { useFormContext } from 'react-hook-form'

import { Button, LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { EngagementSettingsCardToggle } from 'pages/aiAgent/components/CustomerEngagementSettings/card/EngagementSettingsCardToggle'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { assetsUrl } from 'utils'

import {
    EngagementSettingsCard,
    EngagementSettingsCardContent,
    EngagementSettingsCardContentWrapper,
    EngagementSettingsCardDescription,
    EngagementSettingsCardImage,
    EngagementSettingsCardTitle,
} from './card/EngagementSettingsCard'
import { EmbeddedSpqSettingsDrawer } from './EmbeddedSpqSettingsDrawer'

import css from './EmbeddedSpqsSettings.less'

type Props = {
    description?: string
    shopName: string
}

const DEFAULT_DESCRIPTION =
    'Show up to 3 dynamic, AI-generated questions embedded directly in product pages to resolve pre-sales questions and drive conversion.'

export const EmbeddedSpqsSettings = ({
    shopName,
    description = DEFAULT_DESCRIPTION,
}: Props) => {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const { watch, setValue } = useFormContext()
    const isEmbeddedFaqsEnabled = watch('embeddedSpqEnabled')

    const {
        isLoading,
        isPendingCreateOrUpdate,
        storeConfiguration,
        updateStoreConfiguration,
    } = useAiAgentStoreConfigurationContext()

    const handleToggleChange = useCallback(
        (newValue: boolean) => {
            setValue('embeddedSpqEnabled', newValue, { shouldDirty: true })
        },
        [setValue],
    )

    const handleSettingsClick = useCallback(() => {
        setDrawerOpen(true)
    }, [])

    const handleDrawerOnClose = () => {
        setDrawerOpen(false)
    }

    const handleSetUpButtonClick = useCallback(async () => {
        if (!storeConfiguration) {
            return
        }

        await updateStoreConfiguration({
            ...storeConfiguration,
            embeddedSpqEnabled: true,
        })

        setValue('embeddedSpqEnabled', true)
        setDrawerOpen(true)
    }, [storeConfiguration, updateStoreConfiguration, setValue])

    const shouldDisplaySetUpButton =
        !isLoading && !storeConfiguration?.embeddedSpqEnabled

    return (
        <>
            <EmbeddedSpqSettingsDrawer
                isOpen={drawerOpen}
                onClose={handleDrawerOnClose}
                shopName={shopName}
            />

            <EngagementSettingsCard>
                <EngagementSettingsCardContentWrapper>
                    <EngagementSettingsCardImage
                        alt="image showing an example of embedded FAQs"
                        src={assetsUrl(
                            '/img/ai-agent/ai_agent_embedded_faqs_small.png',
                        )}
                    />

                    <EngagementSettingsCardContent className={css.cardContent}>
                        <div className={css.cardHeader}>
                            <EngagementSettingsCardTitle>
                                AI FAQs: Embedded in page
                            </EngagementSettingsCardTitle>

                            {shouldDisplaySetUpButton ? (
                                <div className={css.setUpButton}>
                                    {isPendingCreateOrUpdate ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            onClick={handleSetUpButtonClick}
                                        >
                                            Set Up
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <EngagementSettingsCardToggle
                                    isChecked={isEmbeddedFaqsEnabled}
                                    onChange={handleToggleChange}
                                    withBadges
                                    onSettingsClick={handleSettingsClick}
                                ></EngagementSettingsCardToggle>
                            )}
                        </div>

                        <EngagementSettingsCardDescription>
                            {description}
                        </EngagementSettingsCardDescription>
                    </EngagementSettingsCardContent>
                </EngagementSettingsCardContentWrapper>
            </EngagementSettingsCard>
        </>
    )
}
