let crypto;
try {
    crypto = require('crypto');
} catch (err) {
    console.log('Cannot require crypto, most likely it is disabled');
}

const genRandomString = (len) => {
    const str = 'ABCDEFGHIJKLMNOPQRSTUVWDYZabcdefghijklmnopqrstuvwdyz1234567890';
    let hex = '';
    for (i=0; i<len; i++) {
        // is to find a random hex.
        hex += str.charAt(Math.floor(Math.random() * str.length));
    }
    return hex;
}

const sha512 = (password, salt) => {
    const hash = crypto.createHmac('sha512', salt)
        .update(password)
        .digest('hex');
    return {
        salt: salt,
        passwordHash: hash
    };
};

const hashPassword = (userpassword) =>  {
    const salt = genRandomString(16); 
    const passwordData = sha512(userpassword, salt);

    return `${passwordData.passwordHash}:${passwordData.salt}`;
}

const checkPassword = (hashedPassword, userPassword) => {
    const [password, salt] = hashedPassword.split(':');
    const hash = sha512(userPassword, salt);
    return password === hash.passwordHash;
};

module.exports = {
    hashPassword,
    checkPassword
};
