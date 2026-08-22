import Notification from "../models/Notification.js";
import Employee from "../models/Employee.js";

/*
|--------------------------------------------------------------------------
| Notification Types
|--------------------------------------------------------------------------
*/

const NOTIFICATION_TYPES = {
    GENERAL: "general",
    LEAVE: "leave",
    PAYROLL: "payroll",
    ATTENDANCE: "attendance",
    PROFILE: "profile",
    SYSTEM: "system"
};

/*
|--------------------------------------------------------------------------
| Notification Priorities
|--------------------------------------------------------------------------
*/

const NOTIFICATION_PRIORITIES = {
    LOW: "low",
    NORMAL: "normal",
    HIGH: "high"
};

/*
|--------------------------------------------------------------------------
| Normalize Employee ID
|--------------------------------------------------------------------------
*/

const normalizeEmployeeId = (
    employeeId
) => {
    return employeeId
        ?.trim()
        .toUpperCase();
};

/*
|--------------------------------------------------------------------------
| Get Employee
|--------------------------------------------------------------------------
*/

const getEmployee = async (
    employeeId
) => {
    const employee =
        await Employee.findOne({
            employeeId:
                normalizeEmployeeId(
                    employeeId
                )
        }).populate({
            path: "user",
            select:
                "email role isActive"
        });

    if (!employee) {
        throw new Error(
            "Employee not found"
        );
    }

    return employee;
};

/*
|--------------------------------------------------------------------------
| Create Notification
|--------------------------------------------------------------------------
|
| Internal function used by:
|
| - leave.service.js
| - payroll.service.js
| - attendance.service.js
| - admin notification workflow
|
|--------------------------------------------------------------------------
*/

const createNotification = async ({
    employeeId,
    type = NOTIFICATION_TYPES.GENERAL,
    title,
    message,
    priority = NOTIFICATION_PRIORITIES.NORMAL,
    metadata = {},
    sentBy,
    adminId
}) => {
    if (!employeeId) {
        throw new Error(
            "Employee ID is required"
        );
    }

    if (!title || !title.trim()) {
        throw new Error(
            "Notification title is required"
        );
    }

    if (!message || !message.trim()) {
        throw new Error(
            "Notification message is required"
        );
    }

    /*
     * Make sure employee exists.
     */
    const employee =
        await getEmployee(
            employeeId
        );

    /*
     * Create notification.
     */
    const notification =
        await Notification.create({
            sender: sentBy || adminId || employee.user?._id || employee._id,
            recipient: employee._id,
            recipientEmployeeId: employee.employeeId,
            employeeId:
                employee.employeeId,

            type,

            title:
                title.trim(),

            message:
                message.trim(),

            priority,

            metadata,

            read: false
        });

    return notification;
};

/*
|--------------------------------------------------------------------------
| Admin Send Notification
|--------------------------------------------------------------------------
|
| Admin -> One Employee
|
*/

const sendToEmployee = async ({
    employeeId,
    title,
    message,
    type = NOTIFICATION_TYPES.GENERAL,
    priority = NOTIFICATION_PRIORITIES.NORMAL,
    metadata = {},
    sentBy,
    adminId
}) => {
    return createNotification({
        employeeId,
        title,
        message,
        type,
        priority,
        metadata,
        sentBy,
        adminId
    });
};

/*
|--------------------------------------------------------------------------
| Admin Send Notification To Multiple Employees
|--------------------------------------------------------------------------
|
| Admin -> Multiple Employees
|
*/

const sendToEmployees = async ({
    employeeIds,
    title,
    message,
    type = NOTIFICATION_TYPES.GENERAL,
    priority = NOTIFICATION_PRIORITIES.NORMAL,
    metadata = {}
}) => {
    if (
        !Array.isArray(employeeIds) ||
        employeeIds.length === 0
    ) {
        throw new Error(
            "At least one employee ID is required"
        );
    }

    if (!title || !title.trim()) {
        throw new Error(
            "Notification title is required"
        );
    }

    if (!message || !message.trim()) {
        throw new Error(
            "Notification message is required"
        );
    }

    /*
     * Normalize and remove duplicates.
     */
    const normalizedEmployeeIds = [
        ...new Set(
            employeeIds
                .map(
                    normalizeEmployeeId
                )
                .filter(Boolean)
        )
    ];

    /*
     * Verify employees.
     */
    const employees =
        await Employee.find({
            employeeId: {
                $in:
                    normalizedEmployeeIds
            }
        }).select(
            "employeeId"
        );

    if (
        employees.length !==
        normalizedEmployeeIds.length
    ) {
        throw new Error(
            "One or more employees were not found"
        );
    }

    /*
     * Create notifications.
     */
    const notifications =
        normalizedEmployeeIds.map(
            (id) => ({
                employeeId: id,

                type,

                title:
                    title.trim(),

                message:
                    message.trim(),

                priority,

                metadata,

                read: false
            })
        );

    const result =
        await Notification.insertMany(
            notifications
        );

    return result;
};

/*
|--------------------------------------------------------------------------
| Get My Notifications
|--------------------------------------------------------------------------
|
| Employee can only access their own
| notifications.
|
*/

const getMyNotifications = async ({
    userId,
    page = 1,
    limit = 20,
    unreadOnly = false,
    type
} = {}) => {
    const employee =
        await Employee.findOne({
            user: userId
        }).select(
            "employeeId"
        );

    if (!employee) {
        throw new Error(
            "Employee profile not found"
        );
    }

    const filter = {
        employeeId:
            employee.employeeId
    };

    if (unreadOnly) {
        filter.read = false;
    }

    if (type) {
        filter.type = type;
    }

    const pageNumber =
        Math.max(
            Number(page) || 1,
            1
        );

    const limitNumber =
        Math.min(
            Math.max(
                Number(limit) || 20,
                1
            ),
            100
        );

    const skip =
        (pageNumber - 1) *
        limitNumber;

    const [
        notifications,
        total,
        unread
    ] = await Promise.all([
        Notification.find(filter)
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limitNumber),

        Notification.countDocuments(
            filter
        ),

        Notification.countDocuments({
            employeeId:
                employee.employeeId,

            read: false
        })
    ]);

    return {
        notifications,

        unreadCount:
            unread,

        pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages:
                Math.ceil(
                    total /
                    limitNumber
                )
        }
    };
};

/*
|--------------------------------------------------------------------------
| Get Notification By ID
|--------------------------------------------------------------------------
|
| Employee can only access their own
| notification.
|
*/

const getMyNotificationById = async ({
    userId,
    notificationId
}) => {
    const employee =
        await Employee.findOne({
            user: userId
        }).select(
            "employeeId"
        );

    if (!employee) {
        throw new Error(
            "Employee profile not found"
        );
    }

    const notification =
        await Notification.findOne({
            _id:
                notificationId,

            employeeId:
                employee.employeeId
        });

    if (!notification) {
        throw new Error(
            "Notification not found"
        );
    }

    return notification;
};

/*
|--------------------------------------------------------------------------
| Mark Notification As Read
|--------------------------------------------------------------------------
*/

const markAsRead = async ({
    userId,
    notificationId
}) => {
    const employee =
        await Employee.findOne({
            user: userId
        }).select(
            "employeeId"
        );

    if (!employee) {
        throw new Error(
            "Employee profile not found"
        );
    }

    const notification =
        await Notification.findOne({
            _id:
                notificationId,

            employeeId:
                employee.employeeId
        });

    if (!notification) {
        throw new Error(
            "Notification not found"
        );
    }

    notification.read =
        true;

    notification.readAt =
        new Date();

    await notification.save();

    return notification;
};

/*
|--------------------------------------------------------------------------
| Mark All Notifications As Read
|--------------------------------------------------------------------------
*/

const markAllAsRead = async (
    userId
) => {
    const employee =
        await Employee.findOne({
            user: userId
        }).select(
            "employeeId"
        );

    if (!employee) {
        throw new Error(
            "Employee profile not found"
        );
    }

    const result =
        await Notification.updateMany(
            {
                employeeId:
                    employee.employeeId,

                read: false
            },
            {
                $set: {
                    read: true,

                    readAt:
                        new Date()
                }
            }
        );

    return {
        modifiedCount:
            result.modifiedCount,

        message:
            "All notifications marked as read"
    };
};

/*
|--------------------------------------------------------------------------
| Get Unread Count
|--------------------------------------------------------------------------
*/

const getUnreadCount = async (
    userId
) => {
    const employee =
        await Employee.findOne({
            user: userId
        }).select(
            "employeeId"
        );

    if (!employee) {
        throw new Error(
            "Employee profile not found"
        );
    }

    const count =
        await Notification.countDocuments(
            {
                employeeId:
                    employee.employeeId,

                read: false
            }
        );

    return {
        unreadCount: count
    };
};

/*
|--------------------------------------------------------------------------
| Delete Notification
|--------------------------------------------------------------------------
|
| Employee can delete only their own
| notification.
|
|--------------------------------------------------------------------------
*/

const deleteMyNotification = async ({
    userId,
    notificationId
}) => {
    const employee =
        await Employee.findOne({
            user: userId
        }).select(
            "employeeId"
        );

    if (!employee) {
        throw new Error(
            "Employee profile not found"
        );
    }

    const notification =
        await Notification.findOneAndDelete(
            {
                _id:
                    notificationId,

                employeeId:
                    employee.employeeId
            }
        );

    if (!notification) {
        throw new Error(
            "Notification not found"
        );
    }

    return {
        message:
            "Notification deleted successfully"
    };
};

/*
|--------------------------------------------------------------------------
| Delete All Read Notifications
|--------------------------------------------------------------------------
*/

const deleteReadNotifications =
    async (userId) => {
        const employee =
            await Employee.findOne({
                user: userId
            }).select(
                "employeeId"
            );

        if (!employee) {
            throw new Error(
                "Employee profile not found"
            );
        }

        const result =
            await Notification.deleteMany(
                {
                    employeeId:
                        employee.employeeId,

                    read: true
                }
            );

        return {
            deletedCount:
                result.deletedCount,

            message:
                "Read notifications deleted successfully"
        };
    };

/*
|--------------------------------------------------------------------------
| Admin Get Employee Notifications
|--------------------------------------------------------------------------
|
| Admin can inspect notifications of
| a specific employee.
|
|--------------------------------------------------------------------------
*/

const getEmployeeNotifications =
    async ({
        employeeId,
        page = 1,
        limit = 20,
        unreadOnly = false
    } = {}) => {
        const employee =
            await getEmployee(
                employeeId
            );

        const filter = {
            employeeId:
                employee.employeeId
        };

        if (unreadOnly) {
            filter.read = false;
        }

        const pageNumber =
            Math.max(
                Number(page) || 1,
                1
            );

        const limitNumber =
            Math.min(
                Math.max(
                    Number(limit) || 20,
                    1
                ),
                100
            );

        const skip =
            (pageNumber - 1) *
            limitNumber;

        const [
            notifications,
            total
        ] = await Promise.all([
            Notification.find(
                filter
            )
                .sort({
                    createdAt: -1
                })
                .skip(skip)
                .limit(
                    limitNumber
                ),

            Notification.countDocuments(
                filter
            )
        ]);

        return {
            notifications,

            pagination: {
                total,
                page: pageNumber,
                limit:
                    limitNumber,
                totalPages:
                    Math.ceil(
                        total /
                        limitNumber
                    )
            }
        };
    };

/*
|--------------------------------------------------------------------------
| Leave Notification
|--------------------------------------------------------------------------
|
| Used by leave.service.js.
|--------------------------------------------------------------------------
*/

const createLeaveNotification =
    async ({
        employeeId,
        title,
        message,
        metadata = {}
    }) => {
        return createNotification({
            employeeId,

            type:
                NOTIFICATION_TYPES.LEAVE,

            title,

            message,

            priority:
                NOTIFICATION_PRIORITIES.NORMAL,

            metadata
        });
    };

/*
|--------------------------------------------------------------------------
| Payroll Notification
|--------------------------------------------------------------------------
|
| Used by payroll.service.js.
|--------------------------------------------------------------------------
*/

const createPayrollNotification =
    async ({
        employeeId,
        title,
        message,
        metadata = {}
    }) => {
        return createNotification({
            employeeId,

            type:
                NOTIFICATION_TYPES.PAYROLL,

            title,

            message,

            priority:
                NOTIFICATION_PRIORITIES.NORMAL,

            metadata
        });
    };

/*
|--------------------------------------------------------------------------
| Attendance Notification
|--------------------------------------------------------------------------
*/

const createAttendanceNotification =
    async ({
        employeeId,
        title,
        message,
        priority =
            NOTIFICATION_PRIORITIES.NORMAL,
        metadata = {}
    }) => {
        return createNotification({
            employeeId,

            type:
                NOTIFICATION_TYPES.ATTENDANCE,

            title,

            message,

            priority,

            metadata
        });
    };

/*
|--------------------------------------------------------------------------
| System Notification
|--------------------------------------------------------------------------
*/

const createSystemNotification =
    async ({
        employeeId,
        title,
        message,
        priority =
            NOTIFICATION_PRIORITIES.NORMAL,
        metadata = {}
    }) => {
        return createNotification({
            employeeId,

            type:
                NOTIFICATION_TYPES.SYSTEM,

            title,

            message,

            priority,

            metadata
        });
    };

const getAllNotifications = async ({ page = 1, limit = 20, unreadOnly = false } = {}) => {
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const filter = unreadOnly ? { read: false } : {};
    const [notifications, total] = await Promise.all([
        Notification.find(filter).sort({ createdAt: -1 }).skip((pageNumber - 1) * limitNumber).limit(limitNumber),
        Notification.countDocuments(filter)
    ]);

    return {
        notifications,
        pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber)
        }
    };
};

const deleteNotification = async (notificationId) => {
    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
        throw new Error("Notification not found");
    }

    return { message: "Notification deleted successfully" };
};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
    NOTIFICATION_TYPES,
    NOTIFICATION_PRIORITIES,

    createNotification,

    sendToEmployee,
    sendToEmployee as sendNotification,
    sendToEmployees,
    sendToEmployees as sendBulkNotification,

    getMyNotifications,
    getMyNotificationById,

    markAsRead,
    markAsRead as markNotificationAsRead,
    markAllAsRead,
    markAllAsRead as markAllNotificationsAsRead,

    getUnreadCount,

    deleteMyNotification,
    deleteReadNotifications,

    getEmployeeNotifications,
    getAllNotifications,
    deleteNotification,

    createLeaveNotification,
    createPayrollNotification,
    createAttendanceNotification,
    createSystemNotification
};
