import {
    sendNotification,
    sendBulkNotification,
    getMyNotifications,
    getMyNotificationById,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteMyNotification,
    getAllNotifications,
    getEmployeeNotifications,
    deleteNotification
} from "../services/notification.service.js";

import {
    successResponse
} from "../utils/response.js";

/*
|--------------------------------------------------------------------------
| Send Notification To Employee
|--------------------------------------------------------------------------
| POST /api/notifications/employee/:employeeId
| ADMIN only
|--------------------------------------------------------------------------
*/

const sendNotificationController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                employeeId
            } = req.params;

            const {
                title,
                message,
                type,
                sendEmail
            } = req.body;

            const notification =
                await sendNotification({
                    employeeId,

                    title,

                    message,

                    type,

                    sendEmail,

                    sentBy:
                        req.user.id
                });

            return successResponse(
                res,
                201,
                "Notification sent successfully",
                notification
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Send Bulk Notification
|--------------------------------------------------------------------------
| POST /api/notifications/bulk
| ADMIN only
|--------------------------------------------------------------------------
*/

const sendBulkNotificationController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                employeeIds,
                title,
                message,
                type,
                sendEmail
            } = req.body;

            const result =
                await sendBulkNotification({
                    employeeIds,

                    title,

                    message,

                    type,

                    sendEmail,

                    sentBy:
                        req.user.id
                });

            return successResponse(
                res,
                201,
                "Notifications sent successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get My Notifications
|--------------------------------------------------------------------------
| GET /api/notifications/me
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const getMyNotificationsController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                page,
                limit,
                type,
                isRead
            } = req.query;

            const result =
                await getMyNotifications({
                    userId:
                        req.user.id,

                    page,

                    limit,

                    type,

                    isRead
                });

            return successResponse(
                res,
                200,
                "Notifications fetched successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get My Notification By ID
|--------------------------------------------------------------------------
| GET /api/notifications/me/:notificationId
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const getMyNotificationByIdController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                notificationId
            } = req.params;

            const notification =
                await getMyNotificationById({
                    userId:
                        req.user.id,

                    notificationId
                });

            return successResponse(
                res,
                200,
                "Notification fetched successfully",
                notification
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Mark Notification As Read
|--------------------------------------------------------------------------
| PATCH /api/notifications/me/:notificationId/read
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const markNotificationAsReadController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                notificationId
            } = req.params;

            const notification =
                await markNotificationAsRead({
                    userId:
                        req.user.id,

                    notificationId
                });

            return successResponse(
                res,
                200,
                "Notification marked as read",
                notification
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Mark All Notifications As Read
|--------------------------------------------------------------------------
| PATCH /api/notifications/me/read-all
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const markAllNotificationsAsReadController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const result =
                await markAllNotificationsAsRead(
                    req.user.id
                );

            return successResponse(
                res,
                200,
                "All notifications marked as read",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Delete My Notification
|--------------------------------------------------------------------------
| DELETE /api/notifications/me/:notificationId
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const deleteMyNotificationController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                notificationId
            } = req.params;

            const result =
                await deleteMyNotification({
                    userId:
                        req.user.id,

                    notificationId
                });

            return successResponse(
                res,
                200,
                "Notification deleted successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get All Notifications
|--------------------------------------------------------------------------
| GET /api/notifications
| ADMIN only
|--------------------------------------------------------------------------
*/

const getAllNotificationsController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                page,
                limit,
                employeeId,
                type,
                isRead
            } = req.query;

            const result =
                await getAllNotifications({
                    page,

                    limit,

                    employeeId,

                    type,

                    isRead
                });

            return successResponse(
                res,
                200,
                "Notifications fetched successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get Employee Notifications
|--------------------------------------------------------------------------
| GET /api/notifications/employee/:employeeId
| ADMIN only
|--------------------------------------------------------------------------
*/

const getEmployeeNotificationsController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                employeeId
            } = req.params;

            const {
                page,
                limit,
                type,
                isRead
            } = req.query;

            const result =
                await getEmployeeNotifications({
                    employeeId,

                    page,

                    limit,

                    type,

                    isRead
                });

            return successResponse(
                res,
                200,
                "Employee notifications fetched successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Delete Notification
|--------------------------------------------------------------------------
| DELETE /api/notifications/:notificationId
| ADMIN only
|--------------------------------------------------------------------------
*/

const deleteNotificationController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                notificationId
            } = req.params;

            const result =
                await deleteNotification(
                    notificationId
                );

            return successResponse(
                res,
                200,
                "Notification deleted successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
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
};