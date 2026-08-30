module.exports = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Request body cannot be empty' });
    }

    // Checking for some generic expected fields (flexible)
    const bodyString = JSON.stringify(req.body).toLowerCase();
    const expectedKeywords = ['age', 'income', 'debt', 'a1', 'a2', 'a3'];
    
    const hasSomeExpectedFields = expectedKeywords.some(keyword => bodyString.includes(keyword));

    if (!hasSomeExpectedFields) {
        return res.status(400).json({ 
            error: 'Request body missing expected loan feature fields (e.g., age, income, debt, etc.)' 
        });
    }

    next();
};
