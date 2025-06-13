import css from './FieldPresentation.less'

type FieldPresentationProps = {
    name: string
    description?: string
}

export const FieldPresentation = ({
    name,
    description,
}: FieldPresentationProps) => {
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
