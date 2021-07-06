import React from 'react'
import {Button} from 'reactstrap'

type Props = {
    title: string
    description: string
    buttonText: string
    onClick: () => void
}

export const CreateFirst = ({
    title,
    description,
    buttonText,
    onClick,
}: Props) => {
    return (
        <div>
            <h1>{title}</h1>
            <p>{description}</p>
            <Button onClick={onClick} type="submit" color="success">
                {buttonText}
            </Button>
        </div>
    )
}

export default CreateFirst
