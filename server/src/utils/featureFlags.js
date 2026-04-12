// In-memory feature flags with optional Redis override
const defaultFlags = {
    "beta-dashboard": false,
    "experimental-checkout": false,
    "new-course-player": false,
    "email-queue": true,
    "analytics-tracking": true,
};

let flags = { ...defaultFlags };

/**
 * Get a feature flag value
 */
export const isFeatureEnabled = (flagName) => {
    return !!flags[flagName];
};

/**
 * Set a feature flag at runtime (admin use)
 */
export const setFeatureFlag = (flagName, value) => {
    flags[flagName] = !!value;
};

/**
 * Get all feature flags
 */
export const getAllFlags = () => ({ ...flags });

/**
 * Express middleware — gates a route behind a feature flag
 */
export const featureFlag = (flagName) => {
    return (req, res, next) => {
        if (!isFeatureEnabled(flagName)) {
            return res.status(503).json({
                success: false,
                error: { code: "FEATURE_DISABLED", message: `Feature '${flagName}' is not available.` },
            });
        }
        next();
    };
};
