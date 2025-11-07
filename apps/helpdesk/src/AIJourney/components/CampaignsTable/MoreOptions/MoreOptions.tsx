import { useCallback, useMemo } from 'react'

import { useHistory } from 'react-router-dom'

import { ListItem, Select, SelectTrigger } from '@gorgias/axiom'
import { JourneyCampaignStateEnum } from '@gorgias/convert-client'

import { JOURNEY_TYPES } from 'AIJourney/constants'

import css from './MoreOptions.less'

const Options = {
    Send: 'send',
    Pause: 'pause',
    Resume: 'resume',
    Cancel: 'cancel',
    Duplicate: 'duplicate',
    Edit: 'edit',
    Delete: 'delete',
}

type Options = (typeof Options)[keyof typeof Options]

// TODO: add pause option when the functionality is available
export const CAMPAIGN_STATE_TO_FIELDS: Record<
    JourneyCampaignStateEnum,
    Options[]
> = {
    [JourneyCampaignStateEnum.Draft]: [
        Options.Edit,
        Options.Send,
        Options.Duplicate,
        Options.Delete,
    ],
    [JourneyCampaignStateEnum.Scheduled]: [Options.Duplicate, Options.Cancel],
    [JourneyCampaignStateEnum.Active]: [
        Options.Duplicate,
        Options.Pause,
        Options.Cancel,
    ],
    [JourneyCampaignStateEnum.Canceled]: [Options.Duplicate, Options.Resume],
    [JourneyCampaignStateEnum.Sent]: [Options.Duplicate],
}

type OptionEntry = { id: Options; name: string; icon: string }

export const MoreOptions = ({
    shopName,
    journeyId,
    state,
    handleChangeStatus,
    handleRemoveClick,
    handleSendClick,
}: {
    shopName: string
    journeyId: string
    state: JourneyCampaignStateEnum
    handleChangeStatus: () => void
    handleRemoveClick: () => void
    handleSendClick: () => void
}) => {
    const history = useHistory()

    const handleAction = useCallback(
        (option: OptionEntry) => {
            switch (option.id) {
                case Options.Send:
                    handleSendClick()
                    break
                case Options.Resume:
                case Options.Cancel:
                    handleChangeStatus()
                    break
                case Options.Edit:
                    history.push(
                        `/app/ai-journey/${shopName}/${JOURNEY_TYPES.CAMPAIGN}/setup/${journeyId}`,
                    )
                    break
                case Options.Delete:
                    handleRemoveClick()
                    break
                default:
                    break
            }
        },
        [
            shopName,
            journeyId,
            handleSendClick,
            history,
            handleRemoveClick,
            handleChangeStatus,
        ],
    )

    const options = useMemo(() => {
        const availableOptions = CAMPAIGN_STATE_TO_FIELDS[state] || []
        return availableOptions
            .map((option) => {
                switch (option) {
                    case Options.Send:
                        return {
                            icon: 'comm-send',
                            id: option,
                            name: 'Send',
                        }
                    case Options.Edit:
                        return {
                            icon: 'edit-pencil',
                            id: option,
                            name: 'Edit',
                        }
                    case Options.Delete:
                        return {
                            icon: 'trash-empty',
                            id: option,
                            name: 'Delete',
                        }
                    default:
                        return null
                }
            })
            .filter((option): option is OptionEntry => option !== null)
    }, [state])

    if (options.length === 0) {
        return null
    }

    return (
        <div className={css.statusRight} style={{ position: 'relative' }}>
            <Select
                data-name="select-field"
                trigger={() => (
                    <SelectTrigger>
                        <div
                            className={css.menuButton}
                            aria-label="Open options"
                        >
                            <i className="material-icons-outlined">
                                more_horiz
                            </i>
                        </div>
                    </SelectTrigger>
                )}
                items={options}
                onSelect={handleAction}
            >
                {(option) => (
                    <ListItem
                        id={option.id}
                        leadingSlot={option.icon}
                        label={option.name}
                    />
                )}
            </Select>
        </div>
    )
}
