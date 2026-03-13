import { Card, Elevation, Heading, Text, ToggleField } from '@gorgias/axiom'

import css from '../GorgiasChatIntegrationPreferences.less'

type Props = {
    displayChat: boolean
    showOutsideBusinessHours: boolean
    showOnMobile: boolean
    displayCampaignsWhenHidden: boolean
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
                    <Text size="md">
                        Control when and where your chat widget is visible to
                        customers.
                    </Text>
                </div>

                <div className={css.fieldSection}>
                    <ToggleField
                        label="Display chat"
                        caption="Turn off to temporarily remove the chat widget from your website without uninstalling it."
                        value={displayChat}
                        onChange={onDisplayChatChange}
                    />
                    <ToggleField
                        label="Show chat outside of business hours"
                        caption="Automatically hide the widget when your team is offline."
                        value={showOutsideBusinessHours}
                        onChange={onShowOutsideBusinessHoursChange}
                    />
                    <ToggleField
                        label="Show on mobile"
                        caption="Turn off to hide the chat widget from your mobile site."
                        value={showOnMobile}
                        onChange={onShowOnMobileChange}
                    />
                    <ToggleField
                        label="Display campaigns when chat is hidden"
                        caption="Keep campaigns visible even when chat is turned off. Customers won't be able to reply."
                        value={displayCampaignsWhenHidden}
                        onChange={onDisplayCampaignsWhenHiddenChange}
                    />
                </div>
            </div>
        </Card>
    )
}
