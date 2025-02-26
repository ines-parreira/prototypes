/* eslint-disable no-console */
import { exec } from 'child_process'
import chokidar from 'chokidar'
import path from 'path'

// Configuration
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']
const COMMAND = 'yarn oxlint --fix'
const ROOT_DIR = process.cwd()

/**
 * Get files that have been changed according to Git and run oxlint on them
 */
function lintGitChangedFiles() {
    exec('git status --porcelain', (error, stdout) => {
        if (error) {
            console.error(`Error getting git status: ${error.message}`)
            return
        }

        const changedFiles = stdout
            .split('\n')
            .filter(Boolean)
            .filter(
                (line) =>
                    !line.startsWith('D ') &&
                    !line.startsWith(' D') &&
                    line.charAt(0) !== 'D',
            )
            // Cleanup the line to remove the status and just get the path
            .map((line) => line.substring(3))
            .filter((file) => EXTENSIONS.some((ext) => file.endsWith(ext)))

        if (changedFiles.length === 0) {
            console.log('No Git changed files to lint')
            return
        }

        // Create a command that includes all changed files
        const filesString = changedFiles.map((file) => `"${file}"`).join(' ')

        const cmd = `${COMMAND} ${filesString}`

        console.log(
            `\n🔍 Running oxlint on ${changedFiles.length} Git changed files...`,
        )
        exec(cmd, (execError, execStdout) => {
            if (execError) {
                console.log(execStdout)
                return
            }
            console.log(`✅ ${execStdout || 'Command executed successfully'}`)
        })
    })
}

/**
 * Run the linting command on a specific file
 */
function runCommand(specificFile: string) {
    console.log(
        `\n🔍 Running oxlint on ${path.relative(ROOT_DIR, specificFile)}...`,
    )

    const cmd = `${COMMAND} "${specificFile}"`

    exec(cmd, (error, stdout) => {
        if (error) {
            console.log(stdout)
            return
        }
        console.log(`✅ ${stdout || 'Command executed successfully'}`)
    })
}

// Set up file watching
const watchPatterns = path.join(ROOT_DIR, `**/*{${EXTENSIONS.join(',')}}`)

console.log('🚀 Starting oxlint watch mode...')
const watcher = chokidar.watch(watchPatterns, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
})

// Run initial lint on Git changed files
lintGitChangedFiles()

// Add event listeners
watcher
    .on('ready', () => {
        console.log(`👀 Watching for changes in: ${ROOT_DIR}`)
    })
    .on('change', (filePath) => {
        const relativePath = path.relative(ROOT_DIR, filePath)
        console.log(`📝 File changed: ${relativePath}`)
        runCommand(filePath) // Lint the changed file
    })
    .on('error', (error) => console.error(`❌ Watcher error: ${error}`))
