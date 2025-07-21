import { Link, useParams } from 'react-router-dom'

const ChannelsLink = ({
    linkText,
    type,
    id,
}: {
    linkText: string
    type?: string
    id?: number
}) => {
    const { shopType, shopName } = useParams<{
        shopType: string
        shopName: string
    }>()

    return (
        <Link
            to={{
                pathname: `/app/automation/${shopType}/${shopName}/connected-channels`,
                search: `?type=${type}&id=${id}`,
                state: {
                    from: 'workflow-editor',
                },
            }}
        >
            {linkText}
        </Link>
    )
}
export default ChannelsLink
