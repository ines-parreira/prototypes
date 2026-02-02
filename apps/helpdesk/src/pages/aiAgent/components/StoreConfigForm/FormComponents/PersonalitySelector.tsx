import type React from 'react'

import CheckboxCard from 'pages/common/components/CheckboxCard/CheckboxCard'

import css from './PersonalitySelector.less'

interface PersonalitySelectorProps {
    value?: string
    onChange?: (selectedPersonality: string) => void
}

export const PersonalitySelector: React.FC<PersonalitySelectorProps> = ({
    value,
    onChange,
}) => {
    const personalities = [
        {
            title: 'Friendly',
            description: 'Warm, inviting, encouraging',
        },
        {
            title: 'Professional',
            description: 'Precise, polished, authoritative',
        },
        {
            title: 'Sophisticated',
            description: 'Elevated, elegant, refined',
        },
        {
            title: 'Custom',
            description: 'Customize your personality',
        },
    ]

    return (
        <div
            className={css.personalityContainer}
            role="group"
            aria-label="Select personality"
            aria-describedby="personality-description"
        >
            <div className={css.checkboxGrid}>
                {personalities.map((personality) => (
                    <CheckboxCard
                        icon={null}
                        key={personality.title}
                        checked={value === personality.title}
                        onChange={() => onChange?.(personality.title)}
                        title={personality.title}
                        description={personality.description}
                        aria-label={`${personality.title}: ${personality.description}`}
                        className={css.personalityCard}
                    />
                ))}
            </div>
        </div>
    )
}
