/**
 * API version 1 routes.
 *
 * @author Vanja Maric
 * @version 1.0.0
 */

import express from 'express'
import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import { ImagesController } from '../../../controllers/api/images-controller.js'

export const router = express.Router()

const controller = new ImagesController()

// ------------------------------------------------------------------------------
//  Helpers
// ------------------------------------------------------------------------------

const PermissionLevels = Object.freeze({
  READ: 1,
  CREATE: 2,
  UPDATE: 4,
  DELETE: 8
})

/**
 * Authenticates requests.
 *
 * If authentication is successful, `req.user`is populated and the
 * request is authorized to continue.
 * If authentication fails, an unauthorized response will be sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authenticateJWT = (req, res, next) => {
  try {
    const [authenticationScheme, token] = req.headers.authorization?.split(' ')

    if (authenticationScheme !== 'Bearer') {
      throw new Error('Invalid authentication scheme.')
    }

    const publicKey = Buffer.from(process.env.ACCESS_TOKEN_PUBLIC_KEY, 'base64').toString('utf-8')
    const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'] })
    req.user = {
      username: payload.sub,
      firstName: payload.given_name,
      lastName: payload.family_name,
      email: payload.email,
      permissionLevel: payload.x_permission_level
    }
    next()
  } catch (err) {
    const error = createError(401)
    error.cause = err
    error.message = 'Access token invalid or not provided.'
    next(error)
  }
}

/**
 * Authorize requests.
 *
 * If authorization is successful, that is the user is granted access
 * to the requested resource, the request is authorized to continue.
 * If authentication fails, a forbidden response will be sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @param {number} permissionLevel - ...
 */
const hasPermission = (req, res, next, permissionLevel) => {
  req.user?.permissionLevel & permissionLevel
    ? next()
    : next(createError(403))
}

// ------------------------------------------------------------------------------
//  Routes
// ------------------------------------------------------------------------------

// Provide req.image to the route if :id is present in the route path.
router.param('id', (req, res, next, id) => controller.loadImage(req, res, next, id))

// GET images
router.get('/',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.READ),
  (req, res, next) => controller.findAll(req, res, next)
)

// GET images/:id
router.get('/:id',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.READ),
  (req, res, next) => controller.find(req, res, next)
)

// POST images
router.post('/',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.CREATE),
  (req, res, next) => controller.create(req, res, next)
)

// PUT images/:id
router.put('/:id',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.UPDATE),
  (req, res, next) => controller.updatePut(req, res, next)
)

// PATCH images/:id
router.patch('/:id',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.UPDATE),
  (req, res, next) => controller.updatePatch(req, res, next)
)

// DELETE images/:id
router.delete('/:id',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.DELETE),
  (req, res, next) => controller.delete(req, res, next)
)
