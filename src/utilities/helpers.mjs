import bcrypt from "bcrypt";

// encrypt password
export const encryptPassword = (password) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error("Password encryption failed");
  }
};

// compare password with encrypted password
export const comparePasswords = (password, hashedPassword) => {
  try {
    const isMatch = bcrypt.compareSync(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};
