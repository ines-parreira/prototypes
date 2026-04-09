import { Card, Elevation, Heading, Text, ToggleField } from '@gorgias/axiom'

import css from '../GorgiasChatIntegrationPreferences.less'

type Props = {
    displayChat: boolean
    showOutsideBusinessHours: boolean
    showOnMobile: boolean
    displayCampaignsWhenHidden: boolean
    hasConvert: boolean
    onDisplayChatChange: (value: boolean) => void
    onShowOutsideBusinessHoursChange: (value: boolean) => void
    onShowOnMobileChange: (value: boolean) => void
    onDisplayCampaignsWhenHiddenChange: (value: boolean) => void
}

export const ChatVisibilityCard = ({
    displayChat,
    showOutsideBusinessHours,
    showOnMobile,
    displayCampaignsWhenHidden,
    hasConvert,
    onDisplayChatChange,
    onShowOutsideBusinessHoursChange,
    onShowOnMobileChange,
    onDisplayCampaignsWhenHiddenChange,
}: Props) => {
    return (
        <Card className={css.card} elevation={Elevation.Mid}>
            <div className={css.cardContent}>
                <div className={css.cardHeader}>
                    <Heading size="md">Where chat appears</Heading>
                    <Text size="md" className={css.cardDescription}>
                        Control when and where your chat is visible to shoppers.
                    </Text>
                </div>

                <div className={css.fieldSection}>
                    <ToggleField
                        label="Show chat"
                        caption="Turn off to temporarily remove the chat from your website."
                        value={displayChat}
                        onChange={onDisplayChatChange}
                    />
                    <ToggleField
                        label="Show chat outside of business hours"
                        caption="Turn off to hide chat outside of business hours."
                        value={showOutsideBusinessHours}
                        onChange={onShowOutsideBusinessHoursChange}
                    />
                    <ToggleField
                        label="Show on mobile"
                        caption="Turn off to hide the chat from your mobile site."
                        value={showOnMobile}
                        onChange={onShowOnMobileChange}
                    />
                    {hasConvert && (
                        <ToggleField
                            label="Show campaigns when chat is hidden"
                            caption="Keep campaigns visible even when chat is turned off. Shoppers won't be able to reply."
                            value={displayCampaignsWhenHidden}
                            onChange={onDisplayCampaignsWhenHiddenChange}
                        />
                    )}
                </div>
            </div>
        </Card>
    )
}
