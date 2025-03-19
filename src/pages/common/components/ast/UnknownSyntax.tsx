import { Badge } from '@gorgias/merchant-ui-kit'

type Props = {
    type: string
}

const UnknownSyntax = ({ type }: Props) => (
    <Badge className="unknownstatement" type={'error'}>
        Unknown {type}
    </Badge>
)

export default UnknownSyntax
