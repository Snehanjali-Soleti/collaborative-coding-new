import {Router} from 'express';
import {body} from 'express-validator';
import * as projectController from '../controllers/project.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.post('/create', 
    authMiddleware.authUser,
    body('name').isString().withMessage('Name is required'),projectController.createProject
)
router.get('/all',
    authMiddleware.authUser,
    projectController.getAllProject
)
router.put('/add-user',
    authMiddleware.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({min: 1}).withMessage('Users must be an array')
    .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
    projectController.addUserToProject
)

router.get('/get-project/:roomId',
    authMiddleware.authUser,
    projectController.getProjectId
)

router.get('/check-room/:roomId', 
    authMiddleware.authUser,
    projectController.checkRoomId
);


router.post('/join',authMiddleware.authUser,projectController.joinProject);


router.put('/update/:roomId',
    authMiddleware.authUser,
    projectController.updateCode
);

export default router;
