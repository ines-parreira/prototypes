import type { Map } from 'immutable'

import { Text } from '@gorgias/axiom'

type Props = {
    chat: Map<any, any>
}

export const ChatCell = ({ chat }: Props) => {
    return (
        <Text size="md" variant="medium">
            {chat.get('name')}
        </Text>
    )
}
