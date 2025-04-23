import React from 'react'

import CheckboxCard from 'pages/common/components/CheckboxCard/CheckboxCard'

import css from './ToneOfVoiceComponent.less'

interface ToneOfVoiceComponentProps {
    value?: string
    onChange?: (checkedTone: string) => void
}

export const ToneOfVoiceComponent: React.FC<ToneOfVoiceComponentProps> = ({
    value,
    onChange,
}) => {
    const tones = [
        {
            icon: 'emoji_emotions',
            title: 'Friendly',
            description: 'Warm, inviting, encouraging',
        },
        {
            icon: 'work',
            title: 'Professional',
            description: 'Precise, polished, authoritative',
        },
        {
            icon: 'school',
            title: 'Sophisticated',
            description: 'Elevated, elegant, refined',
        },
        {
            icon: 'settings_suggest',
            title: 'Custom',
            description: 'Add your own instructions',
        },
    ]

    return (
        <div
            className={css.toneOfVoiceContainer}
            role="group"
            aria-label="Select your AI Agent's tone of voice"
            aria-describedby="tone-description"
        >
            <div className={css.checkboxGrid}>
                {tones.map((tone) => (
                    <CheckboxCard
                        key={tone.title}
                        checked={value === tone.title}
                        onChange={() => onChange?.(tone.title)}
                        icon={tone.icon}
                        title={tone.title}
                        description={tone.description}
                        aria-label={`${tone.title}: ${tone.description}`}
                    />
                ))}
            </div>
        </div>
    )
}
