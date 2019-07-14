import Vue from 'vue'
import _ from 'lodash'
import moment from 'moment'

class Nudity {
  constructor() {
    this.reset()
  }

  getModel() {
    return this.model
  }

  setModel(value) {
    this.model = value
    return this
  }

  getModelPhoto(value) {
    this.modelPhoto = value
  }

  setModelPhoto(value) {
    this.modelPhoto = value
  }

  hasModelPhoto() {
    return !_.isNil(this.modelPhoto)
  }

  start(photo, model = null) {
    this.setModel(model)
    this.setModelPhoto(photo)
  }

  reset() {
    this.model = undefined
    this.modelPhoto = undefined

    this.transformationDuration = 0
    this.transformationStart = undefined
  }

  async transform(useGpus = false, useWaifu = false, enablePubes = false) {
    this.transformationStart = moment()

    const durationFunc = () => {
      this.transformationDuration = moment().diff(
        this.transformationStart,
        'seconds'
      )
    }

    const durationInterval = setInterval(durationFunc, 1000)
    durationFunc()

    try {
      await this.modelPhoto.transform(useGpus, useWaifu, enablePubes)
    } catch (error) {
      throw error
    } finally {
      clearInterval(durationInterval)
    }
  }
}

export default new Nudity()
