import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import css from './MultiLevelSelect.less'

type LevelOptionProps = {
    className?: string
    label: string
    onClick: () => void
}

export function LevelOption({ className, label, onClick }: LevelOptionProps) {
    return (
        <DropdownItem
            className={className}
            tag="button"
            onClick={onClick}
            option={{ label, value: label }}
        >
            <span className={css.choiceButton}>
                <span className={css.ellipsis}>{label}</span>
                <span className={`material-icons ${css.nextIcon}`}>
                    navigate_next
                </span>
            </span>
        </DropdownItem>
    )
}
