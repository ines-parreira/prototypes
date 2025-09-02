import css from './VoiceStepNode.less'

type VoiceNodeFormSectionProps = {
    title: React.ReactNode
    description: React.ReactNode
    children: React.ReactNode
}

function VoiceNodeFormSection({
    title,
    description,
    children,
}: VoiceNodeFormSectionProps) {
    return (
        <div className={css.formSection}>
            <div className={css.sectionHeader}>
                <div className={css.sectionTitle}>{title}</div>
                <div className={css.sectionDescription}>{description}</div>
            </div>
            {children}
        </div>
    )
}

export default VoiceNodeFormSection
