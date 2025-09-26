import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

import css from './PlaygroundPreviewHeader.less'

export const PlaygroundPreviewHeader = () => {
    const { data: currentUser } = useGetCurrentUser()
    const customerName = currentUser?.data?.name || 'John Doe'
    const customerInitials = customerName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    return (
        <div className={css.previewHeader}>
            <div className={css.statusBar}>
                9:41
                <div>
                    <i className="material-icons-outlined">wifi</i>
                    <i
                        style={{ transform: 'rotate(90deg)' }}
                        className="material-icons-outlined"
                    >
                        battery_6_bar
                    </i>
                </div>
            </div>
            <div className={css.merchantHeader}>
                <i
                    style={{
                        alignSelf: 'center',
                        fontSize: '20px',
                        position: 'absolute',
                    }}
                    className="material-icons-outlined"
                >
                    keyboard_arrow_left
                </i>
                <div className={css.merchantInfo}>
                    <span className={css.merchantInitials}>
                        {customerInitials}
                    </span>
                    {customerName}
                </div>
            </div>
        </div>
    )
}
