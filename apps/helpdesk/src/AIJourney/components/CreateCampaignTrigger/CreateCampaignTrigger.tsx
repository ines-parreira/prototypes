import { Button, Icon, Menu, MenuItem } from '@gorgias/axiom'

type CreateCampaignTriggerProps = {
    showTemplatePicker: boolean
    onStartFromScratch: () => void
    onStartFromTemplate: () => void
}

export const CreateCampaignTrigger = ({
    showTemplatePicker,
    onStartFromScratch,
    onStartFromTemplate,
}: CreateCampaignTriggerProps) => {
    if (!showTemplatePicker) {
        return <Button onClick={onStartFromScratch}>Create campaign</Button>
    }

    return (
        <Menu
            aria-label="Create campaign options"
            trigger={({ isOpen }) => (
                <Button
                    trailingSlot={
                        <Icon
                            name={
                                isOpen
                                    ? 'arrow-chevron-up'
                                    : 'arrow-chevron-down'
                            }
                            size="sm"
                        />
                    }
                >
                    Create campaign
                </Button>
            )}
        >
            <MenuItem
                id="from-scratch"
                label="From scratch"
                onAction={onStartFromScratch}
            />
            <MenuItem
                id="from-template"
                label="From template"
                onAction={onStartFromTemplate}
            />
        </Menu>
    )
}
