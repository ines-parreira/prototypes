import { IconButton } from '@gorgias/merchant-ui-kit'

import { Tag } from 'models/aiAgent/types'
import { FormValues } from 'pages/aiAgent/types'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import InputField from 'pages/common/forms/input/InputField'

import css from './TicketTagsFormComponent.less'

type StoreTagListItemProps = {
    tag: Tag
    onDelete: () => void
    onDescriptionUpdate: (newValue: string) => void
}

export const StoreTagComponent = ({
    tag: { name, description },
    onDelete,
    onDescriptionUpdate,
}: StoreTagListItemProps) => {
    return (
        <div className={css.ticketTagRowContainer}>
            <InputField
                className={css.ticketTagNameInput}
                value={name}
                isDisabled={true}
            />
            <InputField
                className={css.ticketTagDescriptionInput}
                value={description ?? ''}
                isDisabled={false}
                onChange={onDescriptionUpdate}
                maxLength={255}
            />
            <IconButton
                icon="close"
                intent="destructive"
                fillStyle="ghost"
                onClick={onDelete}
                data-testid="ticket-tag-row-delete-button"
            />
        </div>
    )
}

type StoreTagListProps = Pick<FormValues, 'tags'> & {
    onDelete: (name: string) => void
    onDescriptionUpdate: (name: string, description: string) => void
}

export const StoreTagList = ({
    tags,
    onDelete,
    onDescriptionUpdate,
}: StoreTagListProps) => {
    return (
        <div data-testid="store-tag-list">
            {!!tags?.length && (
                <div className={css.ticketTagRowContainer}>
                    <div className={css.ticketTagNameHeader}>
                        Tag
                        <IconTooltip className={css.icon}>
                            Choose from current tags or create new ones.
                        </IconTooltip>
                    </div>
                    <div className={css.ticketTagDescriptionHeader}>
                        Description
                    </div>
                </div>
            )}
            {tags?.map((tag, index) => {
                return (
                    <StoreTagComponent
                        key={`${index}-${tag.name}`}
                        tag={tag}
                        onDelete={() => onDelete(tag.name)}
                        onDescriptionUpdate={(newValue) =>
                            onDescriptionUpdate(tag.name, newValue)
                        }
                    />
                )
            })}
        </div>
    )
}
