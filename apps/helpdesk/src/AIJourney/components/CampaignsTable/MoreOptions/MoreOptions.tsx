import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useHistory } from 'react-router-dom'

import { ListItem, Select, SelectTrigger } from '@gorgias/axiom'
import { JourneyCampaignStateEnum } from '@gorgias/convert-client'

import {
    JOURNEY_TYPES,
    UpdatableJourneyCampaignState,
} from 'AIJourney/constants'

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
    [JourneyCampaignStateEnum.Paused]: [Options.Resume, Options.Cancel],
    [JourneyCampaignStateEnum.Canceled]: [Options.Duplicate],
    [JourneyCampaignStateEnum.Sent]: [Options.Duplicate],
}

type OptionEntry = { id: Options; name: string; icon: string }

export const MoreOptions = ({
    shopName,
    journeyId,
    state,
    handleChangeStatus,
    handleRemoveClick,
    handleCancelClick,
    handleSendClick,
    handleDuplicateClick,
    hasIncludedAudiences,
}: {
    shopName: string
    journeyId: string
    state: JourneyCampaignStateEnum
    handleChangeStatus: (status: UpdatableJourneyCampaignState) => void
    handleRemoveClick: () => void
    handleCancelClick: () => void
    handleSendClick: () => void
    handleDuplicateClick: () => void
    hasIncludedAudiences: boolean
}) => {
    const history = useHistory()
    const isAiJourneyCampaignSendingEnabled = useFlag(
        FeatureFlagKey.AiJourneyCampaignSendingEnabled,
    )

    const handleAction = useCallback(
        (option: OptionEntry) => {
            switch (option.id) {
                case Options.Send:
                    handleSendClick()
                    break
                case Options.Pause:
                    handleChangeStatus(UpdatableJourneyCampaignState.Paused)
                    break
                case Options.Resume:
                    handleChangeStatus(UpdatableJourneyCampaignState.Scheduled)
                    break
                case Options.Cancel:
                    handleCancelClick()
                    break
                case Options.Duplicate:
                    handleDuplicateClick()
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
            handleCancelClick,
            handleDuplicateClick,
        ],
    )

    const options = useMemo(() => {
        const availableOptions = CAMPAIGN_STATE_TO_FIELDS[state] || []
        return availableOptions
            .map((option) => {
                switch (option) {
                    case Options.Send:
                        if (
                            (isAiJourneyCampaignSendingEnabled ||
                                window.USER_IMPERSONATED) &&
                            hasIncludedAudiences
                        ) {
                            return {
                                icon: 'comm-send',
                                id: option,
                                name: 'Send',
                            }
                        }
                        return null
                    case Options.Pause:
                        return {
                            icon: 'media-pause-circle',
                            id: option,
                            name: 'Pause',
                        }
                    case Options.Resume:
                        return {
                            icon: 'media-play-circle',
                            id: option,
                            name: 'Resume',
                        }
                    case Options.Cancel:
                        return {
                            icon: 'media-stop-circle',
                            id: option,
                            name: 'Cancel',
                        }
                    case Options.Edit:
                        return {
                            icon: 'edit-pencil',
                            id: option,
                            name: 'Edit',
                        }
                    case Options.Duplicate:
                        return {
                            icon: 'copy',
                            id: option,
                            name: 'Duplicate',
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
    }, [state, isAiJourneyCampaignSendingEnabled, hasIncludedAudiences])

    if (options.length === 0) {
        return null
    }

    return (
        <div className={css.statusRight} style={{ position: 'relative' }}>
            <Select
                data-name="select-field"
                placement="bottom right"
                trigger={({ ref }) => (
                    <SelectTrigger ref={ref}>
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
