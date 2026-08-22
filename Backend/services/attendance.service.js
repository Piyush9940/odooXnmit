import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import { ATTENDANCE_STATUS } from "../utils/constants.js";

const getStartOfDay = (d = new Date()) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return date;
};

const getEndOfDay = (d = new Date()) => {
    const date = new Date(d);
    date.setHours(23, 59, 59, 999);
    return date;
};

const checkIn = async (userId) => {
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
        throw new Error("Employee profile not found");
    }

    const today = getStartOfDay();
    let attendance = await Attendance.findOne({
        employee: employee._id,
        date: { $gte: today, $lte: getEndOfDay(today) }
    });

    if (attendance && attendance.checkIn) {
        throw new Error("Already checked in for today");
    }

    const now = new Date();
    if (!attendance) {
        attendance = await Attendance.create({
            employee: employee._id,
            employeeId: employee.employeeId,
            date: today,
            status: ATTENDANCE_STATUS.PRESENT,
            checkIn: now
        });
    } else {
        attendance.status = ATTENDANCE_STATUS.PRESENT;
        attendance.checkIn = now;
        await attendance.save();
    }

    return attendance;
};

const checkOut = async (userId) => {
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
        throw new Error("Employee profile not found");
    }

    const today = getStartOfDay();
    const attendance = await Attendance.findOne({
        employee: employee._id,
        date: { $gte: today, $lte: getEndOfDay(today) }
    });

    if (!attendance || !attendance.checkIn) {
        throw new Error("You must check in before checking out");
    }

    if (attendance.checkOut) {
        throw new Error("Already checked out for today");
    }

    attendance.checkOut = new Date();
    await attendance.save();
    return attendance;
};

const getMyAttendance = async ({ userId, startDate, endDate, page = 1, limit = 10, status }) => {
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
        throw new Error("Employee profile not found");
    }

    const query = { employee: employee._id };
    if (status) query.status = status;
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = getStartOfDay(startDate);
        if (endDate) query.date.$lte = getEndOfDay(endDate);
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    const attendance = await Attendance.find(query)
        .sort({ date: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

    const total = await Attendance.countDocuments(query);

    return {
        records: attendance,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        }
    };
};

const getMyAttendanceSummary = async ({ userId, startDate, endDate }) => {
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
        throw new Error("Employee profile not found");
    }

    const query = { employee: employee._id };
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = getStartOfDay(startDate);
        if (endDate) query.date.$lte = getEndOfDay(endDate);
    }

    const records = await Attendance.find(query);
    let presentDays = 0;
    let absentDays = 0;
    let halfDays = 0;
    let leaveDays = 0;
    let totalWorkingHours = 0;

    records.forEach(r => {
        if (r.status === ATTENDANCE_STATUS.PRESENT) presentDays++;
        else if (r.status === ATTENDANCE_STATUS.ABSENT) absentDays++;
        else if (r.status === ATTENDANCE_STATUS.HALF_DAY) halfDays++;
        else if (r.status === ATTENDANCE_STATUS.LEAVE) leaveDays++;
        totalWorkingHours += (r.totalWorkingHours || 0);
    });

    return {
        totalRecords: records.length,
        presentDays,
        absentDays,
        halfDays,
        leaveDays,
        totalWorkingHours: Number(totalWorkingHours.toFixed(2))
    };
};

const getEmployeeAttendance = async ({ employeeId, startDate, endDate, page = 1, limit = 10, status }) => {
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
        const error = new Error("Employee not found");
        error.statusCode = 404;
        throw error;
    }

    const query = { employee: employee._id };
    if (status) query.status = status;
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = getStartOfDay(startDate);
        if (endDate) query.date.$lte = getEndOfDay(endDate);
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    const records = await Attendance.find(query)
        .sort({ date: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

    const total = await Attendance.countDocuments(query);

    return {
        records,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        }
    };
};

const getAllAttendance = async ({ startDate, endDate, page = 1, limit = 10, employeeId, status }) => {
    const query = {};
    if (employeeId) query.employeeId = employeeId.trim().toUpperCase();
    if (status) query.status = status;
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = getStartOfDay(startDate);
        if (endDate) query.date.$lte = getEndOfDay(endDate);
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    const records = await Attendance.find(query)
        .populate("employee", "personalDetails jobDetails employeeId")
        .sort({ date: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

    const total = await Attendance.countDocuments(query);

    return {
        records,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        }
    };
};

const getAttendanceById = async (attendanceId) => {
    const attendance = await Attendance.findById(attendanceId).populate("employee");
    if (!attendance) {
        const error = new Error("Attendance record not found");
        error.statusCode = 404;
        throw error;
    }
    return attendance;
};

const updateAttendance = async (attendanceId, updateData) => {
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
        const error = new Error("Attendance record not found");
        error.statusCode = 404;
        throw error;
    }

    Object.assign(attendance, updateData);
    attendance.isModifiedByAdmin = true;
    await attendance.save();
    return attendance;
};

export {
    checkIn,
    checkOut,
    getMyAttendance,
    getMyAttendanceSummary,
    getEmployeeAttendance,
    getAllAttendance,
    getAttendanceById,
    updateAttendance
};
