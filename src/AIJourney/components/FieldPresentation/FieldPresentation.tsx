import css from './FieldPresentation.less'

interface FieldPresentationProps {
    name: string
    description: string
}

export const FieldPresentation: React.FC<FieldPresentationProps> = ({
    name,
    description,
}) => {
    return (
        <div className={css.fieldPresentation}>
            <div className={css.fieldName}>
                <span>{name}</span>
            </div>
            <div className={css.fieldDescription}>
                <span>{description}</span>
            </div>
        </div>
    )
}
