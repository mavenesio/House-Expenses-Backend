import {isEqual, isAfter, formatISO} from 'date-fns';

/* returns first day of current month */
export const getFirstDayOfThisMonth = (onISO) => {
    const now = new Date();
    const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    if(onISO) return formatISO(firstDayOfThisMonth) 
    return firstDayOfThisMonth
}

/* Returns first day of the year and month */
export const getFirstDayOfMonth = (year, month, onISO) => {
    if(onISO) return formatISO(new Date(year, month, 1, 0, 0, 0))
    return new Date(year, month, 1, 0, 0, 0);
};

/* Returns true if fristDate is after second date */
export const compareDate = (firstDate, secondDate) => {
    if(isEqual(firstDate, secondDate)) return false;
    return isAfter(firstDate, secondDate);
};

/* Returns true if two dates are equals */
export const DateEquals = (firstDate, secondDate) => isEqual(firstDate, secondDate);

/* Returns ISO string from Date object */
export const getISOFromDate = (date) => formatISO(date);