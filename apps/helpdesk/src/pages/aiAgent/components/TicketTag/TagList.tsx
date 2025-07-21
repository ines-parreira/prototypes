import { Button } from '@gorgias/merchant-ui-kit'

import { Tag } from 'models/aiAgent/types'
import IconButton from 'pages/common/components/button/IconButton'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import InputField from 'pages/common/forms/input/InputField'

import TagSearchSelect from './TagSearchSelect'

import css from './TagList.less'

type Props = {
    tags: Tag[]
    onTagsUpdate: (tags: Tag[]) => void
}

const TagList = ({ tags, onTagsUpdate }: Props) => {
    const handleTagSelect = (name: string, index: number) => {
        const updatedTags = tags.map((tag, i) =>
            i === index ? { ...tag, name } : tag,
        )
        onTagsUpdate(updatedTags)
    }

    const handleDescriptionChange = (index: number, newDescription: string) => {
        const updatedTags = tags.map((tag, i) =>
            i === index ? { ...tag, description: newDescription } : tag,
        )
        onTagsUpdate(updatedTags)
    }

    return (
        <div data-testid="store-configuration-taglist">
            {tags.length > 0 && (
                <div className={css.header}>
                    <div className={css.tagHeader}>
                        Tag
                        <IconTooltip className={css.icon}>
                            Choose from current tags or create new ones.
                        </IconTooltip>
                    </div>
                    <div className={css.description}>
                        Apply to tickets containing the following topics
                    </div>
                </div>
            )}
            <Button
                className={css.addButton}
                intent="secondary"
                onClick={() =>
                    onTagsUpdate([...tags, { name: '', description: '' }])
                }
                leadingIcon="add"
            >
                Add Tag
            </Button>
            {tags.map((t, index) => (
                <div key={`${index}${t.name}`} className={css.body}>
                    <div className={css.tag}>
                        <TagSearchSelect
                            onSelect={(name: string) =>
                                handleTagSelect(name, index)
                            }
                            defaultTag={t.name}
                        />
                    </div>
                    <div className={css.description}>
                        <InputField
                            data-testid="tag-description-input"
                            value={t.description}
                            onChange={(v) => handleDescriptionChange(index, v)}
                            placeholder="e.g. Shipping status or tracking related questions"
                            maxLength={255}
                        />
                    </div>
                    <IconButton
                        fillStyle="ghost"
                        intent="destructive"
                        onClick={() =>
                            onTagsUpdate(tags.filter((_, i) => i !== index))
                        }
                        size="medium"
                    >
                        close
                    </IconButton>
                </div>
            ))}
        </div>
    )
}

export default TagList
