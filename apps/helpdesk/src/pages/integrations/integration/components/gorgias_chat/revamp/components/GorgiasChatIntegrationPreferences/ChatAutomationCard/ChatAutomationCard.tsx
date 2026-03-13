import { Card, Elevation, Heading, Text, ToggleField } from '@gorgias/axiom'

import css from '../GorgiasChatIntegrationPreferences.less'

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
                <div className={css.toggleHeader}>
                    <div className={css.cardHeader}>
                        <Heading size="md">
                            Start conversations with automation
                        </Heading>
                        <Text size="md">
                            Decide if customers begin chatting with your
                            automated flows before reaching your team.
                        </Text>
                    </div>
                    <ToggleField
                        value={controlTicketVolume}
                        onChange={onControlTicketVolumeChange}
                    />
                </div>
            </div>
        </Card>
    )
}
