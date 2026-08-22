const isValidDate = (date) => {
    const parsedDate = new Date(date);

    return !Number.isNaN(parsedDate.getTime());
};

const startOfDay = (date = new Date()) => {
    const result = new Date(date);

    result.setHours(0, 0, 0, 0);

    return result;
};

const endOfDay = (date = new Date()) => {
    const result = new Date(date);

    result.setHours(23, 59, 59, 999);

    return result;
};

const startOfWeek = (date = new Date()) => {
    const result = new Date(date);

    const day = result.getDay();

    const difference = day === 0 ? -6 : 1 - day;

    result.setDate(result.getDate() + difference);
    result.setHours(0, 0, 0, 0);

    return result;
};

const endOfWeek = (date = new Date()) => {
    const result = startOfWeek(date);

    result.setDate(result.getDate() + 6);
    result.setHours(23, 59, 59, 999);

    return result;
};

const startOfMonth = (date = new Date()) => {
    const result = new Date(date);

    result.setDate(1);
    result.setHours(0, 0, 0, 0);

    return result;
};

const endOfMonth = (date = new Date()) => {
    const result = new Date(date);

    result.setMonth(result.getMonth() + 1, 0);
    result.setHours(23, 59, 59, 999);

    return result;
};

const addDays = (date, days) => {
    if (!isValidDate(date)) {
        throw new Error("Invalid date");
    }

    if (!Number.isInteger(days)) {
        throw new Error("Days must be an integer");
    }

    const result = new Date(date);

    result.setDate(result.getDate() + days);

    return result;
};

const subtractDays = (date, days) => {
    return addDays(date, -days);
};

const getDateDifference = (startDate, endDate) => {
    if (
        !isValidDate(startDate) ||
        !isValidDate(endDate)
    ) {
        throw new Error("Invalid date range");
    }

    const start = startOfDay(startDate);
    const end = startOfDay(endDate);

    const difference =
        end.getTime() - start.getTime();

    return Math.floor(
        difference / (1000 * 60 * 60 * 24)
    );
};

const getLeaveDays = (startDate, endDate) => {
    const difference = getDateDifference(
        startDate,
        endDate
    );

    if (difference < 0) {
        throw new Error(
            "Leave end date cannot be before start date"
        );
    }

    return difference + 1;
};

const isSameDay = (date1, date2) => {
    if (
        !isValidDate(date1) ||
        !isValidDate(date2)
    ) {
        return false;
    }

    const first = new Date(date1);
    const second = new Date(date2);

    return (
        first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate()
    );
};

const isDateInRange = (
    date,
    startDate,
    endDate
) => {
    if (
        !isValidDate(date) ||
        !isValidDate(startDate) ||
        !isValidDate(endDate)
    ) {
        return false;
    }

    const target = startOfDay(date);
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);

    return target >= start && target <= end;
};

const formatDate = (
    date,
    locale = "en-IN"
) => {
    if (!isValidDate(date)) {
        throw new Error("Invalid date");
    }

    return new Intl.DateTimeFormat(
        locale,
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(new Date(date));
};

const formatDateTime = (
    date,
    locale = "en-IN"
) => {
    if (!isValidDate(date)) {
        throw new Error("Invalid date");
    }

    return new Intl.DateTimeFormat(
        locale,
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(new Date(date));
};

const toISOString = (date = new Date()) => {
    if (!isValidDate(date)) {
        throw new Error("Invalid date");
    }

    return new Date(date).toISOString();
};

export {
    isValidDate,
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    addDays,
    subtractDays,
    getDateDifference,
    getLeaveDays,
    isSameDay,
    isDateInRange,
    formatDate,
    formatDateTime,
    toISOString
};