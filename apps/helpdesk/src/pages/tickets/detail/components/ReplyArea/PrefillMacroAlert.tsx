import { Button } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import Alert from 'pages/common/components/Alert/Alert'
import Group from 'pages/common/components/layout/Group'
import { getAppliedMacro } from 'state/ticket/selectors'

import css from './PrefillMacroAlert.less'

interface Props {
    onRemoveMacro: () => void
    onKeepMacro: () => void
}

export default function PrefillMacroAlert({
    onRemoveMacro,
    onKeepMacro,
}: Props) {
    const appliedMacro = useAppSelector(getAppliedMacro)

    return (
        <div className={css.component}>
            <Alert className={css.alert}>
                <Group className={css.content}>
                    <p className={css.textInfo}>
                        We pre-selected a macro for you:{' '}
                        <span className={css.macroName}>
                            {appliedMacro?.get('name')}
                        </span>
                    </p>
                    <div className={css.buttonGroup}>
                        <Button
                            onClick={onRemoveMacro}
                            className="p-0"
                            intent="destructive"
                            color="secondary"
                            fillStyle="ghost"
                        >
                            <i className="material-icons pr-1 md-2">delete</i>
                            Remove Macro
                        </Button>
                        <div>
                            <Button
                                onClick={onKeepMacro}
                                className="p-0"
                                color="primary"
                                fillStyle="ghost"
                            >
                                <i className="material-icons-round md-2">
                                    close
                                </i>
                            </Button>
                        </div>
                    </div>
                </Group>
            </Alert>
        </div>
    )
}
