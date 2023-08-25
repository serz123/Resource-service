/**
 * API version 1 routes.
 *
 * @author Vanja Maric
 * @version 1.0.0
 */

import express from 'express'
import { router as imagesRouter } from './images-router.js'

export const router = express.Router()

router.get('/', (req, res) => res.json({ message: 'Hooray! Welcome to version 1 of this very simple RESTful API!(res)' }))
router.use('/images', imagesRouter)
