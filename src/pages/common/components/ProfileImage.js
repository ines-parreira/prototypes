import React, {PropTypes} from 'react'
import _split from 'lodash/split'


export default class ProfileImage extends React.Component {
    componentWillMount = () => {
        if (!this.props.isLoading && this.props.email) {
            this.props.fetchUserPicture(this.props.email)
        }
    }

    componentWillReceiveProps = (nextProps) => {
        const shouldReload =
            (!nextProps.pictureObject.get('url') || nextProps.pictureObject.get('email') !== nextProps.email)
            && !nextProps.isLoading
            && !this.props.email && nextProps.email

        if (shouldReload) {
            this.props.fetchUserPicture(nextProps.email)
        }
    }

    _getInitials = (name) => {
        if (!name) {
            return ''
        }

        const splitName = _split(name, ' ').filter(elt => elt.length > 0)

        if (splitName.length > 1) {
            return `${splitName[0][0]}${splitName[1][0]}`
        }

        return splitName[0][0]
    }

    render() {
        const {name, email, pictureObject, isLoading} = this.props

        if (pictureObject.get('url') && pictureObject.get('email') === email && !isLoading) {
            return (
                <img
                    src={pictureObject.get('url')}
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
    name: PropTypes.string,
    email: PropTypes.string,
    pictureObject: PropTypes.object.isRequired,
    isLoading: PropTypes.bool,
    fetchUserPicture: PropTypes.func.isRequired
}
