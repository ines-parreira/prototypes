import classnames from 'classnames'

import { LegacyButton as Button, Label } from '@gorgias/axiom'

import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Caption from 'pages/common/forms/Caption/Caption'

import WorkflowVisualBuilder from './visualBuilder/WorkflowVisualBuilder'

import css from './ActionsPlatformTemplateSteps.less'

type Props = {
    error?: string
    onEditSteps: () => void
}

const ActionsPlatformTemplateSteps = ({ error, onEditSteps }: Props) => {
    return (
        <div>
            <Label isRequired className={css.label}>
                Action steps
            </Label>
            <div className={css.description}>
                Add one or more steps with your 3rd party apps to perform the
                Action.
            </div>
            <div
                className={classnames(css.steps, {
                    [css.isErrored]: !!error,
                })}
            >
                <WorkflowVisualBuilder isMiniMapHidden isDisabled />
                <Button
                    intent="secondary"
                    onClick={onEditSteps}
                    className={css.editStepsButton}
                >
                    <ButtonIconLabel icon="edit">Edit</ButtonIconLabel>
                </Button>
            </div>
            {!!error && <Caption error={error} />}
        </div>
    )
}

export default ActionsPlatformTemplateSteps
