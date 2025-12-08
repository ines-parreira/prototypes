import { useId } from '@repo/hooks'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import css from './FieldPresentation.less'

type FieldPresentationProps = {
    name: string
    description?: string
    tooltip?: string
    optional?: boolean
    required?: boolean
}

export const FieldPresentation = ({
    name,
    description,
    tooltip,
    optional = false,
    required = false,
}: FieldPresentationProps) => {
    const id = useId()
    return (
        <div className={css.fieldPresentation}>
            <div className={css.fieldName}>
                <span>{name}</span>
                {required && (
                    <span className={css.requiredDecorator}>*</span>
                )}{' '}
                {optional && (
                    <span className={css.optionalDecorator}>(optional)</span>
                )}
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
