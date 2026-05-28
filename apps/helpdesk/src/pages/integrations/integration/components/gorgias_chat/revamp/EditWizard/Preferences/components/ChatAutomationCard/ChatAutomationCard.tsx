import { Card, Elevation, Heading, Text, ToggleField } from '@gorgias/axiom'

import css from '../../GorgiasChatIntegrationPreferences.less'

type Props = {
    controlTicketVolume: boolean
    onControlTicketVolumeChange: (value: boolean) => void
}

export const ChatAutomationCard = ({
    controlTicketVolume,
    onControlTicketVolumeChange,
}: Props) => {
    return (
        <Card className={css.card} elevation={Elevation.Mid}>
            <div className={css.cardContent}>
                <div className={css.cardHeader}>
                    <Heading size="md">Require automated interaction</Heading>
                    <Text size="md" className={css.cardDescription}>
                        Hide &ldquo;Send us a message&rdquo; so customers must
                        start with an automation button before they can send a
                        message. Requiring automated interactions may lower the
                        volume of live chat and offline capture tickets your
                        team must answer manually.
                    </Text>
                </div>

                <ToggleField
                    label="Remove &ldquo;Send us a message&rdquo; button"
                    value={controlTicketVolume}
                    onChange={onControlTicketVolumeChange}
                />
            </div>
        </Card>
    )
}
