const { remote } = require('electron')
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')
const { spawn } = require('child_process')
const EventBus = require('js-event-bus')
const _ = require('lodash')
const gpuInfo = require('gpu-info')
const config = require('./nuxt.config')

const debug = require('debug').default('app:deepTools')

const { app, shell } = remote

/**
 *
 * @param {*} dataURL
 */
function getBase64Data(dataURL) {
  let encoded = dataURL.replace(/^data:(.*;base64,)?/, '')

  if (encoded.length % 4 > 0) {
    encoded += '='.repeat(4 - (encoded.length % 4))
  }

  return encoded
}

/**
 *
 */
window.deepTools = {
  /**
   *
   * @param {*} name
   * @param  {...any} args
   */
  getPath(name, ...args) {
    let folderPath

    if (name === 'base') {
      if (config.dev) {
        folderPath = path.dirname(__dirname)
      } else {
        folderPath = path.dirname(path.dirname(app.getPath('exe')))
      }
    } else {
      folderPath = app.getPath(name)
    }

    return path.join(folderPath, ...args)
  },

  /**
   *
   * @param {*} name
   * @param  {...any} args
   */
  getBasePath(...args) {
    return this.getPath('base', ...args)
  },

  /**
   *
   */
  getGpusList() {
    return gpuInfo()
  },

  /**
   *
   * @param {*} dirPath
   */
  shellOpenItem(dirPath) {
    return shell.openItem(dirPath)
  },

  /**
   *
   * @param {*} path
   */
  shellOpenExternal(path) {
    return shell.openExternal(path)
  },

  /**
   *
   * @param {*} filePath
   */
  getValidationErrorMessage(filePath) {
    if (!fs.existsSync(filePath)) {
      return 'Apparently the file does not exist anymore!'
    }

    const mimetype = mime.lookup(filePath)
    const stats = fs.statSync(filePath)
    const filesize = stats.size / 1000000.0

    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      return 'The selected file is not a valid photo. Only JPEG or PNG.'
    }

    if (filesize > 5) {
      return 'The selected file is big, this can generate problems. Maximum size: 5MB'
    }

    return null
  },

  /**
   *
   * @param {*} filepath
   */
  getFileAsDataURL(filepath) {
    const mimetype = mime.lookup(filepath)
    const data = fs.readFileSync(filepath, { encoding: 'base64' })

    return `data:${mimetype};base64,${data}`
  },

  /**
   *
   * @param {*} dataURL
   * @param {*} absolutePath
   */
  saveDataURLFile(dataURL, absolutePath) {
    const data = getBase64Data(dataURL)
    return fs.writeFileSync(absolutePath, data, 'base64')
  },

  /**
   *
   * @param {*} absolutePath
   */
  fsExists(absolutePath) {
    return fs.existsSync(absolutePath)
  },

  getCliDirPath() {
    return this.getBasePath('cli')
  },

  /**
   *
   * @param {*} modelPhoto
   * @param {*} useGpus
   * @param {*} useWaifu TODO
   */
  transform(modelPhoto, useGpus = false, useWaifu = false) {
    if (!useGpus) {
      useWaifu = false
    }

    const cliDirPath = this.getCliDirPath()
    const inputFilePath = modelPhoto.getCroppedFilePath()
    const outputFilePath = modelPhoto.getOutputFilePath()

    if (!fs.existsSync(cliDirPath)) {
      throw new Error(
        `We could not find the CLI folder!\n
        This can be caused by a corrupt installation, make sure that the CLI folder exists in:\n
        ${cliDirPath}`
      )
    }

    if (!fs.existsSync(inputFilePath)) {
      throw new Error(
        `We could not find the cropped photo!\n
        This may mean that ${config.env.APP_NAME} does not have permissions to write in the models folder, please make sure that the following folder exists:\n
        ${inputFilePath}`
      )
    }

    const cliArgs = ['--input', inputFilePath, '--output', outputFilePath]

    if (config.dev) {
      cliArgs.unshift('main.py')
    }

    if (!useGpus) {
      cliArgs.push('--cpu')
    } else {
      for (const id of useGpus) {
        cliArgs.push(`--gpu`)
        cliArgs.push(id)
      }
    }

    debug('The transformation process has begun!', {
      cliDirPath,
      inputFilePath,
      outputFilePath,
      cliArgs
    })

    const bus = new EventBus()

    let child

    if (config.dev) {
      child = spawn('python', cliArgs, {
        cwd: cliDirPath
      })
    } else {
      child = spawn('./cli', cliArgs, {
        cwd: cliDirPath
      })
    }

    child.on('error', error => {
      debug(error)
      bus.emit('error', null, error)
    })

    child.stdout.on('data', data => {
      debug(`stdout: ${data}`)
      bus.emit('stdout', null, data)
    })

    child.stderr.on('data', data => {
      debug(`stderr: ${data}`)
      bus.emit('stderr', null, data)
    })

    child.on('close', code => {
      debug(`CLI process exited with code ${code}`)
      bus.emit('ready', null, code)
    })

    return bus
  }
}
