import {useParams} from 'react-router-dom'

export const useHelpCenterIdParam = (): number => {
    const {helpCenterId} = useParams<{helpCenterId: string}>()

    const parsedId = parseInt(helpCenterId, 10)

    if (Number.isNaN(parsedId)) {
        throw new Error('helpCenterId route parameter must be an integer')
    }

    return parsedId
}
