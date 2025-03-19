import ToggleInput from 'pages/common/forms/ToggleInput'

import css from './ContactFormDisplayModeToggle.less'

type ContactFormDisplayModeToggleProps = {
    title: string
    description: string
    toggleLabel: string
    isToggled: boolean
    handleToggleClick: () => void
}

const ContactFormDisplayModeToggle = ({
    title,
    description,
    toggleLabel,
    isToggled,
    handleToggleClick,
}: ContactFormDisplayModeToggleProps) => {
    return (
        <div>
            <div className={css.title}>{title}</div>
            <div className={css.description}>{description}</div>
            <ToggleInput isToggled={isToggled} onClick={handleToggleClick}>
                {toggleLabel}
            </ToggleInput>
        </div>
    )
}

export default ContactFormDisplayModeToggle
