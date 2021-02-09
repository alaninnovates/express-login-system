const crypto = require('crypto');

/**
 * Generate a random hex/string
 * @function
 * @param {integer} length - The length of the string you want
 * @returns {string}
 */
const genRandomString = (len: number) => {
    const str = 'ABCDEFGHIJKLMNOPQRSTUVWDYZabcdefghijklmnopqrstuvwdyz1234567890';
    let hex = '';
    for (let i=0; i<len; i++) {
        hex += str.charAt(Math.floor(Math.random() * str.length));
    }
    return hex;
}

/**
 * Hash the password
 * @function
 * @param {string} password - The password to hash
 * @param {string} salt - The salt to hash the password with
 * @returns {Object}
 */
const sha512 = (password: string, salt: string) => {
    const hash = crypto.createHmac('sha512', salt)
        .update(password)
        .digest('hex');
    return {
        salt: salt,
        passwordHash: hash
    };
};

/**
 * Generated a hashed password
 * @function
 * @param {string} userpassword - The password to hash
 * @returns {string}
 */
const hashPassword = (userpassword: string) =>  {
    const salt = genRandomString(16); 
    const passwordData = sha512(userpassword, salt);

    return `${passwordData.passwordHash}:${passwordData.salt}`;
}

/**
 * Check if the password is correct
 * @function
 * @param {string} hashedPassword - The password that is currently in the database
 * @param {string} userPassword - The password the user inputted
 * @returns {boolean}
 */
const checkPassword = (hashedPassword: string, userPassword: string) => {
    const [password, salt] = hashedPassword.split(':');
    const hash = sha512(userPassword, salt);
    return password === hash.passwordHash;
};

export {
    hashPassword,
    checkPassword
};
