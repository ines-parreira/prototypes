import React, {PropTypes} from 'react'
import css from './CampaignPreview.less'


export default class CampaignPreview extends React.Component {
    static propTypes = {
        html: PropTypes.string,
        authorName: PropTypes.string,
        authorAvatarUrl: PropTypes.string,

        mainColor: PropTypes.string
    }

    render() {
        const {
            html,
            authorName,
            authorAvatarUrl,
            mainColor,
        } = this.props

        const _bgColor = (color) => ({backgroundColor: color})

        return (
            <div className={css.preview}>
                <div className={css.titlebar}/>
                <div className={css.campaign}>
                    <div className={css.header}>
                        <div className={css.author}>
                            <img src={authorAvatarUrl || 'https://www.gravatar.com/avatar/0?d=mm'}/>
                        </div>
                        <div className={css.message}>
                            <div>
                                <b>{authorName || '[Random agent\'s name]'}</b>
                            </div>
                            <div dangerouslySetInnerHTML={{__html: html}}/>
                        </div>
                    </div>
                    <div className={css.footer}>
                        Click to reply
                    </div>
                </div>

                <div
                    className={css.button}
                    style={_bgColor(mainColor)}
                >
                    <img className={css.icon} src={`${window.GORGIAS_ASSETS_URL || ''}/static/private/img/icons/DefaultCloseIcon.svg`}/>
                </div>
            </div>
        )
    }
}
