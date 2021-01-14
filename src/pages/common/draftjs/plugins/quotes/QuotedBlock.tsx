import React, {ComponentProps, FC} from 'react'

const QuoteLevel: FC = ({children}: ComponentProps<FC>) => {
    return (
        <blockquote
            className="gorgias_quote"
            style={{
                margin: '0 0 0 .8ex',
                borderLeft: '1px #ccc solid',
                paddingLeft: '1ex',
            }}
        >
            {children}
        </blockquote>
    )
}

type Props = {
    depth: number
}

const QuotedBlock: FC<Props> = ({children, depth}) => {
    let element = children

    for (let i = 0; i < depth; i++) {
        element = <QuoteLevel>{element}</QuoteLevel>
    }

    if (!React.isValidElement(element)) {
        return <div />
    }

    return element
}

export default QuotedBlock
