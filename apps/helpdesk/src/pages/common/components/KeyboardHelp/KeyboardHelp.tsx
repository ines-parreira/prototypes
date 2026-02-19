import { useMemo, useState } from 'react'

import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import {
    shortcuts as allShortcuts,
    shortcutManager,
    useShortcuts,
} from '@repo/utils'
import classnames from 'classnames'
import { omit } from 'lodash'

import { LegacyBadge as Badge } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './KeyboardHelp.less'

export default function KeyboardHelp() {
    const [isOpen, setisOpen] = useState(false)
    const hasUIVisionMS1 = useHelpdeskV2MS1Flag()

    const shortcuts = useMemo(() => {
        return hasUIVisionMS1 ? allShortcuts : omit(allShortcuts, 'Infobar')
    }, [hasUIVisionMS1])

    useShortcuts('KeyboardHelp', {
        SHOW_HELP: {
            action: () => toggle(true),
        },
    })

    const toggle = (value: boolean) => {
        setisOpen(value)

        if (value) {
            shortcutManager.pause()
        } else {
            shortcutManager.unpause()
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => toggle(false)}
            className={css.component}
            size="large"
            isScrollable
        >
            <ModalHeader title="Keyboard shortcuts" />
            <ModalBody className={css.content}>
                {Object.keys(shortcuts).map((componentName, i) => {
                    const component = shortcuts[componentName]
                    const actions = component.actions

                    return (
                        <div key={i} className={classnames(css.group, 'mb-4')}>
                            <h3>{component.description}</h3>

                            {Object.keys(actions).map(
                                (actionName: string, j) => {
                                    const action = actions[actionName]

                                    return (
                                        <div key={j} className="mb-2">
                                            <Badge
                                                type="grey"
                                                className={classnames(
                                                    css.combo,
                                                    'mr-2',
                                                )}
                                            >
                                                {shortcutManager.getActionKeys(
                                                    action,
                                                )}
                                            </Badge>

                                            {action.description}
                                        </div>
                                    )
                                },
                            )}
                        </div>
                    )
                })}
            </ModalBody>
        </Modal>
    )
}
