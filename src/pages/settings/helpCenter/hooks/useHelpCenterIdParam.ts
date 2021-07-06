import {useParams} from 'react-router-dom'

export const useHelpCenterIdParam = (): number => {
    const {helpcenterId} = useParams<{helpcenterId: string}>()

    const parsedId = parseInt(helpcenterId, 10)

    if (Number.isNaN(parsedId)) {
        throw new Error('helpcenterId route parameter must be an integer')
    }

    return parsedId
}
