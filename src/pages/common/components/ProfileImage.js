import React, {PropTypes} from 'react'
import _split from 'lodash/split'


export default class ProfileImage extends React.Component {
    componentWillMount = () => {
        if (!this.props.isLoading && this.props.email) {
            this.props.fetchUserPicture(this.props.email)
        }
    }

    componentWillReceiveProps = (nextProps) => {
        if (!this.props.url && !this.props.isLoading && !this.props.email && nextProps.email) {
            this.props.fetchUserPicture(nextProps.email)
        }
    }

    _getInitials = (name) => {
        if (!name) {
            return ''
        }

        const splittedName = _split(name, ' ').filter(elt => elt.length > 0)

        if (splittedName.length > 1) {
            return `${splittedName[0][0]}${splittedName[1][0]}`
        }

        return splittedName[0][0]
    }

    render() {
        const {name, url, isLoading} = this.props

        if (url && !isLoading) {
            return (
                <img
                    src={url}
                    alt="profile"
                />
            )
        }

        return (
            <div className="initials">
                {!isLoading && this._getInitials(name)}
            </div>
        )
    }
}

ProfileImage.propTypes = {
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    url: PropTypes.string,
    isLoading: PropTypes.bool,
    fetchUserPicture: PropTypes.func.isRequired
}
