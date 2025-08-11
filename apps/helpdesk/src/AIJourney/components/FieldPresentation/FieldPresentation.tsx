import { useId } from '@repo/hooks'

import { Tooltip } from '@gorgias/axiom'

import css from './FieldPresentation.less'

type FieldPresentationProps = {
    name: string
    description?: string
    tooltip?: string
}

export const FieldPresentation = ({
    name,
    description,
    tooltip,
}: FieldPresentationProps) => {
    const id = useId()
    return (
        <div className={css.fieldPresentation}>
            <div className={css.fieldName}>
                <span>{name}</span>
                {tooltip && (
                    <>
                        {' '}
                        <span id={`tooltip_${id}`} className={css.tooltipIcon}>
                            <i className="material-icons-outlined">info</i>
                        </span>
                        <Tooltip target={`tooltip_${id}`}>{tooltip}</Tooltip>
                    </>
                )}
            </div>
            {!!description && (
                <div className={css.fieldDescription}>
                    <span>{description}</span>
                </div>
            )}
        </div>
    )
}
