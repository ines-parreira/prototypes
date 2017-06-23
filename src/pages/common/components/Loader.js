import React, {PropTypes} from 'react'

export default class Loader extends React.Component {
    static propTypes = {
        inline: PropTypes.bool.isRequired,
        message: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
    }
    static defaultProps = {
        inline: false,
    }

    render() {
        const {message, inline} = this.props

        return (
            <div className="loader-container">
                <div className="loader-inner">
                    <i className="fa fa-fw fa-circle-o-notch fa-spin" />
                    {
                        !inline && message && (
                            <div className="mt-2">
                                {message}
                            </div>
                        )
                    }
                </div>
            </div>
        )
    }
}
