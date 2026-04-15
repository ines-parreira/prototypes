import type { DisplayTextValue } from '../../../types/display'
import { SingleLineTextCell } from './SingleLineTextCell'

type Props = {
    value: DisplayTextValue
}

export function CustomerCell({ value }: Props) {
    return <SingleLineTextCell value={value} />
}
