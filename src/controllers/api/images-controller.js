/**
 * Module for the ImagesController.
 *
 * @author Vanja Maric
 * @version 1.0.0
 */

import createError from 'http-errors'
import { Image } from '../../models/image.js'

/**
 * Encapsulates a controller.
 */
export class ImagesController {
  /**
   * Provide req.image to the route if :id is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The value of the id for the image to load.
   */
  async loadImage (req, res, next, id) {
    try {
      // Get the image.
      const image = await Image.findById(id)
      // If no image found send a 404 (Not Found).
      if (!image) {
        next(createError(404))
        return
      }

      // Provide the image to req.
      req.image = image

      // Next middleware.
      next()
    } catch (error) {
      error.status = 404
      error.message = 'The requested resource was not found.'
      next(error)
    }
  }

  /**
   * Sends a JSON response containing a image.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async find (req, res, next) {
    res.json(req.image)
  }

  /**
   * Sends a JSON response containing all images.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async findAll (req, res, next) {
    try {
      const images = await Image.find()

      res.json(images)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Creates new image.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async create (req, res, next) {
    try {
      const url = 'https://courselab.lnu.se/picture-it/images/api/v1/images'
      // Validate
      if (!req.body.data || !req.body.contentType) {
        throw createError(400, 'The request cannot or will not be processed due to something that is perceived to be a client error (for example validation error).')
      }
      const data = {
        data: req.body.data,
        contentType: req.body.contentType
      }
      const customHeaders = {
        'Content-Type': 'application/json',
        'X-API-Private-Token': process.env.X_API_Private_Token
      }
      const response = await fetch(url, {
        method: 'POST',
        headers: customHeaders,
        body: JSON.stringify(data)
      })

      if (response.status === 400) {
        const validationError = new Error('Validation Error')
        validationError.name = 'ValidationError'
        throw validationError
      }
      const responseData = await response.json()

      const image = new Image({
        imageUrl: responseData.imageUrl,
        location: req.body.location,
        description: req.body.description
      })
      await image.save()

      res
        .status(201)
        .json(image)
    } catch (error) {
      let err = error
      if (error.name === 'ValidationError') {
        // Validation error(s).
        err = createError(400)
        err.message = 'The request cannot or will not be processed due to something that is perceived to be a client error (for example validation error).'
        err.cause = error
      }
      next(err)
    }
  }

  /**
   * Getting all saved images.
   *
   * @returns {Promise<undefined>}
   */
  async fetchImageData () {
    try {
      const url = 'https://courselab.lnu.se/picture-it/images/api/v1/images'
      const customHeaders = {
        'Content-Type': 'application/json',
        'X-API-Private-Token': process.env.X_API_Private_Token
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: customHeaders
      })

      return response.json()
    } catch (error) {
    }
  }

  /**
   * Updates a specific image.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async updatePut (req, res, next) {
    try {
      // Validate
      if (!req.body.data || !req.body.contentType) {
        throw createError(400, 'The request cannot or will not be processed due to something that is perceived to be a client error (for example validation error).')
      }
      const responseAllData = await this.fetchImageData()
      const targetImageUrl = req.image.imageUrl
      let targetId = null
      // Loop through the responseData array to find the object with the matching imageUrl
      responseAllData.forEach((item) => {
        if (item.imageUrl === targetImageUrl) {
          targetId = item.id
        }
      })
      const urlPUT = `https://courselab.lnu.se/picture-it/images/api/v1/images/${targetId}`
      const data = {
        data: req.body.data,
        contentType: req.body.contentType
      }
      const customHeadersPUT = {
        'Content-Type': 'application/json',
        'X-API-Private-Token': process.env.X_API_Private_Token
      }
      const response2 = await fetch(urlPUT, {
        method: 'PUT',
        headers: customHeadersPUT,
        body: JSON.stringify(data)
      })
      if (response2.status === 400) {
        const validationError = new Error('Validation Error')
        validationError.name = 'ValidationError'
        validationError.status = 400
        validationError.message = 'The request cannot or will not be processed due to something that is perceived to be a client error (for example validation error).'
        throw validationError
      }
      req.image.description = req.body.description
      req.image.location = req.body.location
      await req.image.save()
      res
        .status(204)
        .end()
    } catch (error) {
      let err = error
      if (error.name === 'ValidationError') {
        // Validation error(s).
        err = createError(400)
        err.message = 'The request cannot or will not be processed due to something that is perceived to be a client error (for example validation error).'
        err.cause = error
      }
      next(error)
    }
  }

  /**
   * Updates partially a specific image.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async updatePatch (req, res, next) {
    try {
      const responseData = await this.fetchImageData()
      const targetImageUrl = req.image.imageUrl
      let targetId = null
      // Loop through the responseData array to find the object with the matching imageUrl
      responseData.forEach((item) => {
        if (item.imageUrl === targetImageUrl) {
          targetId = item.id
        }
      })
      if (req.body.location) {
        req.image.location = req.body.location
      }
      if (req.body.description) {
        req.image.description = req.body.description
      }
      if (req.body.data || req.body.contentType) {
        const urlPATCH = `https://courselab.lnu.se/picture-it/images/api/v1/images/${targetId}`
        const data = {}
        if (req.body.data) {
          data.data = req.body.data
        }
        if (req.body.contentType) {
          data.contentType = req.body.contentType
        }
        const customHeadersPATCH = {
          'Content-Type': 'application/json',
          'X-API-Private-Token': process.env.X_API_Private_Token
        }
        const response2 = await fetch(urlPATCH, {
          method: 'PATCH',
          headers: customHeadersPATCH,
          body: JSON.stringify(data)
        })
        if (response2.status === 400) {
          const validationError = new Error('Validation Error')
          validationError.name = 'ValidationError'
          validationError.status = 400
          validationError.message = 'The request cannot or will not be processed due to something that is perceived to be a client error (for example validation error).'
          throw validationError
        }
      }
      await req.image.save()
      res
        .status(204)
        .end()
    } catch (error) {
      let err = error
      if (error.name === 'ValidationError') {
        // Validation error(s).
        err = createError(400)
        err.message = 'The request cannot or will not be processed due to something that is perceived to be a client error (for example validation error).'
        err.cause = error
      }
      next(error)
    }
  }

  /**
   * Deletes the specified image.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async delete (req, res, next) {
    try {
      const url = 'https://courselab.lnu.se/picture-it/images/api/v1/images'
      const customHeaders = {
        'Content-Type': 'application/json',
        'X-API-Private-Token': process.env.X_API_Private_Token
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: customHeaders
      })

      const responseData = await response.json()
      const targetImageUrl = req.image.imageUrl
      let targetId = null
      // Loop through the responseData array to find the object with the matching imageUrl
      responseData.forEach((item) => {
        if (item.imageUrl === targetImageUrl) {
          targetId = item.id
        }
      })
      const urlDELETE = `https://courselab.lnu.se/picture-it/images/api/v1/images/${targetId}`
      const data = {
        data: req.body.data,
        contentType: req.body.contentType
      }
      const customHeadersPUT = {
        'Content-Type': 'application/json',
        'X-API-Private-Token': process.env.X_API_Private_Token
      }
      await fetch(urlDELETE, {
        method: 'DELETE',
        headers: customHeadersPUT,
        body: JSON.stringify(data)
      })
      await req.image.deleteOne()
      res
        .status(204)
        .end()
    } catch (error) {
      next(error)
    }
  }
}
