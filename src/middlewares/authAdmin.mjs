import Admin from '../models/Admin.mjs';

// check if admin is authenticated
export const isAuthenticated = async (req, res, next) => {
    // check if session contains user ID
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // retrieve user from database 
        const admin = await Admin.findById(req.session.userId);

        // check if user exists
        if (!admin) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // attach the user object to the req 
        req.admin = admin;
        next();
        
    } catch (error) { 
        console.error('Error retrieving user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


// export const isAuthenticated = (req, res, next) => {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.status(401).json({ message: 'Unauthorized' });
// };
