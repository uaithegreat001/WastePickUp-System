/**
 * Date utilities for handling Firebase Timestamps and date formatting
 * Use these functions instead of inline timestamp conversions
 */

/**
 * Converts a Firebase Timestamp or date string to a JavaScript Date object
 * @param {Object|string|Date} timestamp - Firebase Timestamp, date string, or Date object
 * @returns {Date} JavaScript Date object
 */
export function toDate(timestamp) {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (timestamp.toDate) return timestamp.toDate(); // Firebase Timestamp
    return new Date(timestamp);
}

/**
 * Formats a timestamp to a readable date string
 * @param {Object|string|Date} timestamp - Firebase Timestamp, date string, or Date object
 * @param {Object} options - Formatting options
 * @param {boolean} options.includeTime - Include time in output (default: false)
 * @param {boolean} options.includeWeekday - Include weekday name (default: false)
 * @param {string} options.dateStyle - 'short' | 'medium' | 'long' (default: 'medium')
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp, options = {}) {
    const date = toDate(timestamp);
    if (!date) return 'N/A';

    const { 
        includeTime = false, 
        includeWeekday = false,
        dateStyle = 'medium'
    } = options;

    const formatOptions = {
        year: 'numeric',
        month: dateStyle === 'short' ? 'short' : dateStyle === 'long' ? 'long' : 'short',
        day: 'numeric',
    };

    if (includeWeekday) {
        formatOptions.weekday = 'long';
    }

    if (includeTime) {
        formatOptions.hour = '2-digit';
        formatOptions.minute = '2-digit';
    }

    return date.toLocaleDateString('en-US', formatOptions);
}

/**
 * Formats a timestamp for use in an HTML date input field (YYYY-MM-DD)
 * @param {Object|string|Date} timestamp - Firebase Timestamp, date string, or Date object
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function formatDateForInput(timestamp) {
    const date = toDate(timestamp);
    if (!date) return '';
    return date.toISOString().split('T')[0];
}

/**
 * Sorts an array of objects by their createdAt field (newest first)
 * @param {Array} array - Array of objects with createdAt field
 * @returns {Array} Sorted array (mutates original)
 */
export function sortByCreatedAt(array) {
    return array.sort((a, b) => {
        const dateA = toDate(a.createdAt);
        const dateB = toDate(b.createdAt);
        return dateB - dateA;
    });
}

/**
 * Checks if a date is today
 * @param {Object|string|Date} timestamp - Firebase Timestamp, date string, or Date object
 * @returns {boolean} True if date is today
 */
export function isToday(timestamp) {
    const date = toDate(timestamp);
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

/**
 * Checks if a date is yesterday
 * @param {Object|string|Date} timestamp - Firebase Timestamp, date string, or Date object
 * @returns {boolean} True if date is yesterday
 */
export function isYesterday(timestamp) {
    const date = toDate(timestamp);
    if (!date) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
}
