export const KIIIT_EMAIL_REGEX = /^(\d{5,10}|mentor)@kiit\.ac\.in$/;
export const ROLL_NUMBER_REGEX = /^\d{5,10}$/;

export const validateKiitEmail = (email: string): boolean => {
    return KIIIT_EMAIL_REGEX.test(email.trim());
};

export const validateRollNumber = (rollNo: string): boolean => {
    return ROLL_NUMBER_REGEX.test(rollNo.trim());
};

export const extractRollNumberFromEmail = (email: string): string | null => {
    if (!validateKiitEmail(email)) return null;
    const username = email.split('@')[0];
    return /^\d+$/.test(username) ? username : null;
};

export const normalizeEmail = (email: string): string => {
    return email.trim().toLowerCase();
};
