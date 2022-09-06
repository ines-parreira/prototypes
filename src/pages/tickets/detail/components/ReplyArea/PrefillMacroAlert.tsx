import React from 'react'
import Alert from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import Group from 'pages/common/components/layout/Group'
import {getAppliedMacro} from 'state/ticket/selectors'
import useAppSelector from 'hooks/useAppSelector'

import css from './PrefillMacroAlert.less'

interface Props {
    onRemoveMacro: () => void
    onKeepMacro: () => void
}

export default function PrefillMacroAlert({onRemoveMacro, onKeepMacro}: Props) {
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
                            <i className="material-icons pr-1">close</i>
                            Remove Macro
                        </Button>
                        <Button
                            onClick={onKeepMacro}
                            className="p-0"
                            color="primary"
                            fillStyle="ghost"
                        >
                            <i className="material-icons pr-1">done</i>
                            Keep Macro
                        </Button>
                    </div>
                </Group>
            </Alert>
        </div>
    )
}
