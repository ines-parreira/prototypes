import React from 'react'
import {Tag} from 'models/aiAgent/types'
import InputField from 'pages/common/forms/input/InputField'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'
import IconButton from 'pages/common/components/button/IconButton'
import TagSearchSelect from './TagSearchSelect'
import css from './TagList.less'

type Props = {
    tags: Tag[]
    setTags: (tags: Tag[]) => void
}

const TagList = ({tags, setTags}: Props) => {
    const handleTagSelect = (name: string, index: number) => {
        const updatedTags = tags.map((tag, i) =>
            i === index ? {...tag, name} : tag
        )
        setTags(updatedTags)
    }

    const handleDescriptionChange = (index: number, newDescription: string) => {
        const updatedTags = tags.map((tag, i) =>
            i === index ? {...tag, description: newDescription} : tag
        )
        setTags(updatedTags)
    }

    return (
        <div>
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
            {tags.map((t, index) => (
                <div key={t.name} className={css.body}>
                    <div className={css.tag}>
                        <TagSearchSelect
                            onSelect={() => handleTagSelect(t.name, index)}
                            defaultTag={t.name}
                        />
                    </div>
                    <div className={css.description}>
                        <InputField
                            value={t.description}
                            onChange={(v) => handleDescriptionChange(index, v)}
                            placeholder="e.g. Shipping status or tracking related questions"
                        />
                    </div>
                    <IconButton
                        fillStyle="ghost"
                        intent="destructive"
                        onClick={() =>
                            setTags(tags.filter((_, i) => i !== index))
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
