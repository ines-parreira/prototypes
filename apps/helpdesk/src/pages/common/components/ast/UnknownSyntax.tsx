import { Badge } from '@gorgias/axiom'

type Props = {
    type: string
}

const UnknownSyntax = ({ type }: Props) => (
    <Badge className="unknownstatement" type={'error'}>
        Unknown {type}
    </Badge>
)

export default UnknownSyntax
