const fs = require('fs')
const path = require('path')

const SRC_DIR = 'src/assets/js'
const DEST_DIR = 'build'
const MANIFEST_FILE = path.join(DEST_DIR, 'manifest.json')

// Wildcard pattern for pubnub.worker.(semver).js
const pnRegex = /^pubnub\.worker\..*\.js$/

// Find matching files
const copy = () => {
    const { NODE_ENV } = process.env
    let files = []

    try {
        files = fs.readdirSync(SRC_DIR)
        files = files.filter((file) => pnRegex.test(file))
        files = files.map((file) => path.join(SRC_DIR, file))
    } catch (err) {
        if (err) {
            console.error('Error in file lookup:', err)
            process.exit(1)
        }
    }

    if (files.length > 1) {
        console.error(
            `Error: More than one file matching the pubnub.*.js pattern found in ${SRC_DIR}`,
        )
        process.exit(1)
    } else if (files.length === 0) {
        console.error(
            `No files matching the pubnub.*.js pattern found in ${SRC_DIR}`,
        )
        process.exit(1)
    } else {
        // Copy the file to the destination directory
        const srcFile = files[0]
        const pubnubWorkerFile = path.basename(srcFile)
        const destFileName =
            NODE_ENV === 'production' ? pubnubWorkerFile : 'pubnub.worker.js'
        const destFile = path.join(DEST_DIR, destFileName)
        fs.copyFileSync(srcFile, destFile)
        console.log(`Copied ${srcFile} to ${DEST_DIR}`)

        // Update the manifest file
        if (NODE_ENV === 'production') {
            try {
                const manifest = JSON.parse(
                    fs.readFileSync(MANIFEST_FILE, 'utf8'),
                )
                manifest['pubnubWorker.js'] = destFileName
                fs.writeFileSync(
                    MANIFEST_FILE,
                    JSON.stringify(manifest, null, 2),
                )
                console.log(
                    `Updated ${MANIFEST_FILE} with pubnubWorker: ${pubnubWorkerFile}`,
                )
            } catch (e) {
                console.error('Error updating manifest file:', e)
                process.exit(1)
            }
        }

        process.exit(0)
    }
}

copy()
