import type React from 'react'

import { Icon, Tag, Text, ToggleField } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import css from './FeatureToggle.less'

type TagConfig = {
    text: string
    color?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple'
    icon?: IconName
}

type Props = {
    label: string
    caption: string
    tag?: TagConfig
    value: boolean
    onChange: (value: boolean) => void
    isDisabled?: boolean
}

export const FeatureToggle: React.FC<Props> = ({
    label,
    caption,
    tag,
    value,
    onChange,
    isDisabled,
}) => {
    return (
        <div className={css.featureToggle}>
            <div className={css.header}>
                <div className={css.labelContainer}>
                    <Text variant="bold" className={css.label}>
                        {label}{' '}
                    </Text>
                    {tag && (
                        <Tag
                            color={tag.color ?? 'purple'}
                            leadingSlot={
                                tag.icon ? <Icon name={tag.icon} /> : undefined
                            }
                        >
                            {tag.text}
                        </Tag>
                    )}
                </div>
                <ToggleField
                    onChange={onChange}
                    value={value}
                    isDisabled={isDisabled}
                />
            </div>
            <Text>{caption}</Text>
        </div>
    )
}
