const mongoSanitize = (req, res, next) => {
    const sanitize = (obj) => {
        for (let key in obj) {
            // Sanitize nested objects
            if (typeof obj[key] === "object" && obj[key] !== null) {
                sanitize(obj[key]);
                // Delete empty objects
                if (Object.keys(obj[key]).length === 0) {
                    delete obj[key];
                }
            }

            // Sanitize arrays
            if (Array.isArray(obj[key])) {
                obj[key].forEach((item) => {
                    if (typeof item === "object" && item !== null) sanitize(item);
                });
            }

            // Block $ and dots
            if (key.startsWith("$") || key.includes(".")) {
                delete obj[key];
            }
        }
    };

    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);

    next();
};

module.exports = mongoSanitize;
