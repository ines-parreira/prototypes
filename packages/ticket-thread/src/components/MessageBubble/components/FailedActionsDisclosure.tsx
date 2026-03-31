import {
    Disclosure,
    DisclosureHeader,
    DisclosurePanel,
    Text,
    TextVariant,
} from '@gorgias/axiom'

import { stripErrorMessage } from '../../../utils/stripErrorMessage'
import type { MessageErrorAction } from './utils/messageErrorActions'

import css from './FailedActionsDisclosure.less'

type FailedActionsDisclosureProps = {
    actions: MessageErrorAction[]
}

export function FailedActionsDisclosure({
    actions,
}: FailedActionsDisclosureProps) {
    if (actions.length === 0) {
        return null
    }

    return (
        <Disclosure>
            <DisclosureHeader
                title={
                    <Text variant={TextVariant.Bold} size="sm">
                        Find out why?
                    </Text>
                }
            />
            <DisclosurePanel pt="sm">
                <ul className={css.failedActions}>
                    {actions.map((action, index) => (
                        <li key={`${action.name}-${index}`}>
                            <Text size="sm">
                                The action <b>{getActionLabel(action)}</b>{' '}
                                failed because{' '}
                                <b>
                                    {stripErrorMessage(
                                        action.response?.msg ?? '',
                                    )}
                                </b>
                                .
                            </Text>
                        </li>
                    ))}
                </ul>
            </DisclosurePanel>
        </Disclosure>
    )
}

function getActionLabel(action: MessageErrorAction): string {
    return action.title || action.name || ''
}
