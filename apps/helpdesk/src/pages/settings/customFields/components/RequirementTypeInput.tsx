import { Link } from 'react-router-dom'

import { LegacyLabel as Label } from '@gorgias/axiom'

import { RequirementType } from 'custom-fields/types'
import { PreviewRadioButton } from 'pages/common/components/PreviewRadioButton'
import css from 'pages/settings/customFields/components/RequirementTypeInput.less'

interface RequirementTypeInputProps {
    className?: string
    value?: RequirementType
    onChange: (value: RequirementType) => void
}

export default function RequirementTypeInput(props: RequirementTypeInputProps) {
    return (
        <div className={props.className}>
            <Label className={css.label}>Field visibility</Label>
            <p className="mb-2">
                Configure fields to always appear, or only when specific
                conditions are met. See conditional visibility of Optional or
                Required within conditions settings page.
            </p>
            <p className="mb-4">
                <a
                    className="d-block"
                    href="https://link.gorgias.com/gx3"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i className="material-icons mr-1">menu_book</i>
                    How to Set up Ticket Fields
                </a>
                <a
                    className="d-block"
                    href="https://link.gorgias.com/ylm"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i className="material-icons mr-1">menu_book</i>
                    Learn more about field visibility
                </a>
            </p>

            <div className={css.radioBoxList}>
                <PreviewRadioButton
                    value="visible"
                    className={css.radioBox}
                    isSelected={!props.value || props.value === 'visible'}
                    label="Always optional"
                    caption="Field is always visible to agent, not required to close ticket. Ignores all conditions."
                    onClick={() => props.onChange('visible')}
                />
                <PreviewRadioButton
                    value="required"
                    className={css.radioBox}
                    isSelected={props.value === 'required'}
                    label="Always required"
                    caption="Field is always visible to agent, and mandatory to close ticket. Ignores all conditions."
                    onClick={() => props.onChange('required')}
                />
                <PreviewRadioButton
                    value="conditional"
                    className={css.radioBox}
                    isSelected={props.value === 'conditional'}
                    label="Conditionally visible"
                    caption={
                        <>
                            <p className="mt-1 mb-0">
                                Display to agents only when conditions are met.
                                <br />
                                <Link to="/app/settings/ticket-field-conditions">
                                    Go to field conditions
                                </Link>
                            </p>
                        </>
                    }
                    onClick={() => props.onChange('conditional')}
                />
            </div>
        </div>
    )
}
