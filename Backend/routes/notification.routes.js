import express from "express";

import {
    sendNotificationController,
    sendBulkNotificationController,

    getMyNotificationsController,
    getMyNotificationByIdController,

    markNotificationAsReadController,
    markAllNotificationsAsReadController,

    deleteMyNotificationController,

    getAllNotificationsController,
    getEmployeeNotificationsController,

    deleteNotificationController
} from "../controllers/notification.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";

import {
    sendNotificationValidator,
    sendBulkNotificationValidator,
    notificationQueryValidator
} from "../validators/notification.validator.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| EMPLOYEE NOTIFICATION ROUTES
|--------------------------------------------------------------------------
*/

/*
| GET /api/notifications/me
| Employee views their notifications
*/

router.get(
    "/me",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    validate(notificationQueryValidator),
    getMyNotificationsController
);

/*
| GET /api/notifications/me/:notificationId
| Employee views a specific notification
*/

router.get(
    "/me/:notificationId",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    getMyNotificationByIdController
);

/*
| PATCH /api/notifications/me/read-all
| Employee marks all notifications as read
*/

router.patch(
    "/me/read-all",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    markAllNotificationsAsReadController
);

/*
| PATCH /api/notifications/me/:notificationId/read
| Employee marks one notification as read
*/

router.patch(
    "/me/:notificationId/read",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    markNotificationAsReadController
);

/*
| DELETE /api/notifications/me/:notificationId
| Employee deletes their own notification
*/

router.delete(
    "/me/:notificationId",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    deleteMyNotificationController
);

/*
|--------------------------------------------------------------------------
| ADMIN NOTIFICATION ROUTES
|--------------------------------------------------------------------------
*/

/*
| POST /api/notifications/employee/:employeeId
| Admin sends notification to one employee
*/

router.post(
    "/employee/:employeeId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(sendNotificationValidator),
    sendNotificationController
);

/*
| POST /api/notifications/bulk
| Admin sends notification to multiple employees
*/

router.post(
    "/bulk",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(sendBulkNotificationValidator),
    sendBulkNotificationController
);

/*
| GET /api/notifications/employee/:employeeId
| Admin views an employee's notifications
*/

router.get(
    "/employee/:employeeId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(notificationQueryValidator),
    getEmployeeNotificationsController
);

/*
| GET /api/notifications
| Admin views all notifications
*/

router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(notificationQueryValidator),
    getAllNotificationsController
);

/*
| DELETE /api/notifications/:notificationId
| Admin deletes a notification
*/

router.delete(
    "/:notificationId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    deleteNotificationController
);

export default router;
